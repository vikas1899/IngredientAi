from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..view.api_views import IngredientAnalysisViewSet, AnalyzeIngredientsAPIView

# Create a router for ViewSets
router = DefaultRouter()
router.register(r'history', IngredientAnalysisViewSet, basename='analysis')

urlpatterns = [
    # Analysis endpoint
    path('analyze/', AnalyzeIngredientsAPIView.as_view(), name='api_analyze'),

    # Include router URLs for history, detail, etc.
    path('', include(router.urls)),
]
