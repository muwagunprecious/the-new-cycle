const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addIndices() {
    console.log("Adding performance indices to the database...");
    
    const queries = [
        `CREATE INDEX IF NOT EXISTS "users_name_idx" ON "users"("name");`,
        `CREATE INDEX IF NOT EXISTS "users_accountStatus_idx" ON "users"("accountStatus");`,
        `CREATE INDEX IF NOT EXISTS "Order_payoutStatus_idx" ON "Order"("payoutStatus");`,
        `CREATE INDEX IF NOT EXISTS "Order_paymentStatus_idx" ON "Order"("paymentStatus");`,
        `CREATE INDEX IF NOT EXISTS "Order_isPaid_idx" ON "Order"("isPaid");`,
        `CREATE INDEX IF NOT EXISTS "Store_isActive_idx" ON "Store"("isActive");`,
        `CREATE INDEX IF NOT EXISTS "Product_status_idx" ON "Product"("status");`
    ];

    for (const query of queries) {
        try {
            await prisma.$executeRawUnsafe(query);
            console.log(`Executed: ${query}`);
        } catch (err) {
            console.warn(`Failed to execute: ${query}`, err.message);
        }
    }

    console.log("Performance indices added successfully.");
}

addIndices()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
