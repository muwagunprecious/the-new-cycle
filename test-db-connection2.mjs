import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const directUrl = "postgresql://postgres.qamfxfzxicraepxdncqd:IglooEstate2026!@db.qamfxfzxicraepxdncqd.supabase.co:5432/postgres";

console.log("Testing DIRECT connection to:", directUrl);

const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
        db: {
            url: directUrl,
        },
    },
});

async function testConnection() {
    console.log("Attempting to connect to the DIRECT database...");
    const startTime = Date.now();
    try {
        await prisma.$connect();
        const connectTime = Date.now() - startTime;
        console.log(`Successfully connected DIRECTLY in ${connectTime}ms!`);

        const startQuery = Date.now();
        const result = await prisma.$queryRaw`SELECT 1 as result`;
        const queryTime = Date.now() - startQuery;
        console.log(`Successfully executed query DIRECTLY in ${queryTime}ms. Result:`, result);

    } catch (e) {
        console.error("Connection failed after", Date.now() - startTime, "ms");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
