/**
 * Flutterwave Integration Library for Go-Cycle
 * 
 * Server-side helper for verifying Flutterwave transactions.
 * Uses the Flutterwave REST API directly (no SDK dependency issues).
 * 
 * NOTE: No 'use server' directive here — this is a utility library
 * imported by both server actions and API routes.
 */

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY
const FLW_BASE_URL = process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3'

/**
 * Verify a transaction with Flutterwave's API
 * @param {string} transactionId - The Flutterwave transaction ID
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function verifyFlutterwaveTransaction(transactionId) {
    try {
        const response = await fetch(`${FLW_BASE_URL}/transactions/${transactionId}/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${FLW_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        })

        const result = await response.json()

        if (result.status === 'success' && result.data?.status === 'successful') {
            return {
                success: true,
                data: result.data,
                message: 'Transaction verified successfully'
            }
        }

        return {
            success: false,
            data: result.data || null,
            message: result.message || 'Transaction verification failed'
        }
    } catch (error) {
        console.error('[Flutterwave] Verification error:', error)
        return {
            success: false,
            data: null,
            message: `Verification request failed: ${error.message}`
        }
    }
}

/**
 * Generate a unique payment reference for Flutterwave
 * Format: GCY-FLW-XXXXXXX
 */
export function generatePaymentRef() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = 'GCY-FLW-'
    for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

/**
 * Validate webhook signature from Flutterwave
 * @param {string} secretHash - The hash from the webhook header
 * @returns {boolean}
 */
export function validateWebhookSignature(secretHash) {
    const webhookSecret = process.env.FLW_WEBHOOK_SECRET
    if (!webhookSecret) {
        console.warn('[Flutterwave] No webhook secret configured')
        return false
    }
    return secretHash === webhookSecret
}
