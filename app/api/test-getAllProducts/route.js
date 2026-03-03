import { NextResponse } from 'next/server';
import { getAllProducts } from '@/backend/actions/product';

export async function GET() {
    const res = await getAllProducts();
    return NextResponse.json(res);
}
