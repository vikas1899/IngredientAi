import os
import json
import re
import tempfile
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import exception_handler
from paddleocr import PaddleOCR
from PIL import Image
import logging

logger = logging.getLogger(__name__)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class CustomAPIResponse:
    @staticmethod
    def success(data=None, message="Success", status_code=status.HTTP_200_OK):
        response_data = {'success': True, 'message': message}
        if data is not None:
            response_data['data'] = data
        return Response(response_data, status=status_code)

    @staticmethod
    def error(message="An error occurred", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
        response_data = {'success': False, 'message': message}
        if errors:
            response_data['errors'] = errors
        return Response(response_data, status=status_code)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        custom_response_data = {
            'success': False, 'message': 'An error occurred', 'errors': response.data}
        logger.error(f"API Error: {exc} - Context: {context}")
        response.data = custom_response_data
    return response


# Load environment variables
load_dotenv()
os.environ["LANGCHAIN_TRACING_V2"] = "true"

model = None
parser = StrOutputParser()


def get_api_keys():
    langchain_key = os.getenv("LANGCHAIN_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        raise ValueError("GROQ_API_KEY environment variable is required")
    if not langchain_key:
        raise ValueError("LANGCHAIN_API_KEY environment variable is required")
    os.environ["LANGCHAIN_API_KEY"] = langchain_key
    os.environ["GROQ_API_KEY"] = groq_key
    return groq_key, langchain_key


def get_model():
    global model
    if model is None:
        get_api_keys()
        model = ChatGroq(model="llama3-8b-8192")
    return model


# Enhanced AI Prompt for Richer Content Generation
system_template = '''You are an expert health advisor analyzing {category} ingredients for a user with:
🔴 ALLERGIES: {allergies}
🔴 MEDICAL CONDITIONS: {diseases}

RAW INGREDIENT LIST (may contain noise or OCR errors): {list_of_ingredients}

---

**STEP 1 – REFINE INGREDIENTS**
- Normalize names: correct spelling, remove duplicates, unify capitalization.
- Remove irrelevant tokens (numbers, symbols, non-ingredient words).
- Limit to the **12 most relevant ingredients**.
- This refined list is used for all analysis.

---

**STEP 2 – DETAILED PER-INGREDIENT ANALYSIS**
For each refined ingredient:
1. Determine safety status: "safe", "caution", or "danger".
2. Assign concern level: "low", "medium", "high".
3. Identify **user-specific risk** from allergies or medical conditions.
4. Provide a **concise 1-line summary** of its impact on health/skin.
5. Explain why flagged if concerning; otherwise leave empty.
6. Ensure each ingredient gets its own entry in `"ingredients"`.

---

**STEP 3 – OVERALL ANALYSIS**
- Compute aggregated safety score (0–100) and safety level.
- Provide main verdict and `should_use` boolean.
- Count total concerning ingredients.
- List max 5 serious health alerts in `"health_alerts"`.
- Suggest max 3-4 realistic, available alternatives.
- Give a **main_verdict**  in 2-4 line with human understandable language in a simple
- Give a 2-3 lines **key advice** for the user in a simple language so user can understand .
---

**STEP 4 – RESPONSE FORMATTING**
- Return ONLY JSON in the EXACT structure provided below.
- Fill all fields with meaningful, accurate, and actionable content.
- Ensure `"ingredients"` has individual entries for all refined ingredients.
- Include `"user_specific_risk": true` only if there is a real risk.
- Provide concise but informative messages in `"quick_summary"`, `"why_flagged"`, `"message"`, `"reason"`, and `"key_advice"`.
- Do not add markdown, explanations, or extra text.

---

**RESPONSE EXAMPLE STRUCTURE (DO NOT CHANGE)**
{{
    "no_valid_ingredients": false,
    "analysis_summary": {{
        "safety_score": 85,
        "safety_level": "safe",
        "should_use": true,
        "main_verdict": "Generally safe with minor concerns",
        "concern_count": 2
    }},
    "ingredients": [
        {{
            "name": "Refined Ingredient Name",
            "status": "safe | caution | danger",
            "concern_level": "low | medium | high",
            "user_specific_risk": true,
            "quick_summary": "Brief 1-line impact",
            "why_flagged": "Specific reason if concerning, else empty"
        }}
    ],
    "health_alerts": [
        {{
            "type": "allergy_match | condition_risk | interaction_warning",
            "severity": "low | medium | high",
            "message": "Short warning message",
            "ingredient": "Exact ingredient name",
            "action": "Practical user action"
        }}
    ],
    "recommendation": {{
        "verdict": "recommend | caution | avoid",
        "confidence": "high | medium | low",
        "reason": "short reason",
        "safe_to_try": true
    }},
    "alternatives": [
        {{
            "name": "Product/Brand Name",
            "why": "reason it's suggested",
            "benefit": "key benefit for user"
        }}
    ],
    "key_advice": "Most important single piece of advice for this user"
}}'''


prompt_template = ChatPromptTemplate.from_messages([
    ("system", system_template)
])


def spell_correct_ingredient(ingredient):
    """Advanced spell correction for cosmetic/skincare ingredients with comprehensive OCR error handling"""
    if not ingredient or len(ingredient) < 2:
        return ingredient

    original_ingredient = ingredient
    corrected = ingredient.lower().strip()

    # Step 1: Remove excessive repeated characters (common OCR error)
    corrected = re.sub(r'(.)\1{2,}', r'\1', corrected)

    # Step 2: Comprehensive spell correction dictionary
    ingredient_corrections = {
        # Sodium variants - most common OCR error
        'sodum': 'sodium', 'sodiurn': 'sodium', 'sodlum': 'sodium', 'sodiun': 'sodium',
        'sodun': 'sodium', 'sodim': 'sodium', 'soclium': 'sodium', 'socium': 'sodium',
        'sodiurn': 'sodium', 'sodjum': 'sodium', 'sodшm': 'sodium',

        # Panthenol variants
        'pantheno': 'panthenol', 'pantbeno': 'panthenol', 'panthen0': 'panthenol',
        'panthenol': 'panthenol', 'pantbenol': 'panthenol', 'panthenoI': 'panthenol',

        # Capryloyl variants
        'capryloy': 'capryloyl', 'capryl0y': 'capryloyl', 'capryioy': 'capryloyl',
        'capryloyl': 'capryloyl', 'capryloyll': 'capryloyl', 'capryl0yl': 'capryloyl',

        # Pyrrolidone variants
        'purrolidone': 'pyrrolidone', 'purrolidonc': 'pyrrolidone', 'pyrroliclone': 'pyrrolidone',
        'pyrroliclone': 'pyrrolidone', 'pyrrolidоne': 'pyrrolidone',

        # Common skincare ingredients
        'barbadensis': 'barbadensis', 'barbadensls': 'barbadensis', 'barbadensjs': 'barbadensis',
        'tocopherol': 'tocopherol', 't0copherol': 'tocopherol', 'tocopber0l': 'tocopherol',
        'retinol': 'retinol', 'retln0l': 'retinol', 'retin0l': 'retinol',
        'niacinamide': 'niacinamide', 'niacinamicle': 'niacinamide', 'nlacinamide': 'niacinamide',
        'salicylic': 'salicylic', 'sallcylic': 'salicylic', 'salicyllc': 'salicylic',
        'hyaluronic': 'hyaluronic', 'byaluronic': 'hyaluronic', 'hyalur0nic': 'hyaluronic',

        # Basic ingredients
        'glycerin': 'glycerin', 'glycerln': 'glycerin', 'giycerin': 'glycerin', 'glycerine': 'glycerin',
        'ceramide': 'ceramide', 'ceramlde': 'ceramide', 'cerarnide': 'ceramide',
        'peptide': 'peptide', 'peptlde': 'peptide', 'pептide': 'peptide',
        'aqua': 'aqua', 'agua': 'aqua', 'aqva': 'aqua', 'aqya': 'aqua',
        'chloride': 'chloride', 'chioride': 'chloride', 'chlorlde': 'chloride',
        'paraben': 'paraben', 'parabcn': 'paraben', 'parasен': 'paraben',
        'sulfate': 'sulfate', 'suifate': 'sulfate', 'sulphate': 'sulfate', 'suliate': 'sulfate',
        'glycol': 'glycol', 'giycol': 'glycol', 'glyсol': 'glycol',
        'alcohol': 'alcohol', 'aicohol': 'alcohol', 'alcohoI': 'alcohol', 'alcobol': 'alcohol',
        'extract': 'extract', 'cxtract': 'extract', 'extгact': 'extract', 'exiract': 'extract',

        # Acids
        'citric': 'citric', 'cltric': 'citric', 'citгic': 'citric', 'cjtric': 'citric',
        'ascorbic': 'ascorbic', 'ascorblc': 'ascorbic', 'ascorbіc': 'ascorbic',
        'stearic': 'stearic', 'stcarlc': 'stearic', 'stearіc': 'stearic',
        'palmitic': 'palmitic', 'palmitlc': 'palmitic', 'palmіtic': 'palmitic',
        'oleic': 'oleic', '0leic': 'oleic', 'olelc': 'oleic', 'oleіc': 'oleic',
        'linoleic': 'linoleic', 'llnoleic': 'linoleic', 'linolеic': 'linoleic',

        # Preservatives
        'phenoxyethanol': 'phenoxyethanol', 'phen0xyethanol': 'phenoxyethanol',
        'phenoxyetbanol': 'phenoxyethanol', 'phenoxyethanoI': 'phenoxyethanol',
        'benzyl': 'benzyl', 'benzyI': 'benzyl', 'bеnzyl': 'benzyl', 'benzyi': 'benzyl',
        'fragrance': 'fragrance', 'fragrаnce': 'fragrance', 'fragranсe': 'fragrance',
        'parfum': 'parfum', 'partiim': 'parfum', 'рarfum': 'parfum',

        # Chemical abbreviations
        'hci': 'hcl', 'hcі': 'hcl', 'нcl': 'hcl', 'hcj': 'hcl',
        'edta': 'edta', 'еdta': 'edta', 'edтa': 'edta', 'eclta': 'edta',
        'bht': 'bht', 'вht': 'bht', 'bнt': 'bht', 'bjt': 'bht',
        'bha': 'bha', 'вha': 'bha', 'bнa': 'bha', 'bja': 'bha',
        'peg': 'peg', 'рeg': 'peg', 'peг': 'peg', 'pеg': 'peg',
        'ppg': 'ppg', 'рpg': 'ppg', 'ppг': 'ppg', 'ppq': 'ppg',
        'pca': 'pca', 'рca': 'pca', 'pcа': 'pca',

        # Botanical names
        'aloe': 'aloe', 'al0e': 'aloe', 'aIoe': 'aloe', 'ajoe': 'aloe',
        'vera': 'vera', 'vегa': 'vera', 'verа': 'vera', 'vеra': 'vera',
        'chamomilla': 'chamomilla', 'charnomilla': 'chamomilla', 'chamomiІla': 'chamomilla',
        'calendula': 'calendula', 'calеndula': 'calendula', 'calenduІa': 'calendula',
        'lavandula': 'lavandula', 'lavаndula': 'lavandula', 'lavanduІa': 'lavandula',
        'rosmarinus': 'rosmarinus', 'rosmaгinus': 'rosmarinus', 'rosmarіnus': 'rosmarinus',
        'officinalis': 'officinalis', '0fficinalis': 'officinalis', 'officіnalis': 'officinalis',

        # OCR number/letter confusions
        'cio': 'c10', 'ci0': 'c10', 'c1o': 'c10', 'cjo': 'c10',
        'c3o': 'c30', 'c30': 'c30', 'cзо': 'c30',
        'eo': '30', 'e0': '30', '3o': '30'
    }

    # Apply word-level corrections
    for wrong, correct in ingredient_corrections.items():
        if wrong in corrected:
            corrected = corrected.replace(wrong, correct)

    # Step 3: Character-level fixes (after word corrections)
    char_fixes = {
        'rn': 'm', 'nn': 'm', 'vv': 'w', 'ii': 'll', 'cl': 'd', 'di': 'cl',
        '0': 'o', '1': 'i', '3': 'e', '5': 's', '6': 'g', '8': 'b',
        'jl': 'll', 'il': 'll', 'rj': 'n', 'ij': 'n'
    }

    for wrong_chars, correct_char in char_fixes.items():
        corrected = corrected.replace(wrong_chars, correct_char)

    # Step 4: Clean up malformed text
    corrected = re.sub(r'\)\s*extract$', ' extract', corrected)
    corrected = re.sub(r'^\([^)]*\)', '', corrected).strip()
    corrected = re.sub(r'\s+', ' ', corrected).strip()

    return corrected


class IngredientOCR:
    """Advanced PaddleOCR-based ingredient extractor with spell correction and consolidation"""

    def __init__(self, lang='en'):
        self.ocr = PaddleOCR(
            lang=lang,
            use_textline_orientation=True,
            use_doc_orientation_classify=True,
            use_doc_unwarping=True,
            text_detection_model_name="PP-OCRv5_mobile_det",
            text_recognition_model_name="PP-OCRv5_mobile_rec",
        )

    def extract_ingredients(self, image_path):
        """Extract and process ingredients from image with full spell correction pipeline"""
        results = self.ocr.predict(image_path)

        ingredient_texts = []
        if results and len(results) > 0:
            result_dict = results[0]
            if 'rec_texts' in result_dict:
                ingredient_texts = result_dict['rec_texts']
            else:
                return []
        else:
            return []

        return self.clean_ingredients(ingredient_texts)

    def clean_ingredients(self, raw_texts):
        """Complete ingredient processing pipeline with spell correction"""
        all_ingredients = []

        # Step 1: Process each text segment
        for text in raw_texts:
            if not text or len(text.strip()) < 2:
                continue
            processed_ingredients = self.process_text_segment(text)
            all_ingredients.extend(processed_ingredients)

        # Step 2: Clean and spell-correct each ingredient
        cleaned_ingredients = []
        for ingredient in all_ingredients:
            cleaned = self.clean_individual_ingredient(ingredient)
            if cleaned and self.is_valid_ingredient(cleaned):
                # Apply spell correction
                corrected = spell_correct_ingredient(cleaned)
                # Restore proper formatting
                formatted = self.format_ingredient_name(corrected)
                cleaned_ingredients.append(formatted)

        # Step 3: Consolidate fragments and remove duplicates
        return self.deduplicate_and_consolidate(cleaned_ingredients)

    def process_text_segment(self, text):
        """Extract individual ingredients from text segments"""
        text = text.strip()

        # Remove common prefixes
        text = re.sub(r'^(ingredients?:?\s*)', '', text, flags=re.IGNORECASE)
        text = re.sub(r'^(contains?:?\s*)', '', text, flags=re.IGNORECASE)

        # Split by common separators
        separators = [',', ';', '/', '|', '\n']
        parts = [text]
        for sep in separators:
            new_parts = []
            for part in parts:
                new_parts.extend([p.strip()
                                 for p in part.split(sep) if p.strip()])
            parts = new_parts

        # Process complex patterns
        ingredients = []
        for part in parts:
            sub_ingredients = self.extract_from_complex_text(part)
            ingredients.extend(sub_ingredients)

        return ingredients

    def extract_from_complex_text(self, text):
        """Handle complex text patterns and parentheses"""
        # Handle "(and)" patterns
        text = re.sub(r'\s*\(and\)\s*$', '', text, flags=re.IGNORECASE)

        # Pattern matching for "ingredient (and) ingredient"
        and_patterns = [
            r'(.+?)\s*\(and\)\s*(.+)',
            r'(.+?)\s+\(and\)\s+(.+)'
        ]

        for pattern in and_patterns:
            match = re.match(pattern, text, re.IGNORECASE)
            if match:
                return [match.group(1).strip(), match.group(2).strip()]

        # Clean parenthetical information
        text = re.sub(r'\s*\([^)]*\)\s*', ' ', text).strip()

        return [text] if text else []

    def clean_individual_ingredient(self, ingredient):
        """Clean individual ingredient before spell correction"""
        if not ingredient:
            return ""

        # Remove extra whitespace and punctuation
        ingredient = ' '.join(ingredient.split())
        ingredient = re.sub(r'[,;.\s]*$', '', ingredient)
        ingredient = re.sub(r'^[,;.\s]*', '', ingredient)

        return ingredient.strip()

    def format_ingredient_name(self, ingredient):
        """Apply proper capitalization after spell correction"""
        if not ingredient:
            return ingredient

        # Chemical abbreviations that should be uppercase
        chemical_abbreviations = ['PCA', 'HCL', 'EDTA',
                                  'BHT', 'BHA', 'PEG', 'PPG', 'C10', 'C30']

        words = ingredient.split()
        formatted_words = []

        for word in words:
            if word.upper() in chemical_abbreviations:
                formatted_words.append(word.upper())
            elif '-' in word and any(c.isdigit() for c in word):
                # Handle chemical codes like C10-30
                formatted_words.append(word.upper())
            else:
                formatted_words.append(word.capitalize())

        return ' '.join(formatted_words)

    def is_valid_ingredient(self, ingredient):
        """Validate ingredient before processing"""
        if not ingredient or len(ingredient.strip()) < 2:
            return False
        if ingredient.isdigit() or len(ingredient.strip()) == 1:
            return False

        # Skip meaningless fragments
        skip_words = {
            'and', 'or', 'with', 'water', 'ingredients', 'contains',
            'may', 'contain', 'derived', 'from', 'acid', 'extract',
            'flower', 'hd', 'leaf'
        }

        ingredient_lower = ingredient.lower().strip()
        if ingredient_lower in skip_words and ' ' not in ingredient:
            return False

        return True

    def deduplicate_and_consolidate(self, ingredients):
        """Advanced deduplication and botanical name consolidation"""
        # Step 1: Consolidate botanical fragments
        ingredients = self.consolidate_botanical_names(ingredients)

        # Step 2: Remove duplicates
        unique_ingredients = []
        seen = set()

        for ingredient in ingredients:
            # Normalize for comparison
            normalized = re.sub(r'[^\w\s]', '', ingredient.lower()).strip()
            normalized = ' '.join(normalized.split())

            if normalized not in seen and normalized and len(normalized) > 1:
                seen.add(normalized)
                unique_ingredients.append(ingredient)

        return sorted(unique_ingredients)

    def consolidate_botanical_names(self, ingredients):
        """Consolidate fragmented botanical and compound names"""
        consolidated = []
        ingredient_lower = [ing.lower().strip() for ing in ingredients]

        # Botanical consolidation patterns
        botanical_consolidations = [
            {
                'fragments': ['aloe', 'barbadensis', 'vera'],
                'result': 'Aloe Barbadensis (Vera) Extract',
                'partial': [('aloe', 'vera'), 'Aloe Vera Extract']
            },
            {
                'fragments': ['calendula', 'officinalis'],
                'result': 'Calendula Officinalis Extract'
            },
            {
                'fragments': ['chamomilla', 'recutita'],
                'result': 'Chamomilla Recutita Extract'
            }
        ]

        used_indices = set()

        # Process botanical consolidations
        for consolidation in botanical_consolidations:
            fragments = consolidation['fragments']
            result = consolidation['result']

            # Check if all fragments are present
            fragment_indices = []
            for fragment in fragments:
                for i, ing in enumerate(ingredient_lower):
                    if i not in used_indices and fragment in ing:
                        fragment_indices.append(i)
                        break

            # If all fragments found, consolidate
            if len(fragment_indices) == len(fragments):
                consolidated.append(result)
                used_indices.update(fragment_indices)
            # Check for partial matches if defined
            elif 'partial' in consolidation:
                partial_fragments, partial_result = consolidation['partial']
                partial_indices = []
                for fragment in partial_fragments:
                    for i, ing in enumerate(ingredient_lower):
                        if i not in used_indices and fragment in ing:
                            partial_indices.append(i)
                            break

                if len(partial_indices) == len(partial_fragments):
                    consolidated.append(partial_result)
                    used_indices.update(partial_indices)

        # Add remaining non-consolidated ingredients
        for i, ingredient in enumerate(ingredients):
            if i not in used_indices:
                ingredient = ingredient.strip()

                # Skip very short or meaningless fragments
                if len(ingredient) < 2:
                    continue

                # Clean up malformed extracts
                if ')' in ingredient and 'extract' in ingredient.lower():
                    ingredient = re.sub(
                        r'\s*\)\s*[Ee]xtract$', ' Extract', ingredient)
                    ingredient = re.sub(r'^\([^)]*\s*', '', ingredient)

                consolidated.append(ingredient)

        return consolidated


class OCRReader:
    """Singleton PaddleOCR reader with comprehensive ingredient processing"""
    _instance = None

    def __new__(cls):
        if not cls._instance:
            cls._instance = super(OCRReader, cls).__new__(cls)
            cls._instance.ingredient_extractor = IngredientOCR(lang='en')
        return cls._instance

    def read_text(self, img):
        """Extract ingredients from image with full processing pipeline"""
        try:
            # Convert numpy array to PIL Image if needed
            if hasattr(img, 'shape'):
                pil_img = Image.fromarray(img)
            else:
                pil_img = img

            # Save to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_file:
                pil_img.save(tmp_file.name)
                temp_path = tmp_file.name

            try:
                # Extract and process ingredients
                ingredients = self.ingredient_extractor.extract_ingredients(
                    temp_path)

                # Log results for debugging
                logger.info(
                    f"Processed {len(ingredients)} ingredients with spell correction")
                for ingredient in ingredients:
                    logger.debug(f"Processed ingredient: {ingredient}")

                # Return in expected format
                return [[None, ingredient, 0.9] for ingredient in ingredients]

            finally:
                # Clean up temporary file
                if os.path.exists(temp_path):
                    os.unlink(temp_path)

        except Exception as e:
            logger.error(f"OCR processing error: {str(e)}")
            return []


# Create singleton instance
ocr_reader = OCRReader()


def parse_ai_response(ai_response):
    """Parse AI response with comprehensive error handling"""
    try:
        return json.loads(ai_response)
    except json.JSONDecodeError:
        try:
            # Extract JSON from response
            start_idx = ai_response.find('{')
            end_idx = ai_response.rfind('}')
            if start_idx != -1 and end_idx != -1:
                json_str = ai_response[start_idx:end_idx + 1]
                return json.loads(json_str)
        except:
            pass

        # Return error response
        return {
            "no_valid_ingredients": True,
            "analysis_summary": {
                "safety_score": 0,
                "safety_level": "unknown",
                "should_use": False,
                "main_verdict": "Analysis failed - unable to process image",
                "concern_count": 1
            },
            "ingredients": [],
            "health_alerts": [
                {
                    "type": "processing_error",
                    "severity": "high",
                    "message": "Could not process the ingredient image clearly",
                    "ingredient": "N/A",
                    "action": "Retake photo with better lighting"
                }
            ],
            "recommendation": {
                "verdict": "avoid",
                "confidence": "low",
                "reason": "Unable to analyze due to image processing error",
                "safe_to_try": False
            },
            "alternatives": [],
            "key_advice": "Please retake the photo with better lighting and ensure ingredient list is clearly visible"
        }
