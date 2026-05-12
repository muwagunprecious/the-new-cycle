/**
 * Script to apply database performance indices
 * Run with: node scripts/apply-performance-indices.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function applyIndices() {
    console.log("Applying performance indices to the database...");
    
    const indices = [
        { name: 'users_name_idx', sql: 'CREATE INDEX IF NOT EXISTS "users_name_idx" ON "users"("name")' },
        { name: 'users_accountStatus_idx', sql: 'CREATE INDEX IF NOT EXISTS "users_accountStatus_idx" ON "users"("accountStatus")' },
        { name: 'Order_payoutStatus_idx', sql: 'CREATE INDEX IF NOT EXISTS "Order_payoutStatus_idx" ON "Order"("payoutStatus")' },
        { name: 'Order_paymentStatus_idx', sql: 'CREATE INDEX IF NOT EXISTS "Order_paymentStatus_idx" ON "Order"("paymentStatus")' },
        { name: 'Order_isPaid_idx', sql: 'CREATE INDEX IF NOT EXISTS "Order_isPaid_idx" ON "Order"("isPaid")' },
        { name: 'Store_isActive_idx', sql: 'CREATE INDEX IF NOT EXISTS "Store_isActive_idx" ON "Store"("isActive")' },
        { name: 'Product_status_storeId_idx', sql: 'CREATE INDEX IF NOT EXISTS "Product_status_storeId_idx" ON "Product"("status", "storeId")' },
        { name: 'Order_createdAt_idx', sql: 'CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt")' },
        { name: 'Notification_userId_status_idx', sql: 'CREATE INDEX IF NOT EXISTS "Notification_userId_status_idx" ON "Notification"("userId", "status")' },
    ];

    for (const index of indices) {
        try {
            await prisma.$executeRawUnsafe(index.sql);
            console.log(`✓ Applied index: ${index.name}`);
        } catch (err) {
            console.warn(`✗ Failed to apply ${index.name}: ${err.message}`);
        }
    }
    
    console.log("\nPerformance indices applied successfully.");
}

applyIndices()
    .catch(e => {
        console.error("Failed to apply indices:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());