from rest_framework import viewsets, mixins
import logging
import json
from PIL import Image
import numpy as np
from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth.models import User
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes


from ..models import IngredientAnalysis
from ..serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    IngredientAnalysisSerializer,
    AnalyzeRequestSerializer
)

from ..utils.api_utils import get_model, prompt_template, parser, ocr_reader, parse_ai_response


class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Register a new user",
        description="Create a new user account",
        examples=[
            OpenApiExample(
                "Registration Example",
                value={
                    "username": "john_doe",
                    "email": "john@example.com",
                    "password": "securepassword123",
                    "repeat_password": "securepassword123"
                }
            )
        ]
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=UserLoginSerializer,
        responses={200: UserSerializer},
        summary="User login",
        description="Authenticate user and return JWT tokens"
    )
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request={"refresh": "string"},
        summary="User logout",
        description="Blacklist the refresh token"
    )
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class AnalyzeIngredientsAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(
        request=AnalyzeRequestSerializer,
        summary="Analyze ingredients from image",
        description="Upload image and get immediate ingredient analysis"
    )
    def post(self, request):
        serializer = AnalyzeRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        image = serializer.validated_data['image']
        category = serializer.validated_data['category']

        try:
            # Process image with OCR (synchronously) - NO DB ENTRY YET
            img = Image.open(image)
            img = np.array(img)
            results = ocr_reader.read_text(img)

            # Extract text correctly
            text_only = [item[1] for item in results if isinstance(
                item, (list, tuple)) and len(item) > 1]
            ingredients_text = ", ".join(
                text_only) if text_only else "No text detected"

            print(ingredients_text)

            # Get user medical history
            try:
                allergies = request.user.medicalhistory.allergies.split(',') if hasattr(
                    request.user, 'medicalhistory') and request.user.medicalhistory.allergies else ["No allergy"]
                diseases = request.user.medicalhistory.diseases.split(',') if hasattr(
                    request.user, 'medicalhistory') and request.user.medicalhistory.diseases else ["No disease"]
            except Exception:
                allergies = ["No allergy"]
                diseases = ["No disease"]

            # AI analysis (synchronously)
            model_instance = get_model()
            chain = prompt_template | model_instance | parser
            llm_response = chain.invoke({
                "list_of_ingredients": ingredients_text,
                "category": category,
                "allergies": ", ".join(allergies),
                "diseases": ", ".join(diseases)
            })

            # Parse result
            parsed_result = parse_ai_response(llm_response)

            # CHECK FOR ANALYSIS FAILURE BEFORE DB CREATION
            if parsed_result.get('no_valid_ingredients', False):
                # Analysis failed - return error without saving to DB
                return Response({
                    'status': 'failed',
                    'error': parsed_result.get('key_advice', 'Please retake the photo with better lighting and ensure ingredient list is clearly visible')
                }, status=status.HTTP_400_BAD_REQUEST)

            # Add metadata for successful analysis
            parsed_result["metadata"] = {
                "extracted_ingredients": text_only,
                "status": "completed"
            }

            # ONLY CREATE DB ENTRY AFTER CONFIRMING SUCCESS
            analysis = IngredientAnalysis.objects.create(
                user=request.user,
                category=category,
                image=image,
                result=json.dumps(parsed_result)
            )

            # Return successful response
            return Response({
                'status': 'successful',
                'message': 'Analysis completed successfully',
                'analysis': {
                    'id': analysis.id,
                    'category': analysis.category,
                    'created_at': analysis.timestamp,
                    'result': parsed_result
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # Return failed response without creating DB entry
            return Response({
                'status': 'failed',
                'error': f'Processing failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class IngredientAnalysisViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    serializer_class = IngredientAnalysisSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return IngredientAnalysis.objects.filter(user=self.request.user)

    # def retrieve(self, request, *args, **kwargs):
    #     instance = self.get_object()
    #     serializer = self.get_serializer(instance)
    #     data = serializer.data
    #     try:
    #         if isinstance(data['result'], str):
    #             data['result'] = json.loads(data['result'])
    #     except (json.JSONDecodeError, KeyError):
    #         pass
    #     return Response(data)

    # def list(self, request, *args, **kwargs):
    #     queryset = self.get_queryset()
    #     page = self.paginate_queryset(queryset)
    #     serializer = self.get_serializer(page, many=True)
    #     data = serializer.data
    #     for item in data:
    #         try:
    #             if isinstance(item['result'], str):
    #                 item['result'] = json.loads(item['result'])
    #         except (json.JSONDecodeError, KeyError):
    #             pass
    #     return self.get_paginated_response(data)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response({
                "success": True,
                "message": "Analysis deleted successfully"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logging.error(f"Error deleting analysis: {str(e)}")
            return Response({
                "success": False,
                "message": f"Failed to delete analysis: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeleteOwnAccountAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Delete own account",
        description="Allows the currently authenticated user to permanently delete their own account."
    )
    def delete(self, request):
        user = request.user
        username = user.username
        try:
            user.delete()
            return Response({"message": f"User '{username}' deleted successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Account deletion failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
