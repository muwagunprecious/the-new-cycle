
const { PrismaClient } = require('@prisma/client');

async function checkSchema() {
    const prisma = new PrismaClient();
    try {
        const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `;
        console.log('Columns in users table:');
        columns.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));
    } catch (error) {
        console.error('Failed to check schema:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkSchema();
