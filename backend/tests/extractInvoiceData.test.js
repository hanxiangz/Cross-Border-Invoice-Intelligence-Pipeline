// ============================================================
// tests/extractInvoiceData.test.js
// ============================================================
// Unit tests for the invoice data extraction logic.
// Run with: npm test
// ============================================================

const {
    extractInvoiceNumber,
    extractAmount,
    extractDate,
    extractSupplier,
    extractInvoiceData,
    NOT_FOUND
} = require('../src/utils/extractInvoiceData');

// ============================================================
// extractInvoiceNumber
// ============================================================
describe('extractInvoiceNumber', () => {
    test('extracts English-format invoice numbers (INV-###-###)', () => {
        expect(extractInvoiceNumber('Invoice INV-2026-001')).toBe('INV-2026-001');
    });

    test('extracts Chinese-format invoice numbers (发票号码: X)', () => {
        expect(extractInvoiceNumber('发票号码: SH-2026-042')).toBe('SH-2026-042');
    });

    test('handles full-width colon in Chinese format', () => {
        expect(extractInvoiceNumber('发票号码：SH-2026-042')).toBe('SH-2026-042');
    });

    test('is case-insensitive for English format', () => {
        expect(extractInvoiceNumber('inv-2026-001')).toBe('inv-2026-001');
    });

    test('returns "Not found" when no invoice number exists', () => {
        expect(extractInvoiceNumber('Just some random text')).toBe(NOT_FOUND);
    });

    test('returns "Not found" for empty input', () => {
        expect(extractInvoiceNumber('')).toBe(NOT_FOUND);
    });

    test('returns "Not found" for null input', () => {
        expect(extractInvoiceNumber(null)).toBe(NOT_FOUND);
    });
});

// ============================================================
// extractAmount
// ============================================================
describe('extractAmount', () => {
    test('extracts amount with ¥ symbol and commas', () => {
        expect(extractAmount('金额: ¥12,500.00')).toBe('12,500.00');
    });

    test('extracts amount without currency symbol', () => {
        expect(extractAmount('Total: 8800.00')).toBe('8800.00');
    });

    test('extracts amount without decimal places', () => {
        expect(extractAmount('Amount: 12500')).toBe('12500');
    });

    test('extracts amount with comma and no decimals', () => {
        expect(extractAmount('Amount: 1,250,000')).toBe('1,250,000');
    });

    test('returns "Not found" when no amount exists', () => {
        expect(extractAmount('No numbers here')).toBe(NOT_FOUND);
    });

    test('returns "Not found" for null input', () => {
        expect(extractAmount(null)).toBe(NOT_FOUND);
    });
});

// ============================================================
// extractDate
// ============================================================
describe('extractDate', () => {
    test('extracts ISO date format (YYYY-MM-DD)', () => {
        expect(extractDate('Date: 2026-01-15')).toBe('2026-01-15');
    });

    test('extracts Chinese date format (YYYY年M月D日)', () => {
        expect(extractDate('日期: 2026年1月15日')).toBe('2026年1月15日');
    });

    test('returns "Not found" when no date exists', () => {
        expect(extractDate('No date here')).toBe(NOT_FOUND);
    });
});

// ============================================================
// extractSupplier
// ============================================================
describe('extractSupplier', () => {
    test('extracts supplier name in Chinese format', () => {
        expect(extractSupplier('供应商: 上海贸易有限公司')).toBe('上海贸易有限公司');
    });

    test('extracts supplier name with full-width colon', () => {
        expect(extractSupplier('供应商：上海贸易有限公司')).toBe('上海贸易有限公司');
    });

    test('trims whitespace from supplier name', () => {
        expect(extractSupplier('供应商:   上海贸易公司   ')).toBe('上海贸易公司');
    });

    test('returns "Not found" when no supplier exists', () => {
        expect(extractSupplier('No supplier info')).toBe(NOT_FOUND);
    });
});

// ============================================================
// extractInvoiceData (full object)
// ============================================================
describe('extractInvoiceData', () => {
    test('extracts all fields from a complete Chinese invoice', () => {
        const ocrText = `
            上海贸易有限公司
            发票号码: SH-2026-042
            日期: 2026年1月15日
            供应商: 上海贸易有限公司
            金额: ¥12,500.00
        `;

        const result = extractInvoiceData(ocrText);

        expect(result.invoiceNumber).toBe('SH-2026-042');
        expect(result.amount).toBe('12,500.00');
        expect(result.date).toBe('2026年1月15日');
        expect(result.supplier).toBe('上海贸易有限公司');
    });

    test('extracts all fields from a complete English invoice', () => {
        const ocrText = `
            Supplier: Sydney Imports Pty Ltd
            Invoice INV-2026-001
            Date: 2026-01-15
            供应商: Shanghai Trading Co
            Amount: 8800.00
        `;

        const result = extractInvoiceData(ocrText);

        expect(result.invoiceNumber).toBe('INV-2026-001');
        expect(result.amount).toBe('8800.00');
        expect(result.date).toBe('2026-01-15');
        expect(result.supplier).toBe('Shanghai Trading Co');
    });

    test('returns all "Not found" values when text has no invoice data', () => {
        const result = extractInvoiceData('This is just a random paragraph.');

        expect(result.invoiceNumber).toBe(NOT_FOUND);
        expect(result.amount).toBe(NOT_FOUND);
        expect(result.date).toBe(NOT_FOUND);
        expect(result.supplier).toBe(NOT_FOUND);
    });

    test('handles empty string without throwing', () => {
        const result = extractInvoiceData('');
        expect(result.invoiceNumber).toBe(NOT_FOUND);
    });

    test('handles null without throwing', () => {
        const result = extractInvoiceData(null);
        expect(result.invoiceNumber).toBe(NOT_FOUND);
    });
});