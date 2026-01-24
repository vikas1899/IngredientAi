import redis
import hashlib
import json
import sys
from pathlib import Path

# Add the parent directory to the path to import config module
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from config.configuration import REDIS_HOST, REDIS_PORT, REDIS_DB

# Initialize Redis client
redis_client = redis.StrictRedis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=REDIS_DB,
    decode_responses=True
)


def generate_cache_key(identifier, category, allergies, diseases):
    """
    Generate a unique Redis cache key for given image content, category,
    allergies, and diseases with consistent ordering.
    """

    combined = (
        identifier.encode("utf-8") +
        category.encode("utf-8") +
        json.dumps(allergies, sort_keys=True).encode("utf-8") +
        json.dumps(diseases, sort_keys=True).encode("utf-8")
    )
    return hashlib.sha256(combined).hexdigest()


def generate_image_cache_key(image_file):
    """
    Generate a SHA256 hash key for the given image input.
    Supports bytes, bytearray, or file-like objects.
    """
    # If image_file is bytes or bytearray, use it directly
    if isinstance(image_file, (bytes, bytearray)):
        image_content = image_file
    else:
        # Assume file-like object, read bytes and reset pointer
        image_content = image_file.read()
        image_file.seek(0)
    return hashlib.sha256(image_content).hexdigest()
