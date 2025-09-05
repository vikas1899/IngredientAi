from django.db import models
from django.contrib.auth.models import User


class MedicalHistory(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # Existing Fields
    allergies = models.TextField(
        blank=True, help_text="Enter comma-separated list of allergies")
    diseases = models.TextField(
        blank=True, help_text="Enter comma-separated list of past diagnoses")

    # New Fields
    age = models.PositiveIntegerField(null=True, blank=True)
    life_stage = models.CharField(
        max_length=50, blank=True, help_text="e.g., Infant, Child, Adult, Pregnant, Elderly")
    dietary_preferences = models.TextField(
        blank=True, help_text="e.g., Vegan, Gluten-Free, Halal")
    medications = models.TextField(
        blank=True, help_text="Enter comma-separated list of medications")
    skin_type = models.CharField(
        max_length=50, blank=True, help_text="e.g., Oily, Dry, Sensitive")
    health_goals = models.TextField(
        blank=True, help_text="e.g., Weight Loss, Heart Health")
    region = models.CharField(
        max_length=100, blank=True, help_text="e.g., North America, Europe, Asia")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Medical History - {self.user.username}"
