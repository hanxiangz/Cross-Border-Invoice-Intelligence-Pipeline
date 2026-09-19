// ============================================================
// config.js — Application Configuration
// ============================================================
// This file centralizes all configurable values so they can be
// changed in one place without hunting through the codebase.
// ============================================================

// ------------------------------------------------------------
// Unit conversion constants
// ------------------------------------------------------------
// Storage sizes are in binary units: 1 KB = 1024 bytes,
// 1 MB = 1024 KB = 1,048,576 bytes.
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * 1024;

// Time conversions
const MS_PER_SECOND = 1000;


window.APP_CONFIG = {
    // ----------------------------------------------------------
    // API Endpoints
    // ----------------------------------------------------------
    API: {
        UPLOAD: 'https://chinatradeapp-g0hxhgcvh3ebf8et.australiasoutheast-01.azurewebsites.net/api/UploadInvoice',
        GET_DATA: 'https://chinatradeapp-g0hxhgcvh3ebf8et.australiasoutheast-01.azurewebsites.net/api/GetInvoiceData'
    },

    // ----------------------------------------------------------
    // Polling Configuration
    // ----------------------------------------------------------
    // The OCR processing typically takes 3-8 seconds. We poll
    // every 2 seconds for up to 30 seconds before giving up.
    POLLING: {
        MAX_ATTEMPTS: 15,
        DELAY_MS: 2000,
        TIMEOUT_MS: 30000
    },

    // ----------------------------------------------------------
    // File Upload Constraints
    // ----------------------------------------------------------
    UPLOAD: {
        ACCEPTED_TYPES: 'image/jpeg,image/png,application/pdf',
        MAX_FILE_SIZE_MB: 10,
        MIN_FILE_SIZE_BYTES: 1,       // Reject empty files
        BYTES_PER_MB: BYTES_PER_MB    // Conversion constant
    },
};

// ============================================================
// LOCAL DEVELOPMENT OVERRIDE
// ============================================================
// Uncomment the lines below to test against your local
// Azure Functions (running via `func start`).
//
window.APP_CONFIG.API.UPLOAD    = 'http://127.0.0.1:7071/api/UploadInvoice';
window.APP_CONFIG.API.GET_DATA  = 'http://127.0.0.1:7071/api/GetInvoiceData';