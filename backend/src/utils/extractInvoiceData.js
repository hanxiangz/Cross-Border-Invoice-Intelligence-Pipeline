// ============================================================
// extractInvoiceData.js
// ============================================================

const PATTERNS = {
    INVOICE_NUMBER: [
        /INV-\d{4}-\d{3}/i,
        /发票号码[:：]\s*([A-Za-z0-9\-]+)/,
        /Invoice\s*(?:No|Number)[:：]?\s*([A-Za-z0-9\-]+)/i
    ],

    // Anchored to a label so it doesn't match invoice numbers or dates
    AMOUNT: /(?:金额|Total|Amount)[:：]?\s*[¥$]?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,

    DATE: [
        /\d{4}-\d{2}-\d{2}/,
        /\d{4}\/\d{1,2}\/\d{1,2}/,
        /\d{4}年\d{1,2}月\d{1,2}日/
    ],

    SUPPLIER: [
        /供应商[:：]\s*(.+)/,
        /Supplier[:：]\s*(.+)/i
    ]
};

const NOT_FOUND = 'Not found';

function extractInvoiceNumber(text) {
    if (!text) return NOT_FOUND;
    for (const pattern of PATTERNS.INVOICE_NUMBER) {
        const match = text.match(pattern);
        if (match) return (match[1] || match[0]).trim();
    }
    return NOT_FOUND;
}

function extractAmount(text) {
    if (!text) return NOT_FOUND;
    const match = text.match(PATTERNS.AMOUNT);
    return match ? match[1] : NOT_FOUND;
}

function extractDate(text) {
    if (!text) return NOT_FOUND;
    for (const pattern of PATTERNS.DATE) {
        const match = text.match(pattern);
        if (match) return match[0];
    }
    return NOT_FOUND;
}

function extractSupplier(text) {
    if (!text) return NOT_FOUND;
    for (const pattern of PATTERNS.SUPPLIER) {
        const match = text.match(pattern);
        if (match) return match[1].trim();
    }
    return NOT_FOUND;
}

function extractInvoiceData(text) {
    return {
        invoiceNumber: extractInvoiceNumber(text),
        amount: extractAmount(text),
        date: extractDate(text),
        supplier: extractSupplier(text)
    };
}

module.exports = {
    extractInvoiceNumber,
    extractAmount,
    extractDate,
    extractSupplier,
    extractInvoiceData,
    PATTERNS,
    NOT_FOUND
};