'use server'

/**
 * QoreID Service Library
 * Handles authentication and communication with QoreID API
 */

const CLIENT_ID = process.env.QOREID_CLIENT_ID;
const SECRET_KEY = process.env.QOREID_SECRET_KEY;
const BASE_URL = process.env.QOREID_BASE_URL || 'https://api.qoreid.com';

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Get access token from QoreID
 */
async function getAccessToken() {
    // Check if token is still valid (with 5 min buffer)
    if (cachedToken && Date.now() < tokenExpiry - 300000) {
        return cachedToken;
    }

    try {
        const response = await fetch(`${BASE_URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                clientId: CLIENT_ID,
                secret: SECRET_KEY
            })
        });

        const data = await response.json();

        if (data.accessToken) {
            cachedToken = data.accessToken;
            // Token usually expires in 1 hour (3600s)
            tokenExpiry = Date.now() + (data.expiresIn || 3600) * 1000;
            return cachedToken;
        } else {
            throw new Error(data.message || 'Failed to obtain access token');
        }
    } catch (error) {
        console.error('QoreID Token Error:', error);
        throw error;
    }
}

/**
 * Generic request wrapper for QoreID API
 */
async function qoreidRequest(endpoint, method = 'POST', body = null) {
    try {
        const token = await getAccessToken();

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: body ? JSON.stringify(body) : null
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`QoreID API Error (${endpoint}):`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Verify NIN
 * @param {string} nin - 11 digit NIN
 * @param {object} userData - {firstname, lastname, dob} for matching
 */
export async function verifyNIN(nin, userData = {}) {
    const endpoint = '/v1/ng/identities/nin';
    const body = {
        firstname: userData.firstname,
        lastname: userData.lastname,
        idNumber: nin
    };

    return await qoreidRequest(endpoint, 'POST', body);
}

/**
 * Verify CAC
 * @param {string} rcNumber - RC Number
 * @param {string} companyName - Company Name
 */
export async function verifyCAC(rcNumber, companyName) {
    const endpoint = '/v2/ng/identities/cac-basic';
    const body = {
        registrationNumber: rcNumber,
        companyName: companyName
    };

    return await qoreidRequest(endpoint, 'POST', body);
}
