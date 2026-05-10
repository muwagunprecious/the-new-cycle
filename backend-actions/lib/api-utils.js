import { BATTERY_TYPE_MAPPING, BATTERY_TYPES } from "@/lib/pricing";

/**
 * Map Prisma Product to frontend-friendly structure
 */
export function mapProductToFrontend(product) {
    if (!product) return null;

    // Inverse mapping for frontend label
    const reverseMapping = Object.fromEntries(
        Object.entries(BATTERY_TYPE_MAPPING).map(([label, value]) => [value, label])
    );

    const addressParts = product.pickupAddress?.split(' | ') || [];
    const mainAddress = addressParts[0] || product.pickupAddress || "";
    const lga = addressParts[1] || "";

    return {
        ...product,
        address: mainAddress,
        lga: lga,
        unitsAvailable: product.quantity,
        batteryType: reverseMapping[product.type] || BATTERY_TYPES[0],
        status: product.status || 'pending',
        rejectionReason: product.rejectionReason,
        collectionDates: Array.isArray(product.collectionDates) && product.collectionDates.length > 0 
            ? product.collectionDates 
            : (product.collectionDateStart 
                ? [new Date(product.collectionDateStart).toISOString().split('T')[0]] 
                : [])
    };
}

/**
 * Generate a clean ID with prefix
 */
export function generateId(prefix = 'id') {
    return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a short, consistent transaction ID
 * Format: GOC-XXXXXX (e.g. GOC-8F2D1A)
 */
export function generateTransactionId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars like 0, O, 1, I
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result; // Compact 6-char ID
}

/**
 * Generate a custom Order ID
 * Format: GCY-XXXXXXX (e.g. GCY-8F2D1A9)
 */
export function generateOrderId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'GCY-';
    for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Normalize phone number to international format (234XXXXXXXXXX)
 */
export const normalizePhone = (phone) => {
    if (!phone) return "";
    let formatted = phone.replace(/\D/g, '');
    if (formatted.startsWith('0') && formatted.length === 11) {
        formatted = '234' + formatted.substring(1);
    } else if (formatted.startsWith('234')) {
        // already has prefix
    } else if (formatted.length === 10) {
        formatted = '234' + formatted;
    }
    return formatted;
};

/**
 * Clean logger for production - avoids stringifying massive objects like base64 images
 */
export const logger = {
    info: (msg, data = null) => {
        const sanitized = data ? JSON.parse(JSON.stringify(data, (key, value) => {
            if (key === 'images' || key === 'image' || (typeof value === 'string' && value.length > 1000)) return '[TRUNCATED]';
            return value;
        })) : null;
        console.log(`[${new Date().toISOString()}] [INFO] ${msg}`, sanitized ? JSON.stringify(sanitized) : "");
    },
    error: (msg, err) => {
        const errObj = err instanceof Error ? { message: err.message, stack: err.stack } : err;
        console.error(`[${new Date().toISOString()}] [ERROR] ${msg}`, errObj);
    },
    warn: (msg, data = null) => console.warn(`[${new Date().toISOString()}] [WARN] ${msg}`, data),
};
