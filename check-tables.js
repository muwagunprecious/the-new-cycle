const { PrismaClient } = require('@prisma/client');

async function checkTables() {
    const prisma = new PrismaClient();
    try {
        console.log("Checking database connection and tables...");
        await prisma.$connect();
        console.log("Connected successfully.");

        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

        console.log("Tables in 'public' schema:");
        tables.forEach(t => console.log(`- ${t.table_name}`));

        const usersExists = tables.some(t => t.table_name === 'users');
        console.log(`Table 'users' exists: ${usersExists}`);

    } catch (error) {
        console.error("Error connecting to database:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkTables();
