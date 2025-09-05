from rest_framework import serializers
from .models import MedicalHistory


class MedicalHistorySerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = MedicalHistory
        fields = [
            'id', 'user', 'allergies', 'diseases', 'age', 'life_stage',
            'dietary_preferences', 'medications', 'skin_type', 'health_goals', 'region', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class MedicalHistoryCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalHistory
        fields = [
            'allergies', 'diseases', 'age', 'life_stage', 'dietary_preferences',
            'medications', 'skin_type', 'health_goals', 'region'
        ]

    def _clean_comma_separated_list(self, value):
        """Helper function to clean and format comma-separated string fields."""
        if not value or not isinstance(value, str) or not value.strip():
            return ""
        items = [item.strip() for item in value.split(',') if item.strip()]
        # Sort and remove duplicates
        return ', '.join(sorted(list(set(items))))

    def validate_allergies(self, value):
        return self._clean_comma_separated_list(value)

    def validate_diseases(self, value):
        return self._clean_comma_separated_list(value)

    def validate_dietary_preferences(self, value):
        return self._clean_comma_separated_list(value)

    def validate_medications(self, value):
        return self._clean_comma_separated_list(value)

    def validate_health_goals(self, value):
        return self._clean_comma_separated_list(value)
