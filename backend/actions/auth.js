'use server'

import { ApiResponse } from "@/backend/lib/api-response"
import { generateId, logger } from "@/backend/lib/api-utils"
import { sendEmail, welcomeEmail } from "@/backend/lib/email"
import prisma from "@/backend/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerUser(userData) {
    try {
        let { name, email, password, role, whatsapp, businessName } = userData

        // Map BUYER to USER for Prisma schema compatibility
        if (role === 'BUYER') role = 'USER'

        // Check for existing user
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { phone: whatsapp }]
            }
        })

        if (existingUser) {
            // If already verified, they should login
            if (existingUser.isPhoneVerified || existingUser.isEmailVerified) {
                return ApiResponse.error("A user with this phone number already exists. Please log in instead.", 400)
            }

            const hashedPassword = await bcrypt.hash(password, 10)
            const otp = Math.floor(100000 + Math.random() * 900000).toString()
            await prisma.user.update({
                where: { id: existingUser.id },
                data: { password: hashedPassword, verificationCode: otp }
            })
            logger.info(`Resending verification code to unverified user ${whatsapp}: ${otp}`)

            // Send email again if they provided one
            if (email || existingUser.email) {
                const targetEmail = email || existingUser.email;
                const name = userData.name || existingUser.name;

                const { verificationCodeEmail } = await import("@/backend/lib/email")
                const verificationTemplate = verificationCodeEmail({ name, code: otp })

                // Fire and forget email sending with logging
                import("@/backend/lib/email").then(m => {
                    m.sendEmail({ to: targetEmail, ...verificationTemplate }).catch(err =>
                        logger.warn("Verification email retry failed", err)
                    )
                })
            }

            return ApiResponse.success({ user: existingUser, requiresVerification: true }, "Account already exists but is unverified. Please verify your phone number.")
        }

        // Check for unique email
        if (email) {
            const emailExists = await prisma.user.findUnique({ where: { email } })
            if (emailExists) return ApiResponse.error("A user with this email already exists", 400)
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        logger.info(`Verification code sent to ${whatsapp} and ${email || 'N/A'}: ${otp}`)

        // Use transaction for SELLER to ensure User and Store are created together
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    id: generateId("user"),
                    name,
                    fullName: name,
                    email,
                    password: hashedPassword,
                    image: "",
                    role: role || 'USER',
                    phone: whatsapp,
                    isEmailVerified: false,
                    isPhoneVerified: false,
                    cart: "{}",
                    accountStatus: role === 'USER' ? 'pending' : 'approved',
                    ninDocument: userData.ninDocument || null,
                    cacDocument: userData.cacDocument || null,
                    bankName: userData.bankName || null,
                    accountNumber: userData.accountNumber || null,
                    accountName: userData.accountName || null,
                    verificationCode: otp
                }
            })

            if (role === 'SELLER') {
                const finalBusinessName = (businessName && businessName.trim()) || `${name}'s Store`
                const username = generateId(finalBusinessName.toLowerCase().replace(/\s/g, '_').substr(0, 15))

                await tx.store.create({
                    data: {
                        name: finalBusinessName,
                        username,
                        description: "Battery Vendor",
                        address: "TBD",
                        email,
                        contact: whatsapp || "",
                        logo: "",
                        status: "approved",
                        isActive: true,
                        userId: newUser.id
                    }
                })
            }
            return newUser
        })

        if (role === 'USER') {
            const { createNotification } = await import('./notification')
            const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
            for (const admin of admins) {
                await createNotification(
                    admin.id,
                    "New Buyer Registration",
                    `${name} has registered and is awaiting verification.`,
                    "SYSTEM"
                )
            }
        }

        // Send welcome & verification email if email is provided
        if (email) {
            const verificationTemplate = (await import("@/backend/lib/email")).verificationCodeEmail({ name, code: otp })
            sendEmail({ to: email, ...verificationTemplate }).catch(err =>
                logger.warn("Verification email failed", err)
            )

            const welcomeTemplate = (await import("@/backend/lib/email")).welcomeEmail({ name })
            sendEmail({ to: email, ...welcomeTemplate }).catch(err =>
                logger.warn("Welcome email failed", err)
            )
        }

        return ApiResponse.success({ user, requiresVerification: true }, "Registration successful")
    } catch (error) {
        logger.error("Register Error", error)
        if (error.code === 'P2002') return ApiResponse.error("An account with these details already exists.", 409)
        return ApiResponse.error(`Registration failed: ${error.message}`)
    }
}

