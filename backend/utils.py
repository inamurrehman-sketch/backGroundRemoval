"""
utils.py - Image Processing Logic
Uses the 'rembg' library to remove background from images.
"""

from rembg import remove
from PIL import Image
import io


def remove_background(image_bytes: bytes) -> bytes:
    """
    Accepts raw image bytes, removes the background,
    and returns the processed image as PNG bytes.

    Args:
        image_bytes: Raw bytes of the uploaded image.

    Returns:
        PNG image bytes with transparent background.
    """
    # Open the image from bytes
    input_image = Image.open(io.BytesIO(image_bytes))

    # Remove background using rembg
    output_image = remove(input_image)

    # Save the result to a bytes buffer as PNG (supports transparency)
    output_buffer = io.BytesIO()
    output_image.save(output_buffer, format="PNG")
    output_buffer.seek(0)

    return output_buffer.getvalue()
