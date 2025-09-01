from django.urls import path
from ..views.api_views import (
    MedicalHistoryAPIView,
    CheckMedicalHistoryAPIView
)

urlpatterns = [
    # Handles CRUD operations (GET, POST, PUT, PATCH) for the user's medical history.
    path('', MedicalHistoryAPIView.as_view(), name='api_medical_history'),

    # Endpoint to quickly check if the user already has a medical history record.
    path('check/', CheckMedicalHistoryAPIView.as_view(), name='api_check_medical'),
]
