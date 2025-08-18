import json
import logging
import numpy as np
from PIL import Image
from .ocr_service import ocr_service
from .ai_service import ai_service

logger = logging.getLogger(__name__)


class IngredientAnalysisService:
    """Main service coordinating OCR and AI analysis"""

    @staticmethod
    def analyze_image(image_file, category, user):
        """
        Complete ingredient analysis pipeline

        Args:
            image_file: Uploaded image file
            category: Product category (skincare, cosmetics, etc.)
            user: Django user instance

        Returns:
            dict: Analysis result or error information
        """
        try:
            # Step 1: Extract user medical history
            allergies, diseases = IngredientAnalysisService._get_user_medical_history(
                user)

            # Step 2: Process image with OCR
            img = Image.open(image_file)
            img_array = np.array(img)

            # Extract ingredients using OCR service
            extracted_ingredients = ocr_service.extract_ingredients_from_image(
                img_array)

            # Convert OCR results to text format
            ingredients_text = ", ".join(
                extracted_ingredients) if extracted_ingredients else "No text detected"

            logger.info(f"Extracted ingredients: {ingredients_text}")

            # Step 3: AI Analysis
            analysis_result = ai_service.analyze_ingredients(
                ingredients_text=ingredients_text,
                category=category,
                allergies=allergies,
                diseases=diseases
            )

            # Step 4: Check for analysis failure
            if analysis_result.get('no_valid_ingredients', False):
                return {
                    'success': False,
                    'error': analysis_result.get('key_advice', 'Unable to process ingredients from image'),
                    'result': analysis_result
                }

            # Step 5: Add metadata for successful analysis
            analysis_result["metadata"] = {
                "extracted_ingredients": extracted_ingredients,
                "status": "completed"
            }

            return {
                'success': True,
                'result': analysis_result,
                'extracted_ingredients': extracted_ingredients
            }

        except Exception as e:
            logger.error(f"Ingredient analysis error: {str(e)}")
            return {
                'success': False,
                'error': f'Processing failed: {str(e)}',
                'result': None
            }

    @staticmethod
    def _get_user_medical_history(user):
        """Extract user's medical history safely"""
        try:
            if hasattr(user, 'medicalhistory') and user.medicalhistory:
                allergies = user.medicalhistory.allergies.split(
                    ',') if user.medicalhistory.allergies else ["No allergy"]
                diseases = user.medicalhistory.diseases.split(
                    ',') if user.medicalhistory.diseases else ["No disease"]
            else:
                allergies = ["No allergy"]
                diseases = ["No disease"]
        except Exception as e:
            logger.warning(f"Could not retrieve medical history: {str(e)}")
            allergies = ["No allergy"]
            diseases = ["No disease"]

        return allergies, diseases

    @staticmethod
    def get_analysis_summary(analysis_result):
        """Extract key summary information from analysis result"""
        if not analysis_result or not analysis_result.get('success'):
            return None

        result = analysis_result.get('result', {})

        return {
            'safety_score': result.get('analysis_summary', {}).get('safety_score', 0),
            'safety_level': result.get('analysis_summary', {}).get('safety_level', 'unknown'),
            'should_use': result.get('analysis_summary', {}).get('should_use', False),
            'main_verdict': result.get('analysis_summary', {}).get('main_verdict', 'No verdict available'),
            'concern_count': result.get('analysis_summary', {}).get('concern_count', 0),
            'key_advice': result.get('key_advice', 'No advice available')
        }


# Service instance
ingredient_analysis_service = IngredientAnalysisService()
