const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCreate() {
    const timestamp = Date.now();
    try {
        console.log('Attempting to create a user...');
        const user = await prisma.user.create({
            data: {
                id: "test_" + timestamp,
                name: "Test User " + timestamp,
                email: "test_" + timestamp + "@example.com",
                password: "hashed_password",
                image: "",
                role: 'USER',
                phone: "phone_" + timestamp,
                isEmailVerified: false,
                isPhoneVerified: false,
                cart: "{}"
            }
        });
        console.log('User created successfully:', user.id);
    } catch (err) {
        console.error('CREATE_ERROR_START');
        console.error(err);
        console.error('CREATE_ERROR_END');
    } finally {
        await prisma.$disconnect();
    }
}

testCreate();
