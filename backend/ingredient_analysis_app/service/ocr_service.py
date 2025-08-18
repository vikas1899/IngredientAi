import os
import re
import tempfile
import logging
from paddleocr import PaddleOCR
from PIL import Image

logger = logging.getLogger(__name__)


class SpellChecker:
    """Advanced spell correction for cosmetic/skincare ingredients"""

    @staticmethod
    def correct_ingredient(ingredient):
        """Advanced spell correction with comprehensive OCR error handling"""
        if not ingredient or len(ingredient) < 2:
            return ingredient

        corrected = ingredient.lower().strip()

        # Remove excessive repeated characters (common OCR error)
        corrected = re.sub(r'(.)\1{2,}', r'\1', corrected)

        # Comprehensive spell correction dictionary
        ingredient_corrections = {
            # Sodium variants - most common OCR error
            'sodum': 'sodium', 'sodiurn': 'sodium', 'sodlum': 'sodium', 'sodiun': 'sodium',
            'sodun': 'sodium', 'sodim': 'sodium', 'soclium': 'sodium', 'socium': 'sodium',
            'sodjum': 'sodium', 'sodшm': 'sodium',

            # Panthenol variants
            'pantheno': 'panthenol', 'pantbeno': 'panthenol', 'panthen0': 'panthenol',
            'pantbenol': 'panthenol', 'panthenoI': 'panthenol',

            # Capryloyl variants
            'capryloy': 'capryloyl', 'capryl0y': 'capryloyl', 'capryioy': 'capryloyl',
            'capryloyll': 'capryloyl', 'capryl0yl': 'capryloyl',

            # Pyrrolidone variants
            'purrolidone': 'pyrrolidone', 'purrolidonc': 'pyrrolidone',
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
            'c3o': 'c30', 'cзо': 'c30', 'eo': '30', 'e0': '30', '3o': '30'
        }

        # Apply word-level corrections
        for wrong, correct in ingredient_corrections.items():
            if wrong in corrected:
                corrected = corrected.replace(wrong, correct)

        # Character-level fixes (after word corrections)
        char_fixes = {
            'rn': 'm', 'nn': 'm', 'vv': 'w', 'ii': 'll', 'cl': 'd', 'di': 'cl',
            '0': 'o', '1': 'i', '3': 'e', '5': 's', '6': 'g', '8': 'b',
            'jl': 'll', 'il': 'll', 'rj': 'n', 'ij': 'n'
        }

        for wrong_chars, correct_char in char_fixes.items():
            corrected = corrected.replace(wrong_chars, correct_char)

        # Clean up malformed text
        corrected = re.sub(r'\)\s*extract$', ' extract', corrected)
        corrected = re.sub(r'^\([^)]*\)', '', corrected).strip()
        corrected = re.sub(r'\s+', ' ', corrected).strip()

        return corrected


class OCRService:
    """Singleton OCR service with comprehensive ingredient processing"""

    _instance = None

    def __new__(cls):
        if not cls._instance:
            cls._instance = super(OCRService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if not self._initialized:
            self.ocr = PaddleOCR(
                lang='en',
                use_textline_orientation=True,
                use_doc_orientation_classify=True,
                use_doc_unwarping=True,
                text_detection_model_name="PP-OCRv5_mobile_det",
                text_recognition_model_name="PP-OCRv5_mobile_rec",
            )
            self.spell_checker = SpellChecker()
            self._initialized = True

    def extract_ingredients_from_image(self, image):
        """Main method to extract ingredients from image"""
        try:
            # Convert image to PIL if needed
            if hasattr(image, 'shape'):
                pil_img = Image.fromarray(image)
            else:
                pil_img = image

            # Save to temporary file for OCR processing
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_file:
                pil_img.save(tmp_file.name)
                temp_path = tmp_file.name

            try:
                # Run OCR
                results = self.ocr.predict(temp_path)

                # Extract text
                ingredient_texts = []
                if results and len(results) > 0:
                    result_dict = results[0]
                    if 'rec_texts' in result_dict:
                        ingredient_texts = result_dict['rec_texts']

                # Process and clean ingredients
                cleaned_ingredients = self._process_ingredients(
                    ingredient_texts)

                logger.info(
                    f"Processed {len(cleaned_ingredients)} ingredients with spell correction")

                return cleaned_ingredients

            finally:
                # Clean up temporary file
                if os.path.exists(temp_path):
                    os.unlink(temp_path)

        except Exception as e:
            logger.error(f"OCR processing error: {str(e)}")
            return []

    def _process_ingredients(self, raw_texts):
        """Complete ingredient processing pipeline"""
        all_ingredients = []

        # Step 1: Process each text segment
        for text in raw_texts:
            if not text or len(text.strip()) < 2:
                continue
            processed_ingredients = self._process_text_segment(text)
            all_ingredients.extend(processed_ingredients)

        # Step 2: Clean and spell-correct each ingredient
        cleaned_ingredients = []
        for ingredient in all_ingredients:
            cleaned = self._clean_individual_ingredient(ingredient)
            if cleaned and self._is_valid_ingredient(cleaned):
                # Apply spell correction
                corrected = self.spell_checker.correct_ingredient(cleaned)
                # Restore proper formatting
                formatted = self._format_ingredient_name(corrected)
                cleaned_ingredients.append(formatted)

        # Step 3: Consolidate and deduplicate
        return self._deduplicate_and_consolidate(cleaned_ingredients)

    def _process_text_segment(self, text):
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
            sub_ingredients = self._extract_from_complex_text(part)
            ingredients.extend(sub_ingredients)

        return ingredients

    def _extract_from_complex_text(self, text):
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

    def _clean_individual_ingredient(self, ingredient):
        """Clean individual ingredient before spell correction"""
        if not ingredient:
            return ""

        # Remove extra whitespace and punctuation
        ingredient = ' '.join(ingredient.split())
        ingredient = re.sub(r'[,;.\s]*$', '', ingredient)
        ingredient = re.sub(r'^[,;.\s]*', '', ingredient)

        return ingredient.strip()

    def _format_ingredient_name(self, ingredient):
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

    def _is_valid_ingredient(self, ingredient):
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

    def _deduplicate_and_consolidate(self, ingredients):
        """Advanced deduplication and botanical name consolidation"""
        # Step 1: Consolidate botanical fragments
        ingredients = self._consolidate_botanical_names(ingredients)

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

    def _consolidate_botanical_names(self, ingredients):
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


# Singleton instance for reuse
ocr_service = OCRService()
