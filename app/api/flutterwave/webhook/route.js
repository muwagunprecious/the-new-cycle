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
        const txStatus = data?.status // 'successful', 'failed', etc.

        console.log("SERVER: Webhook Received for Ref:", txRef, "Status:", txStatus)

        if (!txRef) return NextResponse.json({ status: 'ok' })

        // Find Order WITH user and store data for notifications
        let order;
        try {
            order = await prisma.order.findFirst({ 
                where: { paymentReference: txRef },
                include: { user: true, store: true }
            })
        } catch (dbErr) {
            console.warn("SERVER: Webhook DB Look-up Skip (DB Blocked)")
        }

        // If real order exists and payment is successful, update it
        if (order && !order.id.startsWith("ORD-MOCK-") && txStatus === 'successful') {
            try {
                const verificationCode = Math.random().toString(36).substring(2, 10).toUpperCase()
                
                const updatedOrder = await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        isPaid: true,
                        paymentStatus: 'verified',
                        flutterwaveId: flwId,
                        status: 'PAID',
                        verificationCode: verificationCode,
                        verificationStatus: 'PENDING'
                    },
                    include: { user: true, store: true }
                })

                // Trigger real-time notification to seller
                if (updatedOrder.store?.userId) {
                    try {
                        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
                        fetch(`${backendUrl}/api/orders/${order.id}/notify-seller`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                sellerId: updatedOrder.store.userId,
                                buyerName: updatedOrder.user?.name || 'Customer',
                                productName: "Battery Product",
                                amount: updatedOrder.total,
                                collectionDate: updatedOrder.collectionDate || 'Pending',
                                verificationCode: verificationCode
                            })
                        }).catch(e => console.warn("Socket notification trigger failed", e.message))
                    } catch (e) {}
                }
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
