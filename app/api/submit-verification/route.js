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
                accountStatus: 'approved',
                verifiedAt: new Date()
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Submit verification error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to submit documents' },
            { status: 500 }
        )
    }
}
