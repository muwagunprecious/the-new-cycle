import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createTable() {
    try {
        console.log("Attempting to create Setting table manually...");
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "Setting" (
                "id" TEXT NOT NULL,
                "key" TEXT NOT NULL,
                "value" TEXT NOT NULL,
                "group" TEXT DEFAULT 'general',
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
            );
        `;
        await prisma.$executeRaw`
            CREATE UNIQUE INDEX IF NOT EXISTS "Setting_key_key" ON "Setting"("key");
        `;
        console.log("SUCCESS: Setting table created or already exists.");
    } catch (error) {
        console.error("Prisma query error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createTable();
