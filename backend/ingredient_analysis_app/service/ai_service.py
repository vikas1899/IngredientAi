import json
import logging
import sys
from pathlib import Path
import google.generativeai as genai
from PIL import Image

# Add the parent directory to the path to import config module
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from config.configuration import GEMINI_API_KEY

logger = logging.getLogger(__name__)


class AIAnalysisService:
    """Service for AI-powered ingredient analysis using Google Gemini"""

    _instance = None

    def __new__(cls):
        if not cls._instance:
            cls._instance = super(AIAnalysisService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if not self._initialized:
            self.model = None
            self.prompt_template = self._create_prompt_template()
            self._initialized = True

    def _get_api_key(self):
        """Validate and set Gemini API key"""
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        genai.configure(api_key=GEMINI_API_KEY)
        return GEMINI_API_KEY

    def _get_model(self):
        """Get or create the Gemini model instance"""
        if self.model is None:
            self._get_api_key()
            self.model = genai.GenerativeModel('gemini-2.0-flash')
        return self.model

    def _create_prompt_template(self):
        """Create the prompt template for ingredient analysis"""
        system_template = """You are an expert health advisor and food scientist. Analyze the ingredients from the attached image for a user with the following health profile:
        - AGE: {age}
        - LIFE STAGE: {life_stage}
        - ALLERGIES: {allergies}
        - MEDICAL CONDITIONS: {diseases}
        - DIETARY PREFERENCES: {dietary_preferences}
        - CURRENT MEDICATIONS: {medications}
        - SKIN TYPE: {skin_type}
        - HEALTH GOALS: {health_goals}
        - REGION: {region}
        - PRODUCT CATEGORY: {category}

        **Instructions:**

        1.  **Extract & Refine**: Identify all ingredients, correct OCR errors, normalize names, and remove duplicates.
        2.  **Filter**: Exclude common, low-impact ingredients (like Water, Salt) unless they are relevant to a specific medical condition (e.g., Salt for hypertension).
        3.  **Group & Consolidate**: Group the filtered ingredients into logical categories. **Crucially, consolidate similar items.** For example, instead of listing four different acidity regulators, create one entry for "Acidity Regulators" and list the specific types (331, 332, etc.) within its details.
        4.  **Detailed Analysis**: For each consolidated group or significant ingredient, determine its purpose, safety, and relevance to the user's profile.
        5.  **Holistic Summary**: Provide a detailed, narrative explanation of the product as a whole, considering how the ingredient groups work together and impact the user's health goals.
        6.  ** Concern Count**: First analyze all ingredinets and then based on flaged ingredients give the concern count 
        7.  **JSON Output**: Format the entire analysis as a single, clean JSON object with the exact structure provided below. Do not include any text, markdown, or explanations outside of the JSON structure.
        
        **JSON Structure:**
        {{
            "no_valid_ingredients": false,
            "analysis_summary": {{
                "safety_score": 0-100,
                "safety_level": "safe",
                "should_use": true,
                "main_verdict": "A concise, 2-3 line summary of the product's suitability for the user.",
                "detailed_explanation": "A more in-depth paragraph explaining the product's composition, its pros and cons for the user, and how it aligns with their health goals.",
                "nutritional_highlights": "A brief overview of key nutritional aspects, like 'High in Protein' or 'Contains Added Sugars'.",
                "concern_count": 2
            }},
            "ingredient_groups": [
                {{
                    "group_name": "e.g., Milk-Based Ingredients",
                    "ingredients": [
                        {{
                            "name": "e.g., Skim Milk, Cream",
                            "purpose": "The primary function of this ingredient.",
                            "status": "safe | caution | danger",
                            "concern_level": "low | medium | high",
                            "user_specific_risk": false,
                            "quick_summary": "Concise 1-line description of health impact.",
                            "why_flagged": "Reason for concern if flagged, otherwise null."
                        }}
                    ]
                }}
            ],
            "health_alerts": [
                {{
                    "type": "allergy_match | condition_risk | interaction_warning",
                    "severity": "low | medium | high",
                    "message": "Brief, clear warning message.",
                    "ingredient": "Exact ingredient name.",
                    "action": "Practical recommended action for the user."
                }}
            ],
            "recommendation": {{
                "verdict": "recommend | caution | avoid",
                "confidence": "high | medium | low",
                "reason": "Short explanation for the recommendation.",
                "safe_to_try": true
            }},
            "alternatives": [
                {{
                    "name": "Name of a real, commercially available product in the user's region.",
                    "why": "Reason it's a better alternative for this user.",
                    "benefit": "Key health benefit for the user."
                }}
            ],
            "key_advice": "The single most important piece of actionable advice for this user regarding this product."
        }}"""

        return system_template

    def analyze_ingredients(self, image_file, category, user_profile):
        """Analyze ingredients using Gemini AI model"""
        try:
            model_instance = self._get_model()

            prompt = self.prompt_template.format(
                category=category,
                age=user_profile.get('age', 'Not specified'),
                life_stage=user_profile.get('life_stage', 'Not specified'),
                allergies=", ".join(user_profile.get('allergies', ['None'])),
                diseases=", ".join(user_profile.get('diseases', ['None'])),
                dietary_preferences=", ".join(
                    user_profile.get('dietary_preferences', ['None'])),
                medications=", ".join(
                    user_profile.get('medications', ['None'])),
                skin_type=user_profile.get('skin_type', 'Not specified'),
                health_goals=", ".join(
                    user_profile.get('health_goals', ['None'])),
                region=user_profile.get('region', 'Not specified')
            )

            img = Image.open(image_file)

            response = model_instance.generate_content([prompt, img])

            if response and hasattr(response, 'text') and response.text:
                logger.info("Received response from Gemini AI")
                return self._parse_ai_response(response.text)
            else:
                logger.error("Empty or invalid response from Gemini")
                return self._get_error_response()

        except Exception as e:
            logger.error(f"AI analysis error: {str(e)}")
            return self._get_error_response()

    def _parse_ai_response(self, ai_response):
        """Parse AI response with comprehensive error handling"""
        try:
            # Clean the response to remove markdown code blocks
            cleaned_response = ai_response.strip().replace(
                '```json', '').replace('```', '').strip()
            return json.loads(cleaned_response)
        except json.JSONDecodeError:
            try:
                start_idx = ai_response.find('{')
                end_idx = ai_response.rfind('}')
                if start_idx != -1 and end_idx != -1:
                    json_str = ai_response[start_idx:end_idx + 1]
                    return json.loads(json_str)
            except Exception as e:
                logger.error(f"Failed to extract JSON: {str(e)}")
            return self._get_error_response()

    def _get_error_response(self):
        """Return standardized error response"""
        return {
            "no_valid_ingredients": True,
            "analysis_summary": {
                "safety_score": 0,
                "safety_level": "unknown",
                "should_use": False,
                "main_verdict": "Analysis failed - unable to process image.",
                "detailed_explanation": "The AI could not read the ingredients from the image. Please try again with a clearer picture.",
                "nutritional_highlights": "N/A",
                "concern_count": 1
            },
            "ingredient_groups": [],
            "health_alerts": [
                {
                    "type": "processing_error",
                    "severity": "high",
                    "message": "Could not process the ingredient image clearly.",
                    "ingredient": "N/A",
                    "action": "Please retake the photo with better lighting and ensure the ingredient list is clearly visible."
                }
            ],
            "recommendation": {
                "verdict": "avoid",
                "confidence": "low",
                "reason": "Unable to analyze due to an image processing error.",
                "safe_to_try": False
            },
            "alternatives": [],
            "key_advice": "Please retake the photo with better lighting and ensure the ingredient list is clearly visible."
        }


# Singleton instance
ai_service = AIAnalysisService()
