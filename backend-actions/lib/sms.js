'use server'

/**
 * Termii SMS Utility — Corrected per Termii Documentation
 * 
 * Key findings from docs:
 * - "generic" channel = used for current account config (Campteller)
 * - "dnd" channel = transactional/OTPs (alternative route)
 * - Token API = Professional OTP generation and verification
 * - Number API = no Sender ID required, auto-generated numbers, fallback
 */

import prisma from "@/backend-actions/lib/prisma";
import { normalizePhone } from "@/backend-actions/lib/api-utils";

const API_KEY = process.env.TERMII_API_KEY;
const BASE_URL = process.env.TERMII_BASE_URL || "https://v3.api.termii.com";

/**
 * Helper to get Termii config from DB with .env fallback
 */
export async function getTermiiConfig() {
    try {
        const settings = await prisma.setting.findMany({
            where: { group: 'termii' }
        });

        // PRIORITY: 1. DB Settings, 2. Process Env, 3. Hardcoded Fallback
        const apiKey = settings.find(s => s.key === 'apiKey')?.value || process.env.TERMII_API_KEY;
        const baseUrl = settings.find(s => s.key === 'baseUrl')?.value || process.env.TERMII_BASE_URL || "https://api.ng.termii.com";
        const senderId = settings.find(s => s.key === 'senderId')?.value || process.env.TERMII_SENDER_ID || "N-Alert";

        console.log(`[SMS CONFIG] Source: ${settings.length > 0 ? "Database" : "Environment"}`);
        console.log(`[SMS CONFIG] Using Sender ID: ${senderId}`);
        
        return { 
            apiKey: apiKey || "TLkGPTUpDYXYHSCCsfjVVehHNqOhINliOASfUaCuLiPRRiTthREYIYvVKDFfRT",
            baseUrl, 
            senderId 
        };
    } catch (error) {
        console.error("[SMS CONFIG ERROR] Falling back to Env/Default:", error.message);
        return {
            apiKey: process.env.TERMII_API_KEY || "TLkGPTUpDYXYHSCCsfjVVehHNqOhINliOASfUaCuLiPRRiTthREYIYvVKDFfRT",
            baseUrl: process.env.TERMII_BASE_URL || "https://api.ng.termii.com",
            senderId: process.env.TERMII_SENDER_ID || "N-Alert"
        };
    }
}

/**
 * Send OTP via Termii
 * Can handle both system-generated codes and Termii-generated tokens.
 */
