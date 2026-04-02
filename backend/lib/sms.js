'use server'

/**
 * Termii SMS Utility
 */

import prisma from "@/backend/lib/prisma";

const API_KEY = process.env.TERMII_API_KEY;
const BASE_URL = process.env.TERMII_BASE_URL;
const SENDER_ID = process.env.TERMII_SENDER_ID || "GoCycle";

/**
 * Helper to get Termii config from DB with .env fallback
 */
async function getTermiiConfig() {
    try {
        const settings = await prisma.setting.findMany({
            where: { group: 'termii' }
        });
        
        const config = {};
        settings.forEach(s => config[s.key] = s.value);
        
        return {
            apiKey: config.apiKey || API_KEY,
            baseUrl: config.baseUrl || BASE_URL,
            senderId: config.senderId || SENDER_ID
        };
    } catch (error) {
        return { apiKey: API_KEY, baseUrl: BASE_URL, senderId: SENDER_ID };
    }
}

export async function sendSMS(to, message) {
    const config = await getTermiiConfig();
    const { apiKey, baseUrl } = config;

    if (!apiKey || !baseUrl) {
        console.error("Termii configuration missing");
        return { success: false, error: "SMS service not configured" };
    }

    // Ensure phone number is in international format for Nigeria
    let formattedTo = to.replace(/\D/g, '');
    if (formattedTo.startsWith('0')) {
        formattedTo = '234' + formattedTo.substring(1);
    } else if (!formattedTo.startsWith('234')) {
        if (formattedTo.length === 10) formattedTo = '234' + formattedTo;
        else if (formattedTo.length === 11 && formattedTo.startsWith('8')) formattedTo = '234' + formattedTo.substring(1);
    }

    // Fallback strategy for Sender IDs
    // If the configured one fails, we try common defaults
    const senderIds = ["GoCycle", "N-Alert", "talert", "Termii"];
    
    for (const senderId of senderIds) {
        try {
            console.log(`\nAttempting with [${senderId}]...`);
            const payload = {
                api_key: apiKey,
                to: formattedTo,
                from: senderId,
                sms: message,
                type: "plain",
                channel: "generic"
            };

            const response = await fetch(`${baseUrl}/api/sms/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log(`Response [${response.status}]:`, JSON.stringify(data));

            if (response.ok && data.code === "ok") {
                console.log(`✅ Success with [${senderId}]`);
                return { success: true, data, usedSenderId: senderId };
            }
        } catch (error) {
            console.error(`ERROR with [${senderId}]:`, error.message);
        }
    }

    // Final Fallback: Number API (Uses auto-generated numbers, bypasses Sender ID requirement)
    try {
        console.log(`\nFinal Attempt: Using Termii Number API...`);
        const numberPayload = {
            api_key: apiKey,
            to: formattedTo,
            sms: message
        };

        const response = await fetch(`${baseUrl}/api/sms/number/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(numberPayload),
        });

        const data = await response.json();
        console.log(`Number API Response [${response.status}]:`, JSON.stringify(data));

        if (response.ok && (data.code === "ok" || response.status === 200)) {
            console.log(`✅ Success via Termii Number API`);
            return { success: true, data, usedMethod: "NumberAPI" };
        }
    } catch (error) {
        console.error(`Number API Connection Error:`, error.message);
    }

    return { success: false, error: "Failed to send SMS after trying all methods (including Number API)." };
}

/**
 * Send an OTP via Termii Token API (Specialized for OTP delivery)
 * @param {string} to - Recipient phone number
 * @param {string} otp - The OTP code
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function sendOTP(to, otp) {
    const config = await getTermiiConfig();
    const { apiKey, baseUrl, senderId } = config;

    if (!apiKey || !baseUrl) {
        console.error("Termii configuration missing");
        return { success: false, error: "SMS service not configured" };
    }

    // Ensure phone number is in international format for Nigeria
    let formattedTo = to.replace(/\D/g, '');
    if (formattedTo.startsWith('0')) {
        formattedTo = '234' + formattedTo.substring(1);
    } else if (!formattedTo.startsWith('234')) {
        if (formattedTo.length === 10) formattedTo = '234' + formattedTo;
        else if (formattedTo.length === 11 && formattedTo.startsWith('8')) formattedTo = '234' + formattedTo.substring(1);
    }

    try {
        console.log(`\n--- Termii OTP Request [${formattedTo}] ---`);
        const payload = {
            api_key: apiKey,
            message_type: "NUMERIC",
            to: formattedTo,
            from: senderId, 
            channel: "generic",
            pin_attempts: 10,
            pin_time_to_live: 10,
            pin_length: 6,
            pin_placeholder: "< 123456 >",
            message_text: `Your GoCycle verification code is < ${otp} >. Valid for 10 minutes.`,
            pin_type: "NUMERIC"
        };

        const response = await fetch(`${baseUrl}/api/sms/otp/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log(`Token API Response [${response.status}]:`, JSON.stringify(data));

        if (response.ok && data.code === "ok") {
            console.log(`✅ OTP successfully sent via Token API to ${formattedTo}`);
            return { success: true, data };
        } else {
            console.error(`Termii Token API Error [${response.status}]:`, data);
            
            // Check for specific "SenderId not found" error
            const errorMsg = data.message || (typeof data === 'string' ? data : "");
            if (errorMsg.toLowerCase().includes("senderid") || errorMsg.includes("404") || errorMsg.includes("not found")) {
                console.warn(`⚠️ Sender ID [${senderId}] issues. Falling back to standard SMS.`);
                return sendSMS(to, `Your GoCycle verification code is: ${otp}`);
            }

            return { success: false, error: errorMsg || "Failed to send OTP via specialized API" };
        }
    } catch (error) {
        console.error("Termii Token API Connection Error:", error.message);
        return sendSMS(to, `Your GoCycle verification code is: ${otp}`);
    }
}
