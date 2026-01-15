'use server'

import prisma from "@/backend/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerUser(userData) {
    try {
        const { name, email, password, role, whatsapp } = userData

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
        const existingStore = await prisma.store.findUnique({
            where: { userId }
        })

        if (existingStore) {
            return { success: false, error: "User already has a store application" }
        }

        // Verify user exists (handling stale sessions after db wipe)
        const userExists = await prisma.user.findUnique({ where: { id: userId } })
        if (!userExists) {
            return { success: false, error: "Session invalid: Your account was reset. Please Logout and Sign Up again." }
        }

        const store = await prisma.store.create({
            data: {
                name: storeData.businessName,
                description: storeData.description || `Batteries: ${storeData.batteryTypes}`,
                address: storeData.address,
                userId: userId,
                email: storeData.email,
                username: storeData.businessName.toLowerCase().replace(/\s/g, '_'), // specific to schema
                contact: storeData.phone,
                logo: "", // Handle image upload later
                status: 'pending',
                isActive: false
            }
        })
        return { success: true, store }
    } catch (error) {
        console.error("Create Store Error:", error)
        return { success: false, error: "Store application failed" }
    }
}

export async function getUserStoreStatus(userId) {
    try {
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
        await prisma.store.update({
            where: { userId },
            data: { status: 'approved', isActive: true }
        })
        return { success: true }
    } catch (error) {
        return { success: false, error: "Approval failed" }
    }
}
