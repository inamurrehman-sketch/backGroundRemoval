/**
 * script.js — AI Background Remover Frontend Logic
 * Handles image upload, API calls, and result display.
 */

// ──────────────────────────────────────────────
//  Configuration
// ──────────────────────────────────────────────

// For local dev: "http://127.0.0.1:8000"
// For production: set this to your GCP Cloud Run backend URL
const API_BASE_URL = window.BACKEND_URL || "http://127.0.0.1:8000";
const API_ENDPOINT = `${API_BASE_URL}/remove-bg`;

// ──────────────────────────────────────────────
//  DOM Elements
// ──────────────────────────────────────────────

const uploadZone = document.getElementById("upload-zone");
const fileInput = document.getElementById("file-input");
const uploadSection = document.getElementById("upload-section");
const previewSection = document.getElementById("preview-section");
const originalPreview = document.getElementById("original-preview");
const resultPreview = document.getElementById("result-preview");
const loadingOverlay = document.getElementById("loading-overlay");
const resultPlaceholder = document.getElementById("result-placeholder");
const removeBtn = document.getElementById("remove-btn");
const downloadBtn = document.getElementById("download-btn");
const resetBtn = document.getElementById("reset-btn");
const statusMessage = document.getElementById("status-message");

let selectedFile = null;
let resultBlob = null;

// ──────────────────────────────────────────────
//  Upload Zone — Click & Drag/Drop
// ──────────────────────────────────────────────

uploadZone.addEventListener("click", () => fileInput.click());

// Drag & drop events
uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.classList.add("drag-over");
});

uploadZone.addEventListener("dragleave", () => {
    uploadZone.classList.remove("drag-over");
});

uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file && isValidImage(file)) {
        handleFileSelect(file);
    }
});

// File input change
fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileSelect(file);
    }
});

// ──────────────────────────────────────────────
//  File Validation
// ──────────────────────────────────────────────

function isValidImage(file) {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
        showStatus("Invalid file type. Please upload PNG, JPG, or WEBP.", "error");
        return false;
    }
    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
        showStatus("File too large. Maximum size is 10MB.", "error");
        return false;
    }
    return true;
}

// ──────────────────────────────────────────────
//  Handle File Selection
// ──────────────────────────────────────────────

function handleFileSelect(file) {
    if (!isValidImage(file)) return;

    selectedFile = file;

    // Show original preview
    const reader = new FileReader();
    reader.onload = (e) => {
        originalPreview.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Switch to preview mode
    uploadSection.style.display = "none";
    previewSection.style.display = "block";

    // Reset result state
    resultPreview.src = "";
    resultPreview.style.display = "none";
    loadingOverlay.style.display = "none";
    resultPlaceholder.style.display = "flex";
    downloadBtn.style.display = "none";
    removeBtn.disabled = false;
    resultBlob = null;
    hideStatus();
}

// ──────────────────────────────────────────────
//  Remove Background — API Call
// ──────────────────────────────────────────────

removeBtn.addEventListener("click", async () => {
    if (!selectedFile) return;

    // Show loading
    removeBtn.disabled = true;
    resultPlaceholder.style.display = "none";
    loadingOverlay.style.display = "flex";
    hideStatus();

    try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            // Success
            resultBlob = await response.blob();
            const url = URL.createObjectURL(resultBlob);

            resultPreview.src = url;
            resultPreview.style.display = "block";
            loadingOverlay.style.display = "none";
            downloadBtn.style.display = "inline-flex";

            showStatus("✅ Background removed successfully!", "success");
        } else {
            // API error
            const errorData = await response.json().catch(() => ({}));
            const detail = errorData.detail || `Server error (${response.status})`;
            loadingOverlay.style.display = "none";
            resultPlaceholder.style.display = "flex";
            removeBtn.disabled = false;
            showStatus(`❌ ${detail}`, "error");
        }
    } catch (err) {
        // Network error
        loadingOverlay.style.display = "none";
        resultPlaceholder.style.display = "flex";
        removeBtn.disabled = false;

        if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
            showStatus("❌ Cannot connect to the backend. Make sure the API server is running.", "error");
        } else {
            showStatus(`❌ Something went wrong: ${err.message}`, "error");
        }
    }
});

// ──────────────────────────────────────────────
//  Download Result
// ──────────────────────────────────────────────

downloadBtn.addEventListener("click", () => {
    if (!resultBlob) return;

    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "removed_bg.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

// ──────────────────────────────────────────────
//  Reset — New Image
// ──────────────────────────────────────────────

resetBtn.addEventListener("click", () => {
    selectedFile = null;
    resultBlob = null;
    fileInput.value = "";

    // Switch back to upload
    uploadSection.style.display = "block";
    previewSection.style.display = "none";
    hideStatus();
});

// ──────────────────────────────────────────────
//  Status Messages
// ──────────────────────────────────────────────

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
}

function hideStatus() {
    statusMessage.className = "status-message";
    statusMessage.textContent = "";
}
