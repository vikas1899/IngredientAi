import json
import logging
import hashlib
from PIL import Image
import cloudinary.uploader
from ..utils.cache_utils import redis_client, generate_image_cache_key
from .ai_service import ai_service

logger = logging.getLogger(__name__)


class IngredientAnalysisService:
    """Main service coordinating AI analysis"""

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

            user_profile = IngredientAnalysisService._get_user_medical_history(
                user)

            # Generate unique cache key based on the full profile
            cache_key_str = image_hash + category + \
                json.dumps(user_profile, sort_keys=True)
            cache_key = f"ingredient_analysis:{hashlib.sha256(cache_key_str.encode()).hexdigest()}"

            # Check Redis cache
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)

            # Directly pass the image and the full user profile to the AI service
            analysis_result = ai_service.analyze_ingredients(
                image_file=image_file,
                category=category,
                user_profile=user_profile
            )

            # Cache only successful analyses with 7-day TTL
            if not analysis_result.get('no_valid_ingredients', False):
                analysis_result["metadata"] = {
                    "status": "completed"
                }
                response_obj = {
                    'success': True,
                    'result': analysis_result,
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
        """Extract user's full medical profile safely"""
        profile = {
            "allergies": ["No allergies specified"],
            "diseases": ["No diseases specified"],
            "age": None,
            "life_stage": "",
            "dietary_preferences": [],
            "medications": [],
            "skin_type": "",
            "health_goals": [],
            "region": ""
        }
        if hasattr(user, 'medicalhistory') and user.medicalhistory:
            history = user.medicalhistory
            profile.update({
                "allergies": [a.strip() for a in history.allergies.split(',')] if history.allergies else [],
                "diseases": [d.strip() for d in history.diseases.split(',')] if history.diseases else [],
                "age": history.age,
                "life_stage": history.life_stage,
                "dietary_preferences": [p.strip() for p in history.dietary_preferences.split(',')] if history.dietary_preferences else [],
                "medications": [m.strip() for m in history.medications.split(',')] if history.medications else [],
                "skin_type": history.skin_type,
                "health_goals": [g.strip() for g in history.health_goals.split(',')] if history.health_goals else [],
                "region": history.region
            })
        return profile

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
