import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function nuke() {
    console.log("\n⚠️ [STARTING DATABASE NUKE]");
    
    // Order matters to respect Foreign Key constraints
    const models = [
        'orderItem',
        'rating',
        'notification',
        'address',
        'order',
        'product',
        'store',
        'user',
        'setting',
        'coupon'
    ];

    try {
        for (const model of models) {
            console.log(`Clearing ${model}...`);
            const result = await prisma[model].deleteMany({});
            console.log(`✅ Deleted ${result.count} records from ${model}.`);
        }
        console.log("\n✨ DATABASE WAS SUCCESSFULLY NUKED.");
    } catch (error) {
        console.error("\n❌ NUKE FAILED:", error.message);
        if (error.message.includes("Can't reach database")) {
            console.log("HINT: Your network blockage is preventing the deletion.");
        }
    } finally {
        await prisma.$disconnect();
    }
}

nuke();
