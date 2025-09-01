from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiExample

from ..models import MedicalHistory
from ..serializers import MedicalHistorySerializer, MedicalHistoryCreateUpdateSerializer


class MedicalHistoryAPIView(generics.RetrieveUpdateAPIView):
    """
    API view to manage Medical History for authenticated users.
    Supports GET, POST, PUT, and PATCH methods with different serializers.
    """

    serializer_class = MedicalHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """
        Fetch the medical history for the current user.
        If not present, automatically create an empty record.
        Ensures every user has exactly one medical history entry.
        """

        medical_history, created = MedicalHistory.objects.get_or_create(
            user=self.request.user
        )
        return medical_history

    def get_serializer_class(self):
        """
        Dynamically choose serializer:
        - Use create/update serializer for write operations (POST, PUT, PATCH).
        - Use read-only serializer for read operations (GET).
        """

        if self.request.method in ['POST', 'PUT', 'PATCH']:
            return MedicalHistoryCreateUpdateSerializer
        return MedicalHistorySerializer

    @extend_schema(
        summary="Get medical history",
        description="Retrieve the medical history for the authenticated user"
    )
    def get(self, request, *args, **kwargs):
        # Uses parent RetrieveUpdateAPIView GET behavior
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
        """
        Create a new medical history for the user.
        - Reject if a record already exists (enforces one-to-one relationship).
        - Returns full response with computed fields.
        """

        if hasattr(request.user, 'medicalhistory'):
            return Response({
                'error': 'Medical history already exists. Use PUT to update.'
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            # Return full details using read-only serializer
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
        """
        Fully update the medical history for the current user.
        - Requires all fields in the request body.
        - Returns updated record with computed fields.
        """

        medical_history = self.get_object()
        serializer = self.get_serializer(medical_history, data=request.data)
        if serializer.is_valid():
            serializer.save()

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
        """
        Partially update medical history.
        - Allows updating a subset of fields (allergies/diseases).
        - Returns updated record with computed fields.
        """

        medical_history = self.get_object()
        serializer = self.get_serializer(
            medical_history,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()

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
    """
    API endpoint to check if a medical history record exists for the authenticated user.
    Useful for frontend apps to decide whether to show create or update UI.
    """

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
        """
        Return a boolean flag along with a descriptive message:
        - True if the user has an existing record.
        - False otherwise.
        """

        has_medical_history = hasattr(request.user, 'medicalhistory')

        return Response({
            'has_medical_history': has_medical_history,
            'message': 'Medical history exists' if has_medical_history else 'No medical history found'
        }, status=status.HTTP_200_OK)
