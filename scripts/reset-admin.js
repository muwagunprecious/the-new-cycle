
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function resetPassword() {
    const prisma = new PrismaClient();
    try {
        const email = 'ademuwagun@gmail.com';
        const newPassword = 'admin123';
        console.log(`Resetting password for ${email} to ${newPassword}...`);

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'ADMIN',
                isEmailVerified: true
            },
            create: {
                id: 'user_seed_reset',
                email: email,
                name: 'Admin User',
                password: hashedPassword,
                role: 'ADMIN',
                isEmailVerified: true,
                image: '',
                cart: {}
            }
        });

        console.log('Success! User updated/created:', user.email);
    } catch (error) {
        console.error('Failed to reset password:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
