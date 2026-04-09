import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkTables() {
    try {
        const tables = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
        console.log("Tables in database:", JSON.stringify(tables, null, 2));
    } catch (error) {
        console.error("Prisma query error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkTables();