export async function loginUser(identifier, password) {
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { phone: identifier }]
            }
        })

        if (!user || !user.password) {
            logger.warn(`Login failed: User not found or no password for ${identifier}`)
            return ApiResponse.error("Invalid credentials", 401)
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return ApiResponse.error("Invalid credentials", 401)

        const { password: _, ...userWithoutPassword } = user

        if (!user.isEmailVerified && !user.isPhoneVerified) {
            return ApiResponse.success({ user: userWithoutPassword, requiresVerification: true }, "Verification required")
        }

        return ApiResponse.success({ user: userWithoutPassword }, "Login successful")
    } catch (error) {
        logger.error("Login Error", error)
        return ApiResponse.error(`Login failed: ${error.message}`)
    }
}

export async function verifyOTP(identifier, code, type = 'PHONE') {
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { phone: identifier }]
            }
        })

        if (!user) return ApiResponse.error("User not found", 404)

        // Check OTP against the stored verification code
        if (user.verificationCode !== code) {
            return ApiResponse.error("Invalid verification code", 400)
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                isPhoneVerified: true,
                verificationCode: null // Clear the code after use
            }
        })
        return ApiResponse.success(null, "Account verified successfully")
    } catch (error) {
        logger.error("Verify OTP Error", error)
        return ApiResponse.error("Verification failed")
    }
}

export async function createStoreApplication(storeData, userId) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        const existingStore = await prisma.store.findUnique({ where: { userId } })
        if (existingStore) return ApiResponse.error("A store application already exists for this account", 400)

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) return ApiResponse.error("User profile not found", 404)

        const username = storeData.businessName.toLowerCase().replace(/\s/g, '_')
        const duplicateUsername = await prisma.store.findUnique({ where: { username } })
        if (duplicateUsername) return ApiResponse.error("Business name is already taken", 400)

        const store = await prisma.store.create({
            data: {
                name: storeData.businessName,
                description: storeData.description || `Batteries: ${storeData.batteryTypes}`,
                address: storeData.address,
                userId,
                email: storeData.email,
                username,
                contact: storeData.phone,
                logo: "",
                status: 'approved',
                isActive: true,
                nin: storeData.nin || "",
                cac: storeData.cac || "",
                bankName: storeData.bankName || null,
                accountNumber: storeData.accountNumber || null,
                accountName: storeData.accountName || null
            }
        })
        return ApiResponse.success({ store }, "Store created successfully")
    } catch (error) {
        logger.error("Create Store Error", error)
        if (error.code === 'P2002') return ApiResponse.error("Store details already exist", 409)
        return ApiResponse.error(`Store application failed: ${error.message}`)
    }
}

export async function getUserStoreStatus(userId) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return ApiResponse.success({ exists: false })

        return ApiResponse.success({
            exists: true,
            status: store.status,
            isActive: store.isActive
        })
    } catch (error) {
        return ApiResponse.error("Failed to retrieve store status")
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
        return ApiResponse.success(null, "Store approved successfully")
    } catch (error) {
        logger.error("Approve Store Logic Error", error)
        return ApiResponse.error("Approval process failed")
    }
}

export async function getUserProfile(userId) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) return ApiResponse.error("Profile not found", 404)

        return ApiResponse.success(user)
    } catch (error) {
        logger.error("Get Profile Error", error)
        return ApiResponse.error("Failed to fetch profile details")
    }
}

export async function changePassword(userId, currentPassword, newPassword) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user || !user.password) return ApiResponse.error("User not found", 404)

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) return ApiResponse.error("Current password is incorrect", 400)

        const hashedNewPassword = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        })

        return ApiResponse.success(null, "Password changed successfully")
    } catch (error) {
        logger.error("Change Password Error", error)
        return ApiResponse.error("Failed to change password")
    }
}

