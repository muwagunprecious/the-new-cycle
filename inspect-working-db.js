
const { PrismaClient } = require('@prisma/client');

async function main() {
    const url = "postgresql://postgres.mrswfnmpmhbufhorutew:IglooEstate2026%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require";
    console.log('Inspecting working DB (mrswfnmpmhbufhorutew)...');

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: url
            }
        }
    });

    try {
        const users = await prisma.user.findMany({ take: 5 });
        console.log('Success! Found users:');
        users.forEach(u => console.log(`- ${u.email} (${u.role})`));

        const productCount = await prisma.product.count();
        console.log('Product count:', productCount);
    } catch (error) {
        console.error('Inspection failed:');
        console.error(error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
