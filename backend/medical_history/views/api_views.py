# medical_history/views/api_views.py

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiExample

from ..models import MedicalHistory
from ..serializers import MedicalHistorySerializer, MedicalHistoryCreateUpdateSerializer


class MedicalHistoryAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = MedicalHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Get or create medical history for the current user"""
        medical_history, created = MedicalHistory.objects.get_or_create(
            user=self.request.user
        )
        return medical_history

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.request.method in ['POST', 'PUT', 'PATCH']:
            return MedicalHistoryCreateUpdateSerializer
        return MedicalHistorySerializer

    @extend_schema(
        summary="Get medical history",
        description="Retrieve the medical history for the authenticated user"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Create medical history",
        description="Create medical history for the authenticated user",
        examples=[
            OpenApiExample(
                "Medical History Example",
                value={
                    "allergies": "Peanuts, Shellfish, Dairy",
                    "diseases": "Diabetes, Hypertension"
                }
            )
        ]
    )
    def post(self, request, *args, **kwargs):
        # Check if medical history already exists
        if hasattr(request.user, 'medicalhistory'):
            return Response({
                'error': 'Medical history already exists. Use PUT to update.'
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            # Return the full serializer with computed fields
            response_serializer = MedicalHistorySerializer(
                serializer.instance,
                context={'request': request}
            )
            return Response({
                'message': 'Medical history created successfully',
                'medical_history': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Update medical history",
        description="Update the medical history for the authenticated user",
        examples=[
            OpenApiExample(
                "Update Medical History Example",
                value={
                    "allergies": "Peanuts, Shellfish, Dairy, Eggs",
                    "diseases": "Diabetes, Hypertension, Asthma"
                }
            )
        ]
    )
    def put(self, request, *args, **kwargs):
        medical_history = self.get_object()
        serializer = self.get_serializer(medical_history, data=request.data)
        if serializer.is_valid():
            serializer.save()
            # Return the full serializer with computed fields
            response_serializer = MedicalHistorySerializer(
                serializer.instance,
                context={'request': request}
            )
            return Response({
                'message': 'Medical history updated successfully',
                'medical_history': response_serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Partially update medical history",
        description="Partially update the medical history for the authenticated user"
    )
    def patch(self, request, *args, **kwargs):
        medical_history = self.get_object()
        serializer = self.get_serializer(
            medical_history,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            # Return the full serializer with computed fields
            response_serializer = MedicalHistorySerializer(
                serializer.instance,
                context={'request': request}
            )
            return Response({
                'message': 'Medical history updated successfully',
                'medical_history': response_serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CheckMedicalHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Check if medical history exists",
        description="Check whether the authenticated user has medical history records",
        responses={
            200: {
                "type": "object",
                "properties": {
                    "has_medical_history": {"type": "boolean"},
                    "message": {"type": "string"}
                }
            }
        }
    )
    def get(self, request):
        """Check if user has medical history"""
        has_medical_history = hasattr(request.user, 'medicalhistory')

        return Response({
            'has_medical_history': has_medical_history,
            'message': 'Medical history exists' if has_medical_history else 'No medical history found'
        }, status=status.HTTP_200_OK)
