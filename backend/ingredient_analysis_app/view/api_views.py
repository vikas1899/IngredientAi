import json
import logging
from rest_framework import generics, status, viewsets, mixins
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from drf_spectacular.utils import extend_schema, OpenApiExample

from ..models import IngredientAnalysis
from ..serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    IngredientAnalysisSerializer,
    AnalyzeRequestSerializer
)
from ..service.ingredient_service import ingredient_analysis_service

logger = logging.getLogger(__name__)


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
                    "first_name": "John",
                    "last_name": "Doe",
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
    """Simplified view using service layer"""
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
            # Use service layer for analysis
            analysis_result = ingredient_analysis_service.analyze_image(
                image_file=image,
                category=category,
                user=request.user
            )

            # Handle analysis failure
            if not analysis_result['success']:
                return Response({
                    'status': 'failed',
                    'error': analysis_result['error']
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create database entry only after successful analysis
            analysis = IngredientAnalysis.objects.create(
                user=request.user,
                category=category,
                image=f"v1/{analysis_result['public_id']}",
                result=json.dumps(analysis_result['result'])
            )

            # Return successful response
            return Response({
                'status': 'successful',
                'message': 'Analysis completed successfully',
                'analysis': {
                    'id': analysis.id,
                    'category': analysis.category,
                    'created_at': analysis.timestamp,
                    'result': analysis_result['result']
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Analysis API error: {str(e)}")
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

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response({
                "success": True,
                "message": "Analysis deleted successfully"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error deleting analysis: {str(e)}")
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
