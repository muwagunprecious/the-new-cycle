import { NextResponse } from 'next/server';
import prisma from '@/backend/lib/prisma';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: { store: true }
        });
        return NextResponse.json({ products });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