export async function sendOTP(to, messageOrCode = null) {

    const { apiKey, baseUrl, senderId } = await getTermiiConfig();

    if (!apiKey) {
        console.error("[TERMII ERROR] API Key is missing in Environment and Database");
        return { success: false, error: "SMS service not configured" };
    }
    
    console.log(`[TERMII ACTION] Initiating OTP send to ${to} via ${baseUrl}`);

    const formattedTo = normalizePhone(to);
    const finalSenderId = "N-Alert"; // Explicitly match Termii's approved sender
    
    // Determine if we are sending a code or a message
    let finalMessage = "";
    let isPlainSms = false;

    if (messageOrCode && /^\d{4,8}$/.test(messageOrCode)) {
        // ✅ EXACT APPROVED FORMAT: "Your GoCycle confirmation is {code}. Valid for 1 hour, one time use only"
        finalMessage = `Your GoCycle confirmation is ${messageOrCode}. Valid for 1 hour, one time use only`;
        isPlainSms = true;
    } else if (messageOrCode) {
        finalMessage = messageOrCode;
        isPlainSms = true;
    } else {
        // Fallback for Token API
        finalMessage = "Your GoCycle confirmation is < 1234 >. Valid for 1 hour, one time use only";
    }

    // ✅ METHOD 1: Plain SMS (DND Channel - as per Termii instruction)
    if (isPlainSms) {
        try {
            console.log(`\n--- Termii DND Channel → ${formattedTo} ---`);
            const response = await fetch(`${baseUrl}/api/sms/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    api_key: apiKey,
                    to: formattedTo,
                    from: finalSenderId,
                    sms: finalMessage,
                    type: "plain",
                    channel: "dnd" 
                }),
            });

            const data = await response.json();
            console.log(`[DND Response]:`, JSON.stringify(data));

            if (data.message === "Successfully Sent" || data.code === "ok") {
                return { success: true, method: 'plain_sms_dnd', data };
            }

            // 🔄 FALLBACK 1B: Generic channel
            console.log(`--- Retrying via Generic Channel... ---`);
            const genericResponse = await fetch(`${baseUrl}/api/sms/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    api_key: apiKey,
                    to: formattedTo,
                    from: finalSenderId,
                    sms: finalMessage,
                    type: "plain",
                    channel: "generic"
                }),
            });
            const genericData = await genericResponse.json();
            console.log(`[Generic Response]:`, JSON.stringify(genericData));
            if (genericData.message === "Successfully Sent" || genericData.code === "ok") {
                return { success: true, method: 'plain_sms_generic', data: genericData };
            }
            
            return { success: false, error: genericData.message || "All routes failed" };
        } catch (error) {
            console.error(`SMS Exception:`, error.message);
            return { success: false, error: "Network error while sending SMS" };
        }
    } else {
        // ✅ METHOD 2: Professional Token API (DND)
        try {
            console.log(`\n--- Termii Token API (DND) → ${formattedTo} ---`);
            const response = await fetch(`${baseUrl}/api/sms/otp/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    api_key: apiKey,
                    message_type: "NUMERIC",
                    to: formattedTo,
                    from: finalSenderId,
                    channel: "dnd", 
                    pin_attempts: 3,
                    pin_time_to_live: 60, // Match "1 hour" from template
                    pin_length: 6,
                    pin_placeholder: "< 1234 >",
                    message_text: finalMessage,
                    pin_type: "NUMERIC"
                }),
            });

            const data = await response.json();
            console.log(`[Token API Response]:`, JSON.stringify(data));

            if (data.pinId || data.pin_id) {
                return { success: true, pinId: data.pinId || data.pin_id, data };
            }

            // 🔄 Fallback for Token API
            return { success: false, error: data.message || "Token API rejected request" };
        } catch (error) {
            console.error(`Token API exception:`, error.message);
        }
    }

    return { success: false, error: "Total delivery failure across all methods." };
}

/**
 * Send an OTP via Voice Call (Fallback for SMS blockers)
 * @param {string} to - Recipient phone number (international format)
 * @param {number} code - Numeric code to be read out (4-8 digits)
 */
export async function sendVoiceOTP(to, code) {
  const { apiKey, baseUrl } = await getTermiiConfig();
  const formattedTo = normalizePhone(to);

  try {
    const response = await fetch(`${baseUrl}/api/sms/otp/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        phone_number: formattedTo,
        code: parseInt(code)
      })
    });

    const data = await response.json();
    if (data.code === "ok" || data.status === "success") {
      return { success: true, messageId: data.message_id };
    }
    return { success: false, error: data.message || "Voice call failed" };
  } catch (error) {
    console.error("Termii Voice Error:", error);
    return { success: false, error: "Connection failed" };
  }
}

/**
 * Verify OTP via Termii Token API
 */
export async function verifyOTP(pinId, pin) {
    const { apiKey, baseUrl } = await getTermiiConfig();

    if (!apiKey) return { success: false, error: "SMS service not configured" };

    try {
        const response = await fetch(`${baseUrl}/api/sms/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: apiKey,
                pin_id: pinId,
                pin: pin
            }),
        });

        const data = await response.json();
        console.log(`Verify OTP Response:`, JSON.stringify(data));

        if (data.verified === true || data.verified === "true") {
            return { success: true, verified: true };
        }
        return { success: false, verified: false, message: data.message || "Invalid or expired code" };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * General SMS sending (non-OTP messages)
 */
export async function sendSMS(to, message) {

    const { apiKey, baseUrl } = await getTermiiConfig();

    if (!apiKey) {
        return { success: false, error: "SMS service not configured" };
    }

    const formattedTo = normalizePhone(to);

    try {
        const response = await fetch(`${baseUrl}/api/sms/number/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: apiKey, to: formattedTo, sms: message }),
        });
        const data = await response.json();
        if (data.code === "ok") return { success: true, data };
        return { success: false, error: data.message || "SMS failed" };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
