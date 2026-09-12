// ============================================================
// config.js — Application Configuration
// ============================================================
// This file centralizes all configurable values so they can be
// changed in one place without hunting through the codebase.
// ============================================================

window.APP_CONFIG = {
    // ----------------------------------------------------------
    // API Endpoints
    // ----------------------------------------------------------
    // Production (Azure Static Web Apps + Azure Functions)
    API: {
        UPLOAD: 'https://chinatradeapp-g0hxhgcvh3ebf8et.australiasoutheast-01.azurewebsites.net/api/UploadInvoice',
        GET_DATA: 'https://chinatradeapp-g0hxhgcvh3ebf8et.australiasoutheast-01.azurewebsites.net/api/GetInvoiceData'
    },

    // ----------------------------------------------------------
    // Polling Configuration
    // ----------------------------------------------------------
    // The OCR processing typically takes 3-8 seconds. We poll
    // every 2 seconds for up to 30 seconds before giving up.
    // This balances responsiveness (user sees results quickly)
    // with server load (we don't hammer the API).
    POLLING: {
        MAX_ATTEMPTS: 15,   // 15 attempts
        DELAY_MS: 2000,     // 2 seconds between attempts
        TIMEOUT_MS: 30000   // 30 seconds total (15 × 2s)
    },

    // ----------------------------------------------------------
    // File Upload Constraints
    // ----------------------------------------------------------
    UPLOAD: {
        ACCEPTED_TYPES: 'image/jpeg,image/png,application/pdf',
        MAX_FILE_SIZE_MB: 10
    }
};

// ============================================================
// LOCAL DEVELOPMENT OVERRIDE
// ============================================================
// Uncomment the lines below to test against your local
// Azure Functions (running via `func start`).
//
// window.APP_CONFIG.API.UPLOAD    = 'http://127.0.0.1:7071/api/UploadInvoice';
// window.APP_CONFIG.API.GET_DATA  = 'http://127.0.0.1:7071/api/GetInvoiceData';