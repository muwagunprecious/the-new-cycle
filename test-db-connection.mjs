import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log("DATABASE_URL length:", process.env.DATABASE_URL?.length);
console.log("DATABASE_URL includes pgbouncer=true:", process.env.DATABASE_URL?.includes('pgbouncer=true'));

const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function testConnection() {
    console.log("Attempting to connect to the database...");
    const startTime = Date.now();
    try {
        await prisma.$connect();
        const connectTime = Date.now() - startTime;
        console.log(`Successfully connected in ${connectTime}ms!`);

        const startQuery = Date.now();
        const result = await prisma.$queryRaw`SELECT 1 as result`;
        const queryTime = Date.now() - startQuery;
        console.log(`Successfully executed query in ${queryTime}ms. Result:`, result);

    } catch (e) {
        console.error("Connection failed after", Date.now() - startTime, "ms");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
