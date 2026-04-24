/**
 * Shared pricing constants and helpers.
 * This file is imported by both server actions and client components.
 * Do NOT add 'use server' or 'use client' here.
 */

/** Canonical default prices — used as fallback when admin hasn't set a value */
export const DEFAULT_BATTERY_PRICES = {
    "Cars and Truck batt (Wet cell)": {
        "36": 5000, "45": 7000, "65": 7500, "75": 10000, "88": 12000,
        "100": 13000, "105": 15000, "120": 20000, "150": 25000, "200": 35000, "220": 40000
    },
    "Inverter Batt (Dry cell)": {
        "100": 30000, "150": 50000, "200": 60000, "250": 70000
    },
    "Inverter Batt (Wet Cell)": {
        "200": 50000, "220": 55000, "250": 60000
    }
}

/** Available amp sizes per battery type (used to populate dropdowns) */
export const BATTERY_SIZE_OPTIONS = {
    "Cars and Truck batt (Wet cell)": ["36","45","65","75","88","100","105","120","150","200","220"],
    "Inverter Batt (Dry cell)": ["100","150","200","250"],
    "Inverter Batt (Wet Cell)": ["200","220","250"]
}

/** Names of the supported battery types */
/** Map from User-facing label to DB Enum value */
export const BATTERY_TYPE_MAPPING = {
    "Cars and Truck batt (Wet cell)": "CAR_TRUCK_WET",
    "Inverter Batt (Dry cell)":       "INVERTER_DRY",
    "Inverter Batt (Wet Cell)":       "INVERTER_WET"
}

/** Names of the supported battery types */
export const BATTERY_TYPES = Object.keys(DEFAULT_BATTERY_PRICES)

// --- Key encoding for DB storage ---
const TYPE_KEY_MAP = {
    "Cars and Truck batt (Wet cell)": "car_wet",
    "Inverter Batt (Dry cell)":       "inv_dry",
    "Inverter Batt (Wet Cell)":       "inv_wet"
}

export function encodePricingKey(batteryType, amps) {
    const prefix = TYPE_KEY_MAP[batteryType] || "unknown"
    return `${prefix}_${amps}`
}

export function decodePricingKey(key) {
    const reverseMap = Object.fromEntries(Object.entries(TYPE_KEY_MAP).map(([k, v]) => [v, k]))
    const match = key.match(/^(.+)_(\d+)$/)
    if (!match) return null
    const amps = match[2]
    const prefix = key.slice(0, key.lastIndexOf('_'))
    const batteryType = reverseMap[prefix]
    if (!batteryType) return null
    return { batteryType, amps }
}
