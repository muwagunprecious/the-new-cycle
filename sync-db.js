const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Applying raw SQL schema patches via Prisma pooler connection...");
    
    const requiredColumns = [
        { name: "firstName", type: "TEXT" },
        { name: "lastName", type: "TEXT" },
        { name: "fullName", type: "TEXT" },
        { name: "ninDocument", type: "TEXT" },
        { name: "cacDocument", type: "TEXT" },
        { name: "businessName", type: "TEXT" },
        { name: "businessType", type: "TEXT" },
        { name: "verificationNotes", type: "TEXT" },
        { name: "verificationCode", type: "TEXT" },
        { name: "verifiedAt", type: "TIMESTAMP(3)" },
        { name: "identityToken", type: "TEXT" },
        { name: "businessToken", type: "TEXT" },
        { name: "isDirectorVerified", type: "BOOLEAN", default: "FALSE" }
    ];

    for (const col of requiredColumns) {
        try {
            const defaultQuery = col.default ? ` DEFAULT ${col.default}` : '';
            await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN "${col.name}" ${col.type}${defaultQuery};`);
            console.log(`✅ Added column ${col.name} successfully.`);
        } catch (e) {
            // Error 42701 means column already exists
            if (e.message && e.message.includes("42701")) {
                console.log(`⏩ Column ${col.name} already exists. Skipping.`);
            } else {
                console.error(`❌ Failed to add column ${col.name}:`, e.message);
            }
        }
    }

    console.log("\nDatabase schema patching completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("Critical Failure:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
