'use server'

/**
 * QoreID Service Library
 * Handles authentication and communication with QoreID API
 */

import prisma from "@/backend/lib/prisma";

const DEFAULT_CLIENT_ID = process.env.QOREID_CLIENT_ID;
const DEFAULT_SECRET_KEY = process.env.QOREID_SECRET_KEY;
const DEFAULT_BASE_URL = process.env.QOREID_BASE_URL || 'https://api.qoreid.com';

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Helper to get QoreID config from DB with .env fallback
 */
export async function getQoreIDConfig() {
    try {
        const settings = await prisma.setting.findMany({
            where: { group: 'qoreid' }
        });

        const config = {
            clientId: settings.find(s => s.key === 'clientId')?.value || process.env.QOREID_CLIENT_ID || "BG2C18455E6X93WKFVX3",
            secretKey: settings.find(s => s.key === 'secretKey')?.value || process.env.QOREID_SECRET_KEY || "ee0362354ac0456aa83a36ced6dbbe21",
            baseUrl: settings.find(s => s.key === 'baseUrl' || s.key === 'qoreid_baseUrl')?.value || process.env.QOREID_BASE_URL || "https://api.qoreid.com"
        };
        return config;
    } catch (error) {
        console.error("Error fetching QoreID config from DB, using hardcoded fallbacks:", error.message);
        return {
            clientId: process.env.QOREID_CLIENT_ID || "BG2C18455E6X93WKFVX3",
            secretKey: process.env.QOREID_SECRET_KEY || "ee0362354ac0456aa83a36ced6dbbe21",
            baseUrl: process.env.QOREID_BASE_URL || "https://api.qoreid.com"
        };
    }
}

/**
 * Get access token from QoreID
 */
async function getAccessToken() {
    // Check if token is still valid (with 5 min buffer)
    if (cachedToken && Date.now() < tokenExpiry - 300000) {
        return cachedToken;
    }

    const { clientId, secretKey, baseUrl } = await getQoreIDConfig();

    if (!clientId || !secretKey) {
        const errorMsg = "QoreID Credentials Missing: Please check QoreID Settings in Admin panel or .env file.";
        console.error(errorMsg);
        throw new Error(errorMsg);
    }

    try {
        console.log('Requesting QoreID Token from:', `${baseUrl}/token`);

        const response = await fetch(`${baseUrl}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                clientId: clientId,
                secret: secretKey
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Token Request Failed (${response.status})`;

            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                errorMessage = errorText || errorMessage;
            }

            console.error('QoreID Token Error Details:', errorText);
            throw new Error(`QoreID Authentication Failed: ${errorMessage}`);
        }

        const data = await response.json();

        if (data.accessToken) {
            cachedToken = data.accessToken;
            // Token usually expires in 1 hour (3600s)
            tokenExpiry = Date.now() + (data.expiresIn || 3600) * 1000;
            console.log('QoreID Token successfully obtained.');
            return cachedToken;
        } else {
            throw new Error(data.message || 'Failed to obtain access token: No accessToken in response');
        }
    } catch (error) {
        console.error('QoreID Token Exception:', error.message);
        throw error;
    }
}

/**
 * Generic request wrapper for QoreID API
 */
async function qoreidRequest(endpoint, method = 'POST', body = null) {
    try {
        const { clientId, baseUrl } = await getQoreIDConfig();
        const token = await getAccessToken();

        const response = await fetch(`${baseUrl}${endpoint}`, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-api-key': clientId,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: body ? JSON.stringify(body) : null
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return data;
        } else {
            const text = await response.text();
            console.error(`QoreID Non-JSON Response (${endpoint}):`, text);

            if (response.status === 404) {
                return {
                    success: false,
                    error: "Verification service endpoint not found. Please contact support.",
                    details: text
                };
            }

            if (response.status === 403) {
                return {
                    success: false,
                    error: "Permission denied: Forbidden resource. Please check if your QoreID API keys are valid and have NIN verification enabled.",
                    details: text
                };
            }

            return {
                success: false,
                error: `External service error (${response.status}): Forbidden or Unauthorized`,
                details: text
            };
        }
    } catch (error) {
        console.error(`QoreID API Error (${endpoint}):`, error);
        return { success: false, error: "Connection to verification service failed. Please try again later." };
    }
}

/**
 * Verify NIN
 * @param {string} nin - 11 digit NIN
 * @param {object} userData - {firstname, lastname, dob} for matching
 */
export async function verifyNIN(nin, userData = {}) {
    const endpoint = `/v1/ng/identities/nin/${nin}`;
    const body = {
        firstname: userData.firstname || "FETCH",
        lastname: userData.lastname || "FETCH"
    };

    const data = await qoreidRequest(endpoint, 'POST', body);
    
    // Process and return consolidated bio data
    const bioRoot = data.nin || data.applicant || data.summary?.nin_check?.applicant || data;
    const getVal = (obj, keys) => {
        if (!obj) return null;
        for (const k of keys) {
            const v = obj[k];
            if (v && typeof v === 'string' && v.length > 0 && v.toUpperCase() !== 'FETCH') {
                return v;
            }
        }
        return null;
    };

    return {
        ...data,
        extractedFirstName: getVal(bioRoot, ['firstname', 'first_name', 'firstName']),
        extractedLastName: getVal(bioRoot, ['lastname', 'last_name', 'lastName']),
        bioRoot // For debugging
    };
}

/**
 * Verify CAC (Premium)
 * @param {string} rcNumber - RC Number (RC/BN/IT)
 */
export async function verifyCAC(rcNumber) {
    const endpoint = '/v1/ng/identities/cac-premium';
    const body = {
        regNumber: rcNumber.trim()
    };

    return await qoreidRequest(endpoint, 'POST', body);
}
