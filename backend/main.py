"""
main.py - FastAPI Backend Server
Exposes a single API endpoint to accept image uploads
and return background-removed PNG images.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
# from backend.utils import remove_background
from utils import remove_background

# Initialize FastAPI app
app = FastAPI(
    title="AI Background Remover API",
    description="Upload an image and get the background removed instantly.",
    version="1.0.0",
)

# Allow requests from Streamlit frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Allowed image formats
ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"]


@app.get("/")
def root():
    """Health check endpoint."""
    return {"message": "AI Background Remover API is running!"}


@app.post("/remove-bg")
async def remove_bg(file: UploadFile = File(...)):
    """
    Accepts an uploaded image, removes the background,
    and returns the processed PNG image.

    Args:
        file: The uploaded image file.

    Returns:
        PNG image with transparent background.
    """
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. "
                   f"Allowed types: {', '.join(ALLOWED_TYPES)}",
        )

    # Read image bytes into memory
    image_bytes = await file.read()

    # Validate that the file is not empty
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        # Process the image (remove background)
        result_bytes = remove_background(image_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}",
        )

    # Return the processed image as PNG
    return Response(
        content=result_bytes,
        media_type="image/png",
        headers={"Content-Disposition": "attachment; filename=removed_bg.png"},
    )
