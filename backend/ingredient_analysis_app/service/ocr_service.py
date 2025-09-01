import os
import re
import json
import tempfile
import logging
from io import BytesIO
from paddleocr import PaddleOCR
from PIL import Image
from spellchecker import SpellChecker
from ..utils.cache_utils import generate_image_cache_key, redis_client

logger = logging.getLogger(__name__)


class OCRService:
    """Singleton OCR service for extracting, cleaning & spell-correcting ingredients"""

    _instance = None

    def __new__(cls):
        if not cls._instance:
            cls._instance = super(OCRService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if not self._initialized:
            # Basic OCR
            self.ocr = PaddleOCR(lang='en')
            # Initialize spell checker
            self.spell = SpellChecker(distance=1)
            self._initialized = True

    def extract_ingredients_from_image(self, image):
        """Extract ingredients from image with caching support"""
        try:
            # Convert numpy array → PIL
            if hasattr(image, 'shape'):
                pil_img = Image.fromarray(image)
            else:
                pil_img = image

            with BytesIO() as buf:
                pil_img.save(buf, format='PNG')
                image_bytes = buf.getvalue()

            # Cache lookup
            cache_key = f"ocr_ingredients:{generate_image_cache_key(image_bytes)}"
            cached_ingredients = redis_client.get(cache_key)
            if cached_ingredients:
                return json.loads(cached_ingredients)

            # Temp file for OCR
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_file:
                pil_img.save(tmp_file.name)
                temp_path = tmp_file.name

            try:
                results = self.ocr.predict(temp_path)
                ingredient_texts = []
                if results and len(results) > 0:
                    result_dict = results[0]
                    if 'rec_texts' in result_dict:
                        ingredient_texts = result_dict['rec_texts']

                cleaned_ingredients = self._process_ingredients(
                    ingredient_texts)

                if cleaned_ingredients:
                    redis_client.set(cache_key, json.dumps(
                        cleaned_ingredients), ex=604800)

                return cleaned_ingredients

            finally:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)

        except Exception as e:
            logger.error(f"OCR error: {str(e)}", exc_info=True)
            return []

    def _process_ingredients(self, raw_texts):
        """Split, clean, spell-correct, and deduplicate"""
        all_ingredients = []
        for text in raw_texts:
            if not text or len(text.strip()) < 2:
                continue
            all_ingredients.extend(self._process_text_segment(text))

        cleaned_ingredients = []
        for ingredient in all_ingredients:
            cleaned = self._clean_individual_ingredient(ingredient)
            if cleaned and self._is_valid_ingredient(cleaned):
                corrected = self._spell_correct(cleaned)
                cleaned_ingredients.append(
                    self._format_ingredient_name(corrected))

        return sorted(set(cleaned_ingredients))

    def _process_text_segment(self, text):
        """Split text by common separators"""
        text = re.sub(r'^(ingredients?:?\s*|contains?:?\s*)',
                      '', text, flags=re.IGNORECASE)
        separators = [',', ';', '/', '|', '\n']
        parts = [text]

        for sep in separators:
            new_parts = []
            for part in parts:
                new_parts.extend([p.strip()
                                 for p in part.split(sep) if p.strip()])
            parts = new_parts

        return parts

    def _clean_individual_ingredient(self, ingredient):
        """Basic cleaning of ingredient string"""
        ingredient = ' '.join(ingredient.split())
        ingredient = re.sub(r'^[,;.\s]+|[,;.\s]+$', '', ingredient)
        return ingredient.strip()

    def _spell_correct(self, ingredient):
        """Apply spell correction word by word"""
        words = ingredient.split()
        corrected_words = []
        for word in words:
            # Skip if numeric/chemical code
            if word.isupper() or any(char.isdigit() for char in word):
                corrected_words.append(word)
            else:
                corrected_words.append(self.spell.correction(word) or word)
        return ' '.join(corrected_words)

    def _format_ingredient_name(self, ingredient):
        """Capitalize words, keep chemical codes uppercase"""
        chemical_abbreviations = {'PCA', 'HCL',
                                  'EDTA', 'BHT', 'BHA', 'PEG', 'PPG'}
        words = ingredient.split()
        formatted = []
        for word in words:
            if word.upper() in chemical_abbreviations:
                formatted.append(word.upper())
            elif '-' in word and any(c.isdigit() for c in word):
                formatted.append(word.upper())
            else:
                formatted.append(word.capitalize())
        return ' '.join(formatted)

    def _is_valid_ingredient(self, ingredient):
        """Filter out too-short/noisy ingredients"""
        if not ingredient or len(ingredient) < 2 or ingredient.isdigit():
            return False
        skip_words = {'and', 'or', 'with', 'water', 'ingredients', 'contains'}
        return ingredient.lower() not in skip_words


# Singleton instance
ocr_service = OCRService()
