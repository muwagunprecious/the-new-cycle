import { NextResponse } from 'next/server'
import prisma from '@/backend/lib/prisma'

export async function POST(request) {
    try {
        const body = await request.json()
        const { userId, ninDocument, cacDocument, bankName, accountNumber, accountName } = body

        if (!userId || !ninDocument || !bankName || !accountNumber || !accountName) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Update user with verification documents
        await prisma.user.update({
            where: { id: userId },
            data: {
                ninDocument,
                cacDocument: cacDocument || null,
                bankName,
                accountNumber,
                accountName,
                // Keep accountStatus as 'pending' until admin verifies
            }
        })

        // Notify admin about new verification request
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
        const { createNotification } = await import('@/backend/actions/notification')

        // Send notifications in parallel to speed up response
        await Promise.all(admins.map(admin =>
            createNotification(
                admin.id,
                "New Buyer Verification Documents",
                `A buyer has submitted their verification documents and is awaiting your review.`,
                "SYSTEM"
            )
        ))

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Submit verification error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to submit documents' },
            { status: 500 }
        )
    }
}
