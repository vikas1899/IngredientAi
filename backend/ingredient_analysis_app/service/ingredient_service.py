from ..utils.cache_utils import redis_client, generate_cache_key, generate_image_cache_key
import json
import logging
import numpy as np
from PIL import Image
from .ocr_service import ocr_service
from .ai_service import ai_service
import cloudinary.uploader

logger = logging.getLogger(__name__)


class IngredientAnalysisService:
    """Main service coordinating OCR and AI analysis"""

    @staticmethod
    def analyze_image(image_file, category, user):
        try:
            image_file.seek(0)
            image_content = image_file.read()
            image_file.seek(0)

            image_hash = generate_image_cache_key(image_content)

            # Upload image to Cloudinary
            upload_result = cloudinary.uploader.upload(image_file)
            image_url = upload_result.get('url')
            public_id = upload_result.get('public_id')

            allergies, diseases = IngredientAnalysisService._get_user_medical_history(
                user)

            # Generate unique cache key
            cache_key = f"ingredient_analysis:{generate_cache_key(image_hash, category, allergies, diseases)}"

            # Check Redis cache
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)

            # Normal processing
            img = Image.open(image_file)
            img_array = np.array(img)
            extracted_ingredients = ocr_service.extract_ingredients_from_image(
                img_array)
            ingredients_text = ", ".join(
                extracted_ingredients) if extracted_ingredients else "No text detected"

            analysis_result = ai_service.analyze_ingredients(
                ingredients_text=ingredients_text,
                category=category,
                allergies=allergies,
                diseases=diseases
            )

            # Cache only successful analyses with 7-day TTL
            if not analysis_result.get('no_valid_ingredients', False):
                analysis_result["metadata"] = {
                    "extracted_ingredients": extracted_ingredients,
                    "status": "completed"
                }
                response_obj = {
                    'success': True,
                    'result': analysis_result,
                    'extracted_ingredients': extracted_ingredients,
                    'image_url': image_url,
                    'public_id': public_id
                }
                redis_client.set(cache_key, json.dumps(
                    response_obj), ex=604800)  # TTL 7 days

                return response_obj
            else:
                # Delete the uploaded image if the analysis fails
                cloudinary.uploader.destroy(public_id)
                return {
                    'success': False,
                    'error': analysis_result.get('key_advice', 'Unable to process ingredients from image'),
                    'result': analysis_result
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
