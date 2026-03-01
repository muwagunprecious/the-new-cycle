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
        status: product.store?.status === 'approved' ? 'Approved' : 'Pending',
    };
}

/**
 * Generate a clean ID with prefix
 */
export function generateId(prefix = 'id') {
    return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clean logger for production
 */
export const logger = {
    info: (msg, data = {}) => console.log(`[INFO] ${msg}`, JSON.stringify(data)),
    error: (msg, err) => console.error(`[ERROR] ${msg}`, err),
    warn: (msg, data = {}) => console.warn(`[WARN] ${msg}`, data),
};
