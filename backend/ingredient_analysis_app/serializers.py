from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import IngredientAnalysis


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    repeat_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username',
                  'email', 'password', 'repeat_password', 'date_joined']
        read_only_fields = ['id', 'date_joined']

    def validate(self, attrs):
        if attrs['password'] != attrs['repeat_password']:
            raise serializers.ValidationError(
                {"password": "Passwords don't match."})

        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError(
                {"username": "Username already taken."})

        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError(
                {"email": "Email already registered."})

        return attrs

    def create(self, validated_data):
        validated_data.pop('repeat_password')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')

            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError(
                'Must include username and password.')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email',
                  'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class IngredientAnalysisSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = IngredientAnalysis
        fields = ['id', 'user', 'category', 'image',
                  'image_url', 'result', 'timestamp']
        read_only_fields = ['id', 'user', 'result', 'timestamp']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class AnalyzeRequestSerializer(serializers.Serializer):
    image = serializers.ImageField()
    category = serializers.CharField(max_length=100)
