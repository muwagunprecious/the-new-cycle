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

    if (!CLIENT_ID || !SECRET_KEY) {
        const errorMsg = "QoreID Credentials Missing: Please check QOREID_CLIENT_ID and QOREID_SECRET_KEY in your .env file.";
        console.error(errorMsg);
        throw new Error(errorMsg);
    }

    try {
        console.log('Requesting QoreID Token from:', `${BASE_URL}/token`);

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
        const token = await getAccessToken();

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-api-key': CLIENT_ID,
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
        firstname: userData.firstname,
        lastname: userData.lastname
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
