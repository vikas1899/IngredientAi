from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from ..view.api_views import (
    RegisterAPIView,
    LoginAPIView,
    LogoutAPIView,
    UserProfileAPIView,
    DeleteOwnAccountAPIView
)

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='api_register'),
    path('login/', LoginAPIView.as_view(), name='api_login'),
    path('logout/', LogoutAPIView.as_view(), name='api_logout'),
    path('refresh/', TokenRefreshView.as_view(), name='api_token_refresh'),
    path('profile/', UserProfileAPIView.as_view(), name='api_user_profile'),
    path('delete-account/', DeleteOwnAccountAPIView.as_view(),
         name='api_delete_account'),
]
