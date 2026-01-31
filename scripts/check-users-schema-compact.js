
const { PrismaClient } = require('@prisma/client');

async function checkSchema() {
    const prisma = new PrismaClient();
    try {
        const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `;
        console.log('Columns in users table:');
        console.log(columns.map(c => c.column_name).join(', '));
    } catch (error) {
        console.error('Failed to check schema:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkSchema();
