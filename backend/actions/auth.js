'use server'

import prisma from "@/backend/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerUser(userData) {
    try {
        const { name, email, password, role, whatsapp, businessName } = userData

        // Check if user exists
        const userExists = await prisma.user.findUnique({
            where: { email }
        })

        if (userExists) {
            return { success: false, error: "User already exists" }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Mock OTP generation (In production, use crypto.randomInt)
        const emailOtp = Math.floor(100000 + Math.random() * 900000).toString()
        const phoneOtp = Math.floor(100000 + Math.random() * 900000).toString()

        // Log OTPs for now (Integration Placeholder)
        console.log(`[Validation] EMAIL OTP for ${email}: ${emailOtp}`)
        console.log(`[Validation] PHONE OTP for ${whatsapp || 'N/A'}: ${phoneOtp}`)

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
                // Store OTPs temporarily? 
                // For this MVP, we might need a way to verify. 
                // Creating a simplified verification flow without a separate table for now.
                // We'll trust the verify action to checking a matched code (stateless or mock).
                // Ideally, store in Redis or a VerificationToken table.
            }
        })

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
        return { success: false, error: "Registration failed: " + error.message }
    }
}

export async function loginUser(email, password) {
    try {
        const user = await prisma.user.findFirst({
            where: { email }
        })

        if (!user) {
            return { success: false, error: "Invalid credentials" }
        }

        if (user.password) {
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) return { success: false, error: "Invalid credentials" }
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

// New Verification Action
export async function verifyOTP(email, code, type = 'EMAIL') {
    // In a real app, verify against stored hash/Redis.
    // Here, for the "Mock" requirement without 3rd party, we will just simulate success if code is '123456' 
    // OR if we stored it in the user record (which we didn't add to schema yet).
    // Let's assume for MVP we accept '123456' for any user to pass validation quickly during demo
    // Or we verify against the log.

    // Simplest: Always accept '123456' for demo purposes as requested "Basic Validation... Placeholder"
    if (code === '123456') {
        await prisma.user.update({
            where: { email },
            data: type === 'EMAIL' ? { isEmailVerified: true } : { isPhoneVerified: true }
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
                isActive: false
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
