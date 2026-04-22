/**
 * Map Prisma Product to frontend-friendly structure
 */
export function mapProductToFrontend(product) {
    if (!product) return null;
    return {
        ...product,
        unitsAvailable: product.quantity,
        batteryType: product.type === 'CAR_TRUCK_WET' ? 'Cars and Truck batt (Wet cell)' :
            product.type === 'INVERTER_DRY' ? 'Inverter Batt (Dry cell)' : 'Inverter Batt (Wet Cell)',
        status: product.status || 'pending',
        rejectionReason: product.rejectionReason,
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
 * Clean logger for production
 */
export const logger = {
    info: (msg, data = {}) => console.log(`[INFO] ${msg}`, JSON.stringify(data)),
    error: (msg, err) => console.error(`[ERROR] ${msg}`, err?.message || err || ""),
    warn: (msg, data = {}) => console.warn(`[WARN] ${msg}`, data),
};
