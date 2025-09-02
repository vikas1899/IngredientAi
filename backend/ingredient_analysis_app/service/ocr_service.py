import os
import re
import json
import tempfile
import logging
from io import BytesIO
from paddleocr import PaddleOCR
from PIL import Image
from ..utils.cache_utils import generate_image_cache_key, redis_client

logger = logging.getLogger(__name__)


class OCRService:
    """Singleton OCR service with comprehensive ingredient text extraction and cleaning."""

    _instance = None

    def __new__(cls):
        """
        Ensure only one instance of OCRService exists (Singleton pattern).
        This avoids multiple heavy OCR model loads in memory.
        """
        if not cls._instance:
            cls._instance = super(OCRService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        """
        Initialize the PaddleOCR engine once.
        Using lightweight PP-OCRv5 models for detection and recognition.
        """
        if not self._initialized:
            self.ocr = PaddleOCR(
                lang='en',
                use_textline_orientation=True,
                use_doc_orientation_classify=True,
                use_doc_unwarping=True,
                text_detection_model_name="PP-OCRv5_mobile_det",
                text_recognition_model_name="PP-OCRv5_mobile_rec",
            )
            self._initialized = True

    def extract_ingredients_from_image(self, image):
        """
        Main method:
        - Converts image to PNG bytes
        - Checks Redis cache
        - Runs OCR if not cached
        - Processes and cleans recognized ingredients
        - Caches result for 7 days
        """
        try:
            # Handle both numpy arrays and PIL Images
            if hasattr(image, 'shape'):  # numpy array input
                pil_img = Image.fromarray(image)
            else:
                pil_img = image

            # Convert to PNG bytes for hashing and caching
            with BytesIO() as buf:
                pil_img.save(buf, format='PNG')
                image_bytes = buf.getvalue()

            # Generate unique cache key from image bytes
            cache_key = f"ocr_ingredients:{generate_image_cache_key(image_bytes)}"
            cached_ingredients = redis_client.get(cache_key)
            if cached_ingredients:
                logger.info("Returning cached OCR ingredients")
                return json.loads(cached_ingredients)

            # Save temporary image for OCR processing
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_file:
                pil_img.save(tmp_file.name)
                temp_path = tmp_file.name

            try:
                # Run OCR prediction
                results = self.ocr.predict(temp_path)

                # Extract recognized text lines
                ingredient_texts = []
                if results and len(results) > 0:
                    result_dict = results[0]
                    if 'rec_texts' in result_dict:
                        ingredient_texts = result_dict['rec_texts']

                # Process, clean, and deduplicate ingredients
                cleaned_ingredients = self._process_ingredients(
                    ingredient_texts)
                cleaned_ingredients = sorted(cleaned_ingredients)

                # Cache result in Redis (7 days TTL)
                if cleaned_ingredients:
                    redis_client.set(cache_key, json.dumps(
                        cleaned_ingredients), ex=604800)

                logger.info(
                    f"Processed {len(cleaned_ingredients)} ingredients")

                return cleaned_ingredients

            finally:
                # Ensure temp file is deleted
                if os.path.exists(temp_path):
                    os.unlink(temp_path)

        except Exception as e:
            logger.error(f"OCR processing error: {str(e)}")
            return []

    def _process_ingredients(self, raw_texts):
        """
        Process OCR text outputs:
        1. Split into ingredients
        2. Clean and validate
        3. Format names and deduplicate
        """
        all_ingredients = []

        # Extract potential ingredients from each text block
        for text in raw_texts:
            if not text or len(text.strip()) < 2:
                continue
            processed_ingredients = self._process_text_segment(text)
            all_ingredients.extend(processed_ingredients)

        cleaned_ingredients = []
        for ingredient in all_ingredients:
            cleaned = self._clean_individual_ingredient(ingredient)
            if cleaned and self._is_valid_ingredient(cleaned):
                # Placeholder for spell correction (can be integrated later)
                corrected = cleaned
                formatted = self._format_ingredient_name(corrected)
                cleaned_ingredients.append(formatted)

        return self._deduplicate_and_consolidate(cleaned_ingredients)

    def _process_text_segment(self, text):
        """
        Clean and split text into individual ingredients
        - Remove "Ingredients:" or "Contains:"
        - Split by separators like commas, semicolons, slashes
        - Handle parenthesis patterns
        """
        text = text.strip()
        text = re.sub(r'^(ingredients?:?\s*)', '', text, flags=re.IGNORECASE)
        text = re.sub(r'^(contains?:?\s*)', '', text, flags=re.IGNORECASE)

        separators = [',', ';', '/', '|', '\n']
        parts = [text]
        for sep in separators:
            new_parts = []
            for part in parts:
                new_parts.extend([p.strip()
                                 for p in part.split(sep) if p.strip()])
            parts = new_parts

        ingredients = []
        for part in parts:
            sub_ingredients = self._extract_from_complex_text(part)
            ingredients.extend(sub_ingredients)

        return ingredients

    def _extract_from_complex_text(self, text):
        """
        Handle complex ingredient patterns:
        - "(and)" usage
        - Parenthetical extra info
        """
        text = re.sub(r'\s*\(and\)\s*$', '', text, flags=re.IGNORECASE)

        and_patterns = [
            r'(.+?)\s*\(and\)\s*(.+)',
            r'(.+?)\s+\(and\)\s+(.+)'
        ]

        for pattern in and_patterns:
            match = re.match(pattern, text, re.IGNORECASE)
            if match:
                return [match.group(1).strip(), match.group(2).strip()]

        # Remove parenthetical notes (e.g. "Sugar (raw)")
        text = re.sub(r'\s*\([^)]*\)\s*', ' ', text).strip()

        return [text] if text else []

    def _clean_individual_ingredient(self, ingredient):
        """
        Clean a single ingredient string:
        - Remove trailing/leading punctuation
        - Normalize spaces
        """
        if not ingredient:
            return ""
        ingredient = ' '.join(ingredient.split())
        ingredient = re.sub(r'[,;.\s]*$', '', ingredient)
        ingredient = re.sub(r'^[,;.\s]*', '', ingredient)
        return ingredient.strip()

    def _format_ingredient_name(self, ingredient):
        """
        Format ingredient names:
        - Capitalize normal words
        - Keep chemical abbreviations in uppercase
        """
        if not ingredient:
            return ingredient

        chemical_abbreviations = ['PCA', 'HCL', 'EDTA',
                                  'BHT', 'BHA', 'PEG', 'PPG', 'C10', 'C30']

        words = ingredient.split()
        formatted_words = []

        for word in words:
            if word.upper() in chemical_abbreviations:
                formatted_words.append(word.upper())
            elif '-' in word and any(c.isdigit() for c in word):
                formatted_words.append(word.upper())  # e.g. C10-30
            else:
                formatted_words.append(word.capitalize())

        return ' '.join(formatted_words)

    def _is_valid_ingredient(self, ingredient):
        """
        Validate ingredient:
        - Skip very short or meaningless fragments
        - Exclude filler words
        """
        if not ingredient or len(ingredient.strip()) < 2:
            return False
        if ingredient.isdigit() or len(ingredient.strip()) == 1:
            return False

        skip_words = {
            'and', 'or', 'with', 'ingredients', 'contains',
            'may', 'contain', 'derived', 'from', 'acid', 'extract',
            'flower', 'hd', 'leaf'
        }
        ingredient_lower = ingredient.lower().strip()
        if ingredient_lower in skip_words and ' ' not in ingredient:
            return False

        return True

    def _deduplicate_and_consolidate(self, ingredients):
        """
        Deduplicate and consolidate ingredient list:
        - Merge botanical fragments into full names
        - Remove duplicates using normalized keys
        """
        ingredients = self._consolidate_botanical_names(ingredients)

        unique_ingredients = []
        seen = set()

        for ingredient in ingredients:
            normalized = re.sub(r'[^\w\s]', '', ingredient.lower()).strip()
            normalized = ' '.join(normalized.split())

            if normalized not in seen and normalized and len(normalized) > 1:
                seen.add(normalized)
                unique_ingredients.append(ingredient)

        return sorted(unique_ingredients)

    def _consolidate_botanical_names(self, ingredients):
        """
        Merge fragmented botanical names into standardized full extracts.
        Example: "Aloe", "Vera" -> "Aloe Vera Extract"
        """
        consolidated = []
        ingredient_lower = [ing.lower().strip() for ing in ingredients]

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

        # Perform consolidation
        for consolidation in botanical_consolidations:
            fragments = consolidation['fragments']
            result = consolidation['result']

            fragment_indices = []
            for fragment in fragments:
                for i, ing in enumerate(ingredient_lower):
                    if i not in used_indices and fragment in ing:
                        fragment_indices.append(i)
                        break

            if len(fragment_indices) == len(fragments):
                consolidated.append(result)
                used_indices.update(fragment_indices)
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

        # Add leftover ingredients
        for i, ingredient in enumerate(ingredients):
            if i not in used_indices:
                ingredient = ingredient.strip()
                if len(ingredient) < 2:
                    continue
                if ')' in ingredient and 'extract' in ingredient.lower():
                    ingredient = re.sub(
                        r'\s*\)\s*[Ee]xtract$', ' Extract', ingredient)
                    ingredient = re.sub(r'^\([^)]*\s*', '', ingredient)
                consolidated.append(ingredient)

        return consolidated


# Singleton instance for reuse
ocr_service = OCRService()
