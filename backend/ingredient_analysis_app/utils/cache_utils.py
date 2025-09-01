import redis
import hashlib
import json
from dotenv import load_dotenv
import os

load_dotenv()

# Reading Redis config from environment variables
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_DB = int(os.getenv('REDIS_DB', 0))

# Initialize Redis client
redis_client = redis.StrictRedis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=REDIS_DB,
    decode_responses=True
)


def generate_cache_key(image_file, category, allergies, diseases):
    """
    Generate a unique Redis cache key for given image content, category,
    allergies, and diseases with consistent ordering.
    """
    image_content = image_file.read()
    image_file.seek(0)

    combined = (
        image_content +
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
