import { NextResponse } from 'next/server';
import prisma from '@/backend/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const products = await prisma.product.findMany({ include: { store: true } });
        return NextResponse.json(products);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
