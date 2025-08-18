import logging
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class CustomAPIResponse:
    """Standardized API response helper"""

    @staticmethod
    def success(data=None, message="Success", status_code=status.HTTP_200_OK):
        response_data = {'success': True, 'message': message}
        if data is not None:
            response_data['data'] = data
        return Response(response_data, status=status_code)

    @staticmethod
    def error(message="An error occurred", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
        response_data = {'success': False, 'message': message}
        if errors:
            response_data['errors'] = errors
        return Response(response_data, status=status_code)


def custom_exception_handler(exc, context):
    """Custom exception handler for API"""
    response = exception_handler(exc, context)
    if response is not None:
        custom_response_data = {
            'success': False,
            'message': 'An error occurred',
            'errors': response.data
        }
        logger.error(f"API Error: {exc} - Context: {context}")
        response.data = custom_response_data
    return response
