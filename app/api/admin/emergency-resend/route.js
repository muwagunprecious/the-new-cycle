import { NextResponse } from 'next/server'
import prisma from '@/backend-actions/lib/prisma'
import { buyerReceiptEmail, sellerOrderNotificationEmail, sendEmail } from '@/backend-actions/lib/email'
import { sendVerificationSMS } from '@/backend-actions/lib/sms'

export async function GET() {
    try {
        const userId = 'user_y6noa0ikq'
        const orders = await prisma.order.findMany({
            where: { userId, isPaid: true },
            include: { 
                user: true, 
                store: true, 
                orderItems: { include: { product: true } } 
            }
        })

        const results = []

        for (const order of orders) {
            console.log(`[EMERGENCY RESEND] Processing Order: ${order.id}`)
            
            const firstItem = order.orderItems?.[0]
            const productName = firstItem?.product?.name || 'Battery Product'
            const quantity = firstItem?.quantity || 1
            const collectionDate = order.collectionDate || new Date().toLocaleDateString()

            // 1. Buyer Email (Order Confirmation)
            if (order.user?.email) {
                try {
                    const { orderConfirmationEmail } = await import('@/backend-actions/lib/email')
                    const buyerContent = orderConfirmationEmail({
                        buyerName: order.user.name,
                        orderId: order.id,
                        productName: productName,
                        amount: order.total,
                        collectionDate: collectionDate,
                        sellerName: order.store?.name || 'Seller',
                        sellerPhone: order.store?.contact || 'N/A',
                        sellerAddress: order.store?.address || 'N/A'
                    })
                    await sendEmail({ to: order.user.email, ...buyerContent })
                } catch (e) { console.error("Buyer email err", e) }
            }

            // 2. Seller Email (New Order Notification)
            if (order.store?.email) {
                try {
                    const { sellerNewOrderEmail } = await import('@/backend-actions/lib/email')
                    const sellerContent = sellerNewOrderEmail({
                        sellerName: order.store.name,
                        orderId: order.id,
                        productName: productName,
                        amount: order.total,
                        quantity: quantity,
                        collectionDate: collectionDate,
                        token: order.verificationCode,
                        buyerName: order.user?.name || 'Customer'
                    })
                    await sendEmail({ to: order.store.email, ...sellerContent })
                } catch (e) { console.error("Seller email err", e) }
            }

            // 3. Seller SMS
            if (order.store?.contact) {
                await sendVerificationSMS(
                    order.store.contact, 
                    order.user?.name || 'Customer', 
                    order.verificationCode,
                    order.id
                )
            }
            
            results.push({ orderId: order.id, status: 'sent' })
        }

        return NextResponse.json({ success: true, processed: results })
    } catch (error) {
        console.error("[EMERGENCY RESEND ERROR]", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
