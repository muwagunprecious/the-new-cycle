const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://postgres.qamfxfzxicraepxdncqd:IglooEstate2026%21@aws-0-eu-west-1.pooler.supabase.com:5432/postgres'
        }
    }
});
async function test() {
    try {
        await prisma.$connect();
        console.log('Connected!');
        const users = await prisma.user.count();
        console.log('Users:', users);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}
test();
