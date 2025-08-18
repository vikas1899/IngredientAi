import os
import json
import logging
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


class AIAnalysisService:
    """Service for AI-powered ingredient analysis"""

    _instance = None

    def __new__(cls):
        if not cls._instance:
            cls._instance = super(AIAnalysisService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if not self._initialized:
            self.model = None
            self.parser = StrOutputParser()
            self.prompt_template = self._create_prompt_template()
            self._initialized = True

    def _get_api_keys(self):
        """Validate and set API keys"""
        langchain_key = os.getenv("LANGCHAIN_API_KEY")
        groq_key = os.getenv("GROQ_API_KEY")

        if not groq_key:
            raise ValueError("GROQ_API_KEY environment variable is required")
        if not langchain_key:
            raise ValueError(
                "LANGCHAIN_API_KEY environment variable is required")

        os.environ["LANGCHAIN_API_KEY"] = langchain_key
        os.environ["GROQ_API_KEY"] = groq_key
        os.environ["LANGCHAIN_TRACING_V2"] = "true"

        return groq_key, langchain_key

    def _get_model(self):
        """Get or create the AI model instance"""
        if self.model is None:
            self._get_api_keys()
            self.model = ChatGroq(model="llama3-8b-8192")
        return self.model

    def _create_prompt_template(self):
        """Create the AI analysis prompt template"""

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
        - Give a **main_verdict** in 2-4 line with human understandable language in a simple
        - Give a 2-3 lines **key advice** for the user in a simple language so user can understand.

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

        return ChatPromptTemplate.from_messages([
            ("system", system_template)
        ])

    def analyze_ingredients(self, ingredients_text, category, allergies, diseases):
        """Analyze ingredients using AI model"""
        try:
            model_instance = self._get_model()
            chain = self.prompt_template | model_instance | self.parser

            llm_response = chain.invoke({
                "list_of_ingredients": ingredients_text,
                "category": category,
                "allergies": ", ".join(allergies) if allergies else "No allergy",
                "diseases": ", ".join(diseases) if diseases else "No disease"
            })

            return self._parse_ai_response(llm_response)

        except Exception as e:
            logger.error(f"AI analysis error: {str(e)}")
            return self._get_error_response()

    def _parse_ai_response(self, ai_response):
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

            return self._get_error_response()

    def _get_error_response(self):
        """Return standardized error response"""
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


# Singleton instance
ai_service = AIAnalysisService()
