from rest_framework import serializers
from .models import MedicalHistory


class MedicalHistorySerializer(serializers.ModelSerializer):
    # Show the username instead of just the user ID
    user = serializers.StringRelatedField(read_only=True)

    # Provide allergies and diseases as lists so frontend can handle them easily
    allergies_list = serializers.SerializerMethodField()
    diseases_list = serializers.SerializerMethodField()

    class Meta:
        model = MedicalHistory
        fields = [
            'id', 'user', 'allergies', 'diseases',
            'allergies_list', 'diseases_list', 'created_at'
        ]
        read_only_fields = [
            'id', 'user', 'created_at', 'allergies_list', 'diseases_list'
        ]

    def get_allergies_list(self, obj):
        """Turn the comma-separated allergies into a Python list"""
        if obj.allergies:
            return [allergy.strip() for allergy in obj.allergies.split(',') if allergy.strip()]
        return []

    def get_diseases_list(self, obj):
        """Turn the comma-separated diseases into a Python list"""
        if obj.diseases:
            return [disease.strip() for disease in obj.diseases.split(',') if disease.strip()]
        return []

    def validate_allergies(self, value):
        """Clean up the allergies input by removing extra spaces"""
        if not value or not value.strip():
            return value
        allergies = [allergy.strip()
                     for allergy in value.split(',') if allergy.strip()]
        return ', '.join(allergies)

    def validate_diseases(self, value):
        """Clean up the diseases input by removing extra spaces"""
        if not value or not value.strip():
            return value
        diseases = [disease.strip()
                    for disease in value.split(',') if disease.strip()]
        return ', '.join(diseases)


class MedicalHistoryCreateUpdateSerializer(serializers.ModelSerializer):
    # Only used when creating or updating a record (simpler than the full serializer)
    class Meta:
        model = MedicalHistory
        fields = ['allergies', 'diseases']

    def validate_allergies(self, value):
        """Trim and clean allergies before saving"""
        if not value or not value.strip():
            return value
        allergies = [allergy.strip()
                     for allergy in value.split(',') if allergy.strip()]
        return ', '.join(allergies)

    def validate_diseases(self, value):
        """Trim and clean diseases before saving"""
        if not value or not value.strip():
            return value
        diseases = [disease.strip()
                    for disease in value.split(',') if disease.strip()]
        return ', '.join(diseases)
