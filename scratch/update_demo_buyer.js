const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const email = 'adebayo@ecovolt.com'
    const newPhone = '09023323399'
    const newStreet = '12, yaba street, off glory land estate'

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { Address: true }
        })

        if (!user) {
            console.error(`User with email ${email} not found.`)
            return
        }

        // Update User phone
        await prisma.user.update({
            where: { id: user.id },
            data: { phone: newPhone }
        })
        console.log(`Updated user phone to ${newPhone}`)

        // Update or Create Address
        if (user.Address && user.Address.length > 0) {
            const address = user.Address[0]
            await prisma.address.update({
                where: { id: address.id },
                data: {
                    street: newStreet,
                    phone: newPhone
                }
            })
            console.log(`Updated existing address street to ${newStreet}`)
        } else {
            await prisma.address.create({
                data: {
                    userId: user.id,
                    name: user.fullName || user.name || 'Demo Buyer',
                    email: user.email,
                    street: newStreet,
                    city: 'Lagos',
                    state: 'Lagos',
                    zip: '100001',
                    country: 'Nigeria',
                    phone: newPhone
                }
            })
            console.log(`Created new address for user with street ${newStreet}`)
        }

        console.log('Update successful!')
    } catch (error) {
        console.error('Error updating user:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
