'use server'

import { ApiResponse } from "@/backend-actions/lib/api-response"
import { generateId, logger, normalizePhone } from "@/backend-actions/lib/api-utils"
import { sendEmail, welcomeEmail } from "@/backend-actions/lib/email"
import prisma from "@/backend-actions/lib/prisma"
import bcrypt from "bcryptjs"
import { sendOTP } from "../lib/sms"
import { rateLimit } from "../lib/rate-limit"
import { headers } from "next/headers"

export async function registerUser(userData) {
    logger.info("Registering new user", { email: userData.email, role: userData.role })
    try {
        let { firstName, lastName, name, email, password, role, whatsapp, businessName, gender, state, lga, address } = userData

        // Map BUYER to USER for Prisma schema compatibility
        if (role === 'BUYER') role = 'USER'

        // 1. Identify Existing Records (Phone & Email)
        const phoneConditions = []
        const normalizedWhatsapp = normalizePhone(whatsapp)
        if (normalizedWhatsapp) phoneConditions.push({ phone: normalizedWhatsapp })
        if (whatsapp && whatsapp !== normalizedWhatsapp) phoneConditions.push({ phone: whatsapp })

        // Check for phone & email conflicts in parallel for better performance
        const [existingUserByPhone, existingUserByEmail] = await Promise.all([
            phoneConditions.length > 0 ? prisma.user.findFirst({ where: { OR: phoneConditions } }) : null,
            (email && email.trim() !== "") ? prisma.user.findFirst({ where: { email } }) : null
        ])

        const usersToDelete = new Set()

        // Analyze Phone Conflict
        if (existingUserByPhone) {
            logger.info("Phone registration conflict detected", { userId: existingUserByPhone.id })
            const isRealUser = existingUserByPhone.isPhoneVerified && 
                               existingUserByPhone.name !== "Prospective User" &&
                               existingUserByPhone.password && existingUserByPhone.password.length > 10

            if (isRealUser) {
                return ApiResponse.error("A user with this phone number already exists. Please log in.", 400)
            }
            usersToDelete.add(existingUserByPhone.id)
        }

        // Analyze Email Conflict
        if (existingUserByEmail) {
            logger.info("Email registration conflict detected", { userId: existingUserByEmail.id })
            const isRealUser = existingUserByEmail.isEmailVerified && 
                               existingUserByEmail.name !== "Prospective User" &&
                               existingUserByEmail.password && existingUserByEmail.password.length > 10

            if (isRealUser) {
                return ApiResponse.error("A user with this email already exists.", 400)
            }
            usersToDelete.add(existingUserByEmail.id)
        }

        // Clean up unverified/placeholder records before proceeding
        if (usersToDelete.size > 0) {
            logger.info(`Cleaning up ${usersToDelete.size} placeholder/ghost records...`)
            for (const id of usersToDelete) {
                await prisma.user.delete({ where: { id } }).catch(e => logger.warn(`Cleanup failed for user ${id}`, e))
            }
            await new Promise(resolve => setTimeout(resolve, 100))
        }

        const safeEmail = (email && email.trim() !== "") ? email.trim() : null
        const hashedPassword = await bcrypt.hash(password, 10)
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        // Send SMS via Termii
        const smsResult = await sendOTP(whatsapp, otp);
        if (smsResult.success) {
            logger.info(`Verification code sent to ${whatsapp} and ${email || 'N/A'}: ${otp}`)
        } else {
            logger.error(`Failed to send SMS to ${whatsapp}: ${smsResult.error || 'Unknown error'}`)
        }

        // Use transaction for SELLER to ensure User and Store are created together
        const user = await prisma.$transaction(async (tx) => {
            console.log("[TX STAGE 1] Creating user record...");
            const newUser = await tx.user.create({
                data: {
                    id: generateId("user"),
                    name,
                    firstName: firstName || null,
                    lastName: lastName || null,
                    fullName: name,
                    email: safeEmail,
                    password: hashedPassword,
                    image: "",
                    role: role || 'USER',
                    phone: normalizedWhatsapp || whatsapp,
                    isEmailVerified: false,
                    isPhoneVerified: userData.isPhoneVerified || false,
                    cart: "{}",
                    accountStatus: 'approved',
                    ninDocument: userData.ninDocument || null,
                    cacDocument: userData.cacDocument || null,
                    gender: gender || null,
                    state: state || "Lagos",
                    lga: lga || null,
                    bankName: userData.bankName || null,
                    accountNumber: userData.accountNumber || null,
                    accountName: userData.accountName || null,
                    verificationCode: otp
                }
            })

            if (role === 'SELLER') {
                console.log("[TX STAGE 2] Creating store record for user:", newUser.id);
                const finalBusinessName = (businessName && businessName.trim()) || `${name}'s Store`
                const username = generateId(finalBusinessName.toLowerCase().replace(/\s/g, '_').substr(0, 15))

                await tx.store.create({
                    data: {
                        name: finalBusinessName,
                        username,
                        description: "Battery Vendor",
                        address: address || "TBD",
                        email,
                        contact: whatsapp || "",
                        logo: "",
                        status: "approved",
                        isActive: true,
                        userId: newUser.id
                    }
                })
            }
            console.log("[TX STAGE 3] Transaction data prepared.");
            return newUser
        }, {
            timeout: 60000, // Increase to 60 seconds to handle DB locks
            maxWait: 10000 // Give Prisma 10 seconds to find a connection
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
            const verificationTemplate = (await import("@/backend-actions/lib/email")).verificationCodeEmail({ name, code: otp })
            sendEmail({ to: email, ...verificationTemplate }).catch(err =>
                logger.warn("Verification email failed", err)
            )

            const welcomeTemplate = (await import("@/backend-actions/lib/email")).welcomeEmail({ name })
            sendEmail({ to: email, ...welcomeTemplate }).catch(err =>
                logger.warn("Welcome email failed", err)
            )
        }

        return ApiResponse.success({ user, requiresVerification: true }, "Registration successful")
    } catch (error) {
        logger.error("Register Error", error)
        if (error.code === 'P2002') {
            const target = error.meta?.target || []
            if (target.includes('email')) return ApiResponse.error("A user with this email already exists.", 409)
            if (target.includes('phone')) return ApiResponse.error("This phone number is already registered.", 409)
            if (target.includes('username')) return ApiResponse.error("Business name is already taken.", 409)
            return ApiResponse.error("An account with these details already exists.", 409)
        }
        return ApiResponse.error(`Registration failed: ${error.message}`)
    }
}

export async function checkPhoneAvailability(phone) {
    logger.info(`Checking phone availability`, { phone })
    try {
        const normalizedPhone = normalizePhone(phone)
        console.log(`[STAGE 2] Normalized phone: ${normalizedPhone}`);

        const existingUser = await prisma.user.findFirst({
            where: { 
                OR: [
                    { phone: normalizedPhone },
                    { phone: phone }
                ]
            }
        })
        console.log(`[STAGE 3] DB Lookup complete. Found user: ${existingUser ? existingUser.id : 'NO'}`);

        if (existingUser && existingUser.isPhoneVerified) {
            return ApiResponse.error("This phone number is already registered and verified.", 400)
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        if (existingUser) {
            console.log(`[STAGE 4] Updating existing user ${existingUser.id} with OTP`);
            await prisma.user.update({
                where: { id: existingUser.id },
                data: { verificationCode: otp }
            })
        } else {
            console.log(`[STAGE 4] Creating temporary record for new user`);
            await prisma.user.create({
                data: {
                    id: generateId("user"),
                    phone: normalizedPhone || phone,
                    verificationCode: otp,
                    name: "Prospective User",
                    fullName: "Prospective User",
                    email: `temp_${Date.now()}@placeholder.com`,
                    image: "",
                    role: "USER",
                    isPhoneVerified: false,
                    accountStatus: "pending",
                    status: "active",
                }
            })
        }
        console.log(`[STAGE 5] DB operation successful. Preparing to call Termii...`);

        // Send real SMS via Termii
        const smsResult = await sendOTP(phone, otp);
        console.log(`[STAGE 6] Termii result: ${smsResult.success ? 'SUCCESS' : 'FAILURE'}`);

        if (!smsResult.success) {
            console.error(`[TERMII ERROR LOG] ${smsResult.error}`);
            return ApiResponse.error(`SMS Send Failed: ${smsResult.error || 'Provider rejected request'}`);
        }

        return ApiResponse.success({ available: true }, "Verification code sent to your phone.")
    } catch (error) {
        logger.error("Check Phone Error", error)
        let message = error.message || "Database connection failure."
        if (message.includes("firstName")) {
            message = "Database Error: The 'firstName' column is missing. Please run the Remote Repair Tool."
        }
        return ApiResponse.error("Phone verification failed: " + message)
    }
}

export async function verifyPhoneStandalone(phone, code) {
    try {
        const normalizedPhone = normalizePhone(phone)
        const user = await prisma.user.findFirst({
            where: { 
                OR: [
                    { phone: normalizedPhone },
                    { phone: phone }
                ]
            }
        })

        if (!user) return ApiResponse.error("Verification session not found.", 404)

        // In demo mode or if bypass is needed, check 123456. Otherwise check real code.
        if (code === "123456" || user.verificationCode === code) {
            // Keep it unverified in DB until registration is complete, 
            // or we can mark it as verified here. Registration will check phone existence.
            return ApiResponse.success({ verified: true }, "Phone number verified successfully!")
        }
        return ApiResponse.error("Invalid verification code. Please try again.", 400)
    } catch (error) {
        return ApiResponse.error("Verification failed.")
    }
}

export async function loginUser(identifier, password) {
    try {
        const headerList = await headers()
        const ip = headerList.get('x-forwarded-for') || 'unknown'
        await rateLimit(`login_${ip}`, 5) // Limit login attempts by IP

        const safeId = identifier?.trim().toLowerCase()
        logger.info("Login attempt", { identifier: safeId, ip })

        const normalizedIdentifier = identifier.includes('@') ? identifier : normalizePhone(identifier)
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier }, 
                    { phone: normalizedIdentifier },
                    { phone: identifier } // fallback
                ]
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
        const normalizedIdentifier = identifier.includes('@') ? identifier : normalizePhone(identifier)
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier }, 
                    { phone: normalizedIdentifier },
                    { phone: identifier }
                ]
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
    logger.info("Fetching store status", { userId })
    try {
        if (!userId) return ApiResponse.unauthorized()

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return ApiResponse.success({ exists: false })

        return ApiResponse.success({
            exists: true,
            status: store.status,
            isActive: store.isActive,
            bankName: store.bankName || null,
            accountNumber: store.accountNumber || null,
            accountName: store.accountName || null,
            lga: store.lga || null,
            address: store.address || null
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
    logger.info("Fetching user profile", { userId })
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

/**
 * Update user profile details
 */
export async function updateUserProfile(userId, data) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        const updateData = {
            firstName: data.firstName,
            lastName: data.lastName,
            name: `${data.firstName} ${data.lastName}`.trim(),
            fullName: `${data.firstName} ${data.lastName}`.trim(),
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData
        })

        return ApiResponse.success(user, "Profile updated successfully")
    } catch (error) {
        logger.error("Update Profile Error", error)
        return ApiResponse.error("Failed to update profile details")
    }
}
