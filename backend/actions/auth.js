'use server'

import prisma from "@/backend/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerUser(userData) {
    try {
        let { name, email, password, role, whatsapp, businessName } = userData

        // Map BUYER to USER for Prisma schema compatibility
        if (role === 'BUYER') {
            role = 'USER'
        }

        // Primary check: Phone number must be unique
        const phoneExists = await prisma.user.findUnique({
            where: { phone: whatsapp }
        })

        if (phoneExists) {
            return { success: false, error: "A user with this phone number already exists" }
        }

        // Secondary check: If email is provided, it must be unique
        if (email) {
            const emailExists = await prisma.user.findUnique({
                where: { email }
            })
            if (emailExists) {
                return { success: false, error: "A user with this email already exists" }
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Mock OTP generation (In production, use crypto.randomInt)
        const emailOtp = Math.floor(100000 + Math.random() * 900000).toString()
        const phoneOtp = Math.floor(100000 + Math.random() * 900000).toString()

        // Log OTPs for now (Integration Placeholder)
        if (email) console.log(`[Validation] EMAIL OTP for ${email}: ${emailOtp}`)
        console.log(`[Validation] PHONE OTP for ${whatsapp}: ${phoneOtp}`)

        const user = await prisma.user.create({
            data: {
                id: "user_" + Math.random().toString(36).substr(2, 9),
                name,
                email,
                password: hashedPassword,
                image: "",
                role: role || 'USER',
                phone: whatsapp,
                isEmailVerified: false, // Enforce verification
                isPhoneVerified: false,
                cart: "{}", // Initialize cart
                // Buyer verification fields
                accountStatus: role === 'USER' ? 'pending' : 'approved', // Sellers have their own store verification
                ninDocument: userData.ninDocument || null,
                cacDocument: userData.cacDocument || null,
                bankName: userData.bankName || null,
                accountNumber: userData.accountNumber || null,
                accountName: userData.accountName || null
            }
        })

        if (role === 'USER') {
            // Notify Admin about new buyer
            const { createNotification } = await import('./notification')
            // Find admins
            const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
            for (const admin of admins) {
                await createNotification(
                    admin.id,
                    "New Buyer Registration",
                    `${name} has registered as a buyer and is awaiting verification.`,
                    "SYSTEM"
                )
            }
        }

        // If user is a seller, auto-create a pending store application
        if (role === 'SELLER') {
            const finalBusinessName = (businessName && businessName.trim()) || `${name}'s Store`
            const username = finalBusinessName.toLowerCase().replace(/\s/g, '_') + "_" + Math.random().toString(36).substr(2, 4)

            await prisma.store.create({
                data: {
                    name: finalBusinessName,
                    username: username,
                    description: "Battery Vendor",
                    address: "To be updated",
                    email: email,
                    contact: whatsapp || "",
                    logo: "",
                    status: "pending",
                    isActive: false,
                    userId: user.id
                }
            })
        }

        // Mock sending
        // sendEmail(email, emailOtp)

        return { success: true, user, requiresVerification: true }
    } catch (error) {
        console.error("Register Error:", error)

        // Handle unique constraint violations
        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0]
            if (field === 'email') {
                return { success: false, error: "This email address is already registered. Please login instead." }
            } else if (field === 'phone') {
                return { success: false, error: "This phone number is already registered. Please login instead." }
            }
            return { success: false, error: "An account with these details already exists." }
        }

        return { success: false, error: "Registration failed: " + error.message }
    }
}

export async function loginUser(identifier, password) {
    try {
        // Try searching by email or phone
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier }
                ]
            }
        })

        if (!user) {
            console.log(`[LoginDebug] User not found for identifier: ${identifier}`)
            return { success: false, error: "Invalid credentials" }
        }

        if (user.password) {
            const isMatch = await bcrypt.compare(password, user.password)
            console.log(`[LoginDebug] Attempt for ${identifier}: password provided, match results: ${isMatch}`)
            if (!isMatch) return { success: false, error: "Invalid credentials" }
        } else {
            console.log(`[LoginDebug] User ${identifier} has no password set.`)
            return { success: false, error: "Invalid credentials" }
        }

        if (!user.isEmailVerified) {
            return { success: true, user, requiresVerification: true }
        }



        return { success: true, user }
    } catch (error) {
        console.error("Login Error Details:", error)
        return { success: false, error: "Login failed: " + error.message }
    }
}

// Update verification logic to mark both verified if code is matched
export async function verifyOTP(identifier, code, type = 'PHONE') {
    // Simplest: Always accept '123456' for demo purposes
    if (code === '123456') {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier }
                ]
            }
        })

        if (!user) return { success: false, error: "User not found" }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                isPhoneVerified: true
            }
        })
        return { success: true }
    }
    return { success: false, error: "Invalid code" }
}

export async function createStoreApplication(storeData, userId) {
    try {
        // Check if store exists for user
        const existingStoreWithUserId = await prisma.store.findUnique({
            where: { userId }
        })

        if (existingStoreWithUserId) {
            return { success: false, error: "You have already submitted a store application." }
        }

        // Verify user exists (handling stale sessions after db wipe)
        const userExists = await prisma.user.findUnique({ where: { id: userId } })
        if (!userExists) {
            return { success: false, error: "Session invalid: Your account was reset. Please Logout and Sign Up again." }
        }

        // Generate username and check for duplicates
        const username = storeData.businessName.toLowerCase().replace(/\s/g, '_')
        const existingStoreWithUsername = await prisma.store.findUnique({
            where: { username }
        })

        if (existingStoreWithUsername) {
            return { success: false, error: "This business name is already taken. Please try a slightly different name." }
        }

        const store = await prisma.store.create({
            data: {
                name: storeData.businessName,
                description: storeData.description || `Batteries: ${storeData.batteryTypes}`,
                address: storeData.address,
                userId: userId,
                email: storeData.email,
                username: username,
                contact: storeData.phone,
                logo: "", // Handle image upload later
                status: 'pending',
                isActive: false,
                nin: storeData.nin || "",
                cac: storeData.cac || ""
            }
        })
        return { success: true, store }
    } catch (error) {
        console.error("Create Store Error:", error)
        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0] || 'field'
            return { success: false, error: `A store with this ${field} already exists.` }
        }
        return { success: false, error: "Store application failed: " + error.message }
    }
}

export async function getUserStoreStatus(userId) {
    try {
        // Verify user exists (handling stale sessions after db wipe)
        const userExists = await prisma.user.findUnique({ where: { id: userId } })
        if (!userExists) {
            return { success: false, error: "Session invalid: Your account was reset. Please Logout and Sign Up again." }
        }

        const store = await prisma.store.findUnique({
            where: { userId }
        })

        if (!store) {
            return { success: true, exists: false }
        }

        return { success: true, exists: true, status: store.status, isActive: store.isActive }
    } catch (error) {
        return { success: false, error: "Failed to check store status" }
    }
}

export async function approveStore(userId) {
    try {
        await prisma.$transaction([
            prisma.store.update({
                where: { userId },
                data: { status: 'approved', isActive: true }
            }),
            prisma.user.update({
                where: { id: userId },
                data: { role: 'SELLER' }
            })
        ])
        return { success: true }
    } catch (error) {
        console.error("Approval logic failed:", error)
        return { success: false, error: "Approval failed" }
    }
}

export async function getUserProfile(userId) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })
        if (!user) return { success: false, error: "User not found" }
        return { success: true, data: user }
    } catch (error) {
        console.error("Get Profile Error:", error)
        return { success: false, error: "Failed to fetch profile" }
    }
}
