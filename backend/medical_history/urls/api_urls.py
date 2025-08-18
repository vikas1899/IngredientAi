# medical_history/urls/api_urls.py

from django.urls import path
from ..views.api_views import (
    MedicalHistoryAPIView,
    CheckMedicalHistoryAPIView
)

urlpatterns = [
    path('', MedicalHistoryAPIView.as_view(), name='api_medical_history'),
    path('check/', CheckMedicalHistoryAPIView.as_view(), name='api_check_medical'),
]
