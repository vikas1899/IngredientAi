import os
import re
import json
from paddleocr import PaddleOCR


class IngredientOCR:
    def __init__(self, lang='en', output_dir="output"):
        self.ocr = PaddleOCR(
            lang=lang,
            use_textline_orientation=True,
            use_doc_orientation_classify=True,
            use_doc_unwarping=True,
            text_detection_model_name="PP-OCRv5_mobile_det",
            text_recognition_model_name="PP-OCRv5_mobile_rec",
        )
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def extract_ingredients(self, image_path):
        """Returns clean ingredient list from OCR results"""
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

        # Clean and process the ingredients
        cleaned_ingredients = self.clean_ingredients(ingredient_texts)

        # Save to JSON
        self.save_ingredients_json(cleaned_ingredients, image_path)

        return cleaned_ingredients

    def clean_ingredients(self, raw_texts):
        """Clean and process the raw ingredient texts with advanced text processing"""
        all_ingredients = []

        # First pass: Extract and split text segments
        for text in raw_texts:
            if not text or len(text.strip()) < 2:
                continue

            # Clean and normalize the text
            processed_ingredients = self.process_text_segment(text)
            all_ingredients.extend(processed_ingredients)

        # Second pass: Clean individual ingredients
        cleaned_ingredients = []
        for ingredient in all_ingredients:
            cleaned = self.clean_individual_ingredient(ingredient)
            if cleaned and self.is_valid_ingredient(cleaned):
                cleaned_ingredients.append(cleaned)

        # Third pass: Remove duplicates and merge related ingredients
        final_ingredients = self.deduplicate_and_merge(cleaned_ingredients)

        return final_ingredients

    def process_text_segment(self, text):
        """Process a single text segment and extract ingredients"""
        text = text.strip()
        ingredients = []

        # Remove common prefixes
        text = re.sub(r'^(ingredients?:?\s*)', '', text, flags=re.IGNORECASE)
        text = re.sub(r'^(contains?:?\s*)', '', text, flags=re.IGNORECASE)

        # Handle different separator patterns
        separators = [',', ';', '/', '|']

        # Split by main separators
        parts = [text]
        for sep in separators:
            new_parts = []
            for part in parts:
                new_parts.extend([p.strip()
                                 for p in part.split(sep) if p.strip()])
            parts = new_parts

        # Further split complex entries
        for part in parts:
            sub_ingredients = self.extract_from_complex_text(part)
            ingredients.extend(sub_ingredients)

        return ingredients

    def extract_from_complex_text(self, text):
        """Extract ingredients from complex text patterns"""
        ingredients = []

        # Pattern 1: "Sodium PCA(and)" -> "Sodium PCA"
        text = re.sub(r'\s*\(and\)\s*$', '', text, flags=re.IGNORECASE)
        text = re.sub(r'\s*\(and\)\s*', ' ', text, flags=re.IGNORECASE)

        # Pattern 2: "HCI (and)Threonine" -> ["HCI", "Threonine"]
        and_pattern = r'(.+?)\s*\(and\)\s*(.+)'
        match = re.match(and_pattern, text, re.IGNORECASE)
        if match:
            ingredients.extend(
                [match.group(1).strip(), match.group(2).strip()])
            return ingredients

        # Pattern 3: "Acid (and) Lysine" -> ["Acid", "Lysine"]
        and_pattern2 = r'(.+?)\s+\(and\)\s+(.+)'
        match = re.match(and_pattern2, text, re.IGNORECASE)
        if match:
            ingredients.extend(
                [match.group(1).strip(), match.group(2).strip()])
            return ingredients

        # Pattern 4: Handle parenthetical information like "(Aloe Vera)"
        # Keep the main ingredient but clean parentheses
        text = re.sub(r'\s*\([^)]*\)\s*', ' ', text).strip()

        # Single ingredient after all processing
        if text:
            ingredients.append(text)

        return ingredients

    def clean_individual_ingredient(self, ingredient):
        """Clean a single ingredient name"""
        if not ingredient:
            return ""

        # Remove extra whitespace
        ingredient = ' '.join(ingredient.split())

        # Remove trailing punctuation and common suffixes
        ingredient = re.sub(r'[,;.\s]*$', '', ingredient)
        ingredient = re.sub(r'^[,;.\s]*', '', ingredient)

        # Fix common OCR errors
        corrections = {
            'Purrolidone': 'Pyrrolidone',
            'Pantheno': 'Panthenol',
            'Capryloy': 'Capryloyl',
            'HCI': 'HCl',
            'barbadensis': 'Barbadensis'
        }

        for wrong, correct in corrections.items():
            if wrong.lower() in ingredient.lower():
                ingredient = re.sub(re.escape(wrong), correct,
                                    ingredient, flags=re.IGNORECASE)

        # Capitalize first letter of each word (proper chemical naming)
        ingredient = ' '.join(word.capitalize() if not self.is_chemical_abbreviation(word) else word.upper()
                              for word in ingredient.split())

        return ingredient.strip()

    def is_chemical_abbreviation(self, word):
        """Check if word is a chemical abbreviation that should stay uppercase"""
        abbreviations = ['PCA', 'HCL', 'EDTA', 'BHT', 'BHA', 'PEG', 'PPG']
        return word.upper() in abbreviations

    def is_valid_ingredient(self, ingredient):
        """Check if the ingredient is valid and should be included"""
        if not ingredient or len(ingredient.strip()) < 2:
            return False

        # Skip pure numbers
        if ingredient.isdigit():
            return False

        # Skip single characters (likely OCR errors)
        if len(ingredient.strip()) == 1:
            return False

        # Skip common non-ingredient words
        skip_words = {
            'and', 'or', 'with', 'extract', 'water', 'aqua', 'ingredients',
            'contains', 'may', 'contain', 'derived', 'from'
        }

        # Don't skip if it's a compound ingredient
        if ingredient.lower().strip() in skip_words and ' ' not in ingredient:
            return False

        return True

    def deduplicate_and_merge(self, ingredients):
        """Remove duplicates and merge similar ingredients"""
        unique_ingredients = []
        seen = set()

        for ingredient in ingredients:
            # Create normalized key for comparison
            normalized = re.sub(r'[^\w\s]', '', ingredient.lower()).strip()
            normalized = ' '.join(normalized.split())  # Normalize whitespace

            if normalized not in seen and normalized:
                seen.add(normalized)
                unique_ingredients.append(ingredient)

        # Sort alphabetically for better readability
        return sorted(unique_ingredients)

    def save_ingredients_json(self, ingredients, image_path):
        """Save ingredients to JSON file with additional analysis"""
        try:
            # Save simple ingredient list
            output_file = os.path.join(
                self.output_dir, "ingredients_list.json")
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(ingredients, f, indent=2, ensure_ascii=False)

        except Exception as e:
            pass


if __name__ == "__main__":
    pass
