import { NextResponse } from 'next/server'
import { verifyFlutterwaveTransaction } from '@/backend-actions/lib/flutterwave'
import prisma from '@/backend-actions/lib/prisma'

const FLW_BASE_URL = process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3'
const FLW_CLIENT_ID = process.env.FLUTTERWAVE_CLIENT_ID
const FLW_CLIENT_SECRET = process.env.FLUTTERWAVE_CLIENT_SECRET
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY

const FLW_TOKEN_URL = 'https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token'

// In-memory token cache (shared per serverless warm instance)
let _tokenCache = { token: null, expiresAt: 0 }

async function getAccessToken() {
    const now = Date.now()
    if (_tokenCache.token && now < _tokenCache.expiresAt - 60_000) {
        return _tokenCache.token
    }

    // If VP4 OAuth credentials are set, use them
    if (FLW_CLIENT_ID && FLW_CLIENT_SECRET) {
        const params = new URLSearchParams()
        params.append('client_id', FLW_CLIENT_ID)
        params.append('client_secret', FLW_CLIENT_SECRET)
        params.append('grant_type', 'client_credentials')

        const res = await fetch(FLW_TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        })

        const data = await res.json()

        if (data.access_token) {
            _tokenCache = {
                token: data.access_token,
                expiresAt: now + (data.expires_in || 600) * 1000
            }
            return _tokenCache.token
        }

        console.warn('[FLW Initiate] VP4 OAuth failed, falling back to secret key:', data)
    }

    // Fallback to v3 secret key
    if (FLW_SECRET_KEY) return FLW_SECRET_KEY

    throw new Error('No Flutterwave credentials configured.')
}

/**
 * POST /api/flutterwave/initiate
 *
 * Creates a VP4 / v3 hosted payment link and returns the redirect URL.
 * The frontend should redirect the user to this URL to complete payment.
 */
export async function POST(request) {
    try {
        const body = await request.json()
        const { orderId, amount, currency = 'NGN', txRef, customerEmail, customerName, customerPhone, productName } = body

        if (!txRef || !amount || !customerEmail) {
            return NextResponse.json({ success: false, message: 'Missing required payment fields' }, { status: 400 })
        }

        const accessToken = await getAccessToken()

        // Determine the app base URL for redirect
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://the-new-cycle-m8zx.vercel.app'
        const redirectUrl = `${appUrl}/payment/callback?tx_ref=${txRef}&order_id=${orderId || ''}`

        const paymentPayload = {
            tx_ref: txRef,
            amount: amount,
            currency: currency,
            redirect_url: redirectUrl,
            customer: {
                email: customerEmail,
                name: customerName || 'GoCycle Buyer',
                phone_number: customerPhone || ''
            },
            customizations: {
                title: 'GoCycle Battery Purchase',
                description: `Payment for ${productName || 'Battery'}`,
                logo: `${appUrl}/favicon.ico`
            },
            meta: {
                order_id: orderId || '',
                source: 'gocycle-web'
            }
        }

        const flwRes = await fetch(`${FLW_BASE_URL}/payments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentPayload)
        })

        const flwData = await flwRes.json()
        console.log('[FLW Initiate] Response:', flwData?.status, flwData?.message)

        if (flwData?.status === 'success' && flwData?.data?.link) {
            return NextResponse.json({
                success: true,
                paymentUrl: flwData.data.link,
                txRef
            })
        }

        return NextResponse.json({
            success: false,
            message: flwData?.message || 'Failed to create payment link'
        }, { status: 400 })

    } catch (error) {
        console.error('[FLW Initiate] Error:', error)
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}
