import { NextResponse } from 'next/server'
import { verifyFlutterwaveTransaction, validateWebhookSignature } from '@/backend-actions/lib/flutterwave'
import prisma from '@/backend-actions/lib/prisma'

export async function POST(request) {
    try {
        const secretHash = request.headers.get('verif-hash')
        if (!validateWebhookSignature(secretHash)) {
            return NextResponse.json({ status: 'error', message: 'Invalid hash' }, { status: 401 })
        }

        const payload = await request.json()
        const data = payload.data
        const txRef = data?.tx_ref
        const flwId = data?.id?.toString()

        console.log("SERVER: Webhook Received for Ref:", txRef)

        if (!txRef) return NextResponse.json({ status: 'ok' })

        // Find Order
        let order;
        try {
            order = await prisma.order.findFirst({ where: { paymentReference: txRef } })
        } catch (dbErr) {
            console.warn("SERVER: Webhook DB Look-up Skip (DB Blocked)")
        }

        // If real order exists, update it
        if (order && !order.id.startsWith("ORD-MOCK-")) {
            try {
                await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        isPaid: true,
                        paymentStatus: 'verified',
                        flutterwaveId: flwId,
                        status: 'PAID'
                    }
                })
            } catch (updErr) {
                 console.warn("SERVER: Webhook DB Update Fail (DB Blocked)")
            }
        }

        return NextResponse.json({ status: 'ok' })
    } catch (error) {
        console.error('SERVER: [Webhook API] Error:', error)
        return NextResponse.json({ status: 'ok' }) // Always 200 for FLW
    }
}
