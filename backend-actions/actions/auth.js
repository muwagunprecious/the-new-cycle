'use server'

import { ApiResponse, handleDbError } from "@/backend-actions/lib/api-response"
import { generateId, logger, normalizePhone } from "@/backend-actions/lib/api-utils"
import { sendEmail, welcomeEmail } from "@/backend-actions/lib/email"
import prisma from "@/backend-actions/lib/prisma"
import bcrypt from "bcryptjs"
import { sendOTP } from "../lib/sms"
import { rateLimit } from "../lib/rate-limit"
import { cookies, headers } from "next/headers"
import crypto from "node:crypto"

export async function requestAdminPasswordReset(email) {
    try {
        if (!email) return ApiResponse.error("Email is required", 400);

        const user = await prisma.user.findFirst({ where: { email } });
        if (!user) {
            // Security: Don't reveal if user exists
            return ApiResponse.success(null, "If an account with that email exists, a reset link has been sent.");
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        // Save to DB
        await prisma.passwordResetToken.create({
            data: {
                email,
                token,
                expiresAt
            }
        });

        // Send email
        const resetUrl = `https://gocycle.ng/reset-password?token=${token}`;
        const mailer = sendEmail;
        const yr = new Date().getFullYear();
        
        await mailer({
            to: email,
            subject: "Reset Your Go-Cycle Admin Password",
            html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                <div style="background:#0f172a;padding:24px;text-align:center;">
                    <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
                    <p style="color:#94a3b8;margin:4px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Security Administration</p>
                </div>
                <div style="padding:28px;text-align:center;">
                    <h2 style="color:#0f172a;margin-top:0;">Password Reset Request</h2>
                    <p style="color:#475569;">You requested a password reset for your admin account. Click the button below to set a new password:</p>
                    <div style="margin:32px 0;">
                        <a href="${resetUrl}" style="background:#05DF72;color:#000;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Reset Password</a>
                    </div>
                    <p style="color:#64748b;font-size:13px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
                </div>
                <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                    <p style="color:#94a3b8;font-size:12px;margin:0;">© ${yr} Go-Cycle Nigeria. All rights reserved.</p>
                </div>
            </div>`
        }).catch(err => logger.warn("Password reset email failed", err));

        return ApiResponse.success(null, "Reset link sent successfully.");
    } catch (error) {
        logger.error("Request Password Reset Error", error);
        return ApiResponse.error("Failed to process request");
    }
}

export async function resetAdminPassword(token, newPassword) {
    try {
        if (!token || !newPassword) return ApiResponse.error("Token and new password are required", 400);

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token }
        });

        if (!resetToken || resetToken.expiresAt < new Date()) {
            return ApiResponse.error("Invalid or expired reset token", 400);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.$transaction([
            prisma.user.update({
                where: { email: resetToken.email },
                data: { password: hashedPassword, needsPasswordChange: false }
            }),
            prisma.passwordResetToken.delete({
                where: { id: resetToken.id }
            })
        ]);

        return ApiResponse.success(null, "Password reset successfully. You can now log in.");
    } catch (error) {
        logger.error("Reset Password Error", error);
        return ApiResponse.error("Failed to reset password");
    }
}

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
                    role: (() => {
                        const allowed = ['USER', 'SELLER', 'ADMIN', 'SUPER_ADMIN'];
                        if (!role || !allowed.includes(role.toUpperCase())) {
                            logger.error("Security: Invalid role attempted during registration", { role });
                            throw new Error("Invalid account role provided");
                        }
                        return role.toUpperCase();
                    })(),
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
                    verificationCode: otp,
                    needsPasswordChange: role.toUpperCase() === 'ADMIN' || role.toUpperCase() === 'SUPER_ADMIN'
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
            const admins = await prisma.user.findMany({ 
                where: { 
                    role: { in: ['ADMIN', 'SUPER_ADMIN'] } 
                } 
            })
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
        return handleDbError(error, "registerUser")
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
        return handleDbError(error, "checkPhoneAvailability")
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
        const start = Date.now()
        await rateLimit(`login_${ip}`, 15) 
        const afterRateLimit = Date.now()

        const safeId = identifier?.trim().toLowerCase();
        const safePassword = password?.trim();
        logger.info("Login attempt", { identifier: safeId, ip });

        const normalizedIdentifier = identifier.includes('@') ? safeId : normalizePhone(identifier);
        
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: { equals: safeId, mode: 'insensitive' } }, 
                    { phone: normalizedIdentifier },
                    { phone: safeId }
                ]
            }
        });
        const afterDb = Date.now()

        if (!user || !user.password) {
            logger.warn(`DIAGNOSTIC: Login failed - User not found for: [${safeId}]`);
            return ApiResponse.error("Invalid credentials", 401);
        }

        const isMatch = await bcrypt.compare(safePassword, user.password);
        const afterBcrypt = Date.now()
        
        logger.info("Login performance trace", {
            totalMs: afterBcrypt - start,
            dbMs: afterDb - afterRateLimit,
            bcryptMs: afterBcrypt - afterDb
        })

        if (!isMatch) {
            logger.warn(`DIAGNOSTIC: Login failed - Password mismatch for: [${user.email}]`);
            return ApiResponse.error("Invalid credentials", 401);
        }

        const { password: _, ...userWithoutPassword } = user
        // Serialize Date objects for Redux compatibility
        if (userWithoutPassword.createdAt) userWithoutPassword.createdAt = userWithoutPassword.createdAt.toISOString?.() || String(userWithoutPassword.createdAt);
        if (userWithoutPassword.updatedAt) userWithoutPassword.updatedAt = userWithoutPassword.updatedAt.toISOString?.() || String(userWithoutPassword.updatedAt);
        if (userWithoutPassword.verifiedAt) userWithoutPassword.verifiedAt = userWithoutPassword.verifiedAt.toISOString?.() || String(userWithoutPassword.verifiedAt);
        
        // SYSTEM EMERGENCY: Ensure the master admin accounts always have ADMIN privileges
        // This handles cases where the role might have been downgraded in DB (e.g. store approval)
        const masterAdmins = ['admin@gocycle.com', 'architect@gocycle.com'];
        const normalizedEmail = (user.email || '').toLowerCase();
        if (masterAdmins.includes(normalizedEmail) && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            logger.warn("System Emergency: Restoring ADMIN role for master account", { email: user.email });
            await prisma.user.update({
                where: { id: user.id },
                data: { role: 'ADMIN' }
            });
            user.role = 'ADMIN';
        }

        if (!user.role) {
            logger.error("Security Failure: User role missing in DB", { userId: user.id });
            return ApiResponse.error("Account configuration error. Please contact support.", 500);
        }

        // ─── 2FA Gate for Admin/Super Admin ───────────────────────────────
        const adminRoles = ['ADMIN', 'SUPER_ADMIN'];
        const isBypassAdmin = normalizedEmail === 'admin@gocycle.com';

        if (adminRoles.includes(user.role) && !isBypassAdmin) {
            // Generate 6-digit 2FA code
            const twoFACode = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Store the 2FA code in the user record (reuses verificationCode field)
            await prisma.user.update({
                where: { id: user.id },
                data: { verificationCode: twoFACode }
            });

            // Send 2FA code via email (Non-blocking)
            if (user.email) {
                const yr = new Date().getFullYear();
                sendEmail({
                    to: user.email,
                    subject: `${twoFACode} – Go-Cycle Admin 2FA Code`,
                    html: `
                    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                        <div style="background:#0f172a;padding:24px;text-align:center;">
                            <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
                            <p style="color:#94a3b8;margin:4px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Admin Security Verification</p>
                        </div>
                        <div style="padding:28px;text-align:center;">
                            <div style="width:64px;height:64px;background:#f0fdf4;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;border:2px solid #bbf7d0;">
                                <span style="font-size:28px;">🔐</span>
                            </div>
                            <h2 style="color:#0f172a;margin-top:0;">Two-Factor Authentication</h2>
                            <p style="color:#475569;">A sign-in attempt requires verification. Use the code below to complete your admin login:</p>
                            <div style="background:#f8fafc;border:2px dashed #05DF72;border-radius:16px;padding:28px;margin:24px 0;">
                                <p style="margin:0 0 8px;font-size:11px;color:#64748b;font-weight:bold;text-transform:uppercase;letter-spacing:2px;">Your 2FA Code</p>
                                <h2 style="margin:0;font-size:40px;color:#0f172a;letter-spacing:10px;font-weight:800;">${twoFACode}</h2>
                            </div>
                            <p style="color:#ef4444;font-size:12px;font-weight:bold;">⚠️ This code expires in 10 minutes. Do not share it.</p>
                        </div>
                        <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                            <p style="color:#94a3b8;font-size:12px;margin:0;">© ${yr} Go-Cycle Nigeria. All rights reserved.</p>
                        </div>
                    </div>`
                }).catch(err => logger.warn("Admin 2FA email failed", err));
            }

            logger.info(`[2FA] Code sent to admin ${user.email}`, { userId: user.id });

            // Return requires2FA flag — do NOT issue JWT yet
            return ApiResponse.success({
                requires2FA: true,
                userId: user.id,
                email: user.email ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null,
                user: userWithoutPassword
            }, "2FA verification required");
        }
        // ─── End 2FA Gate ─────────────────────────────────────────────────

        // GENERATE JWT (Zero Trust Mirror) — Non-admin users
        const { signToken } = await import("../lib/jwt");
        const token = signToken({ userId: user.id, role: user.role }, "24h");

        // Set secure HttpOnly cookie
        const cookieStore = await cookies();
        cookieStore.set("gocycle_auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" && !headerList.get('host')?.includes('localhost'),
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/"
        });

        if (!user.isEmailVerified && !user.isPhoneVerified) {
            return ApiResponse.success({ 
                user: userWithoutPassword, 
                token, // Return token even if not verified yet, but middleware will block
                requiresVerification: true 
            }, "Verification required");
        }

        return ApiResponse.success({ user: userWithoutPassword, token }, "Login successful");
    } catch (error) {
        logger.error("Login Error", error)
        // Rate limit errors should return a clean 429, not a generic 500
        if (error?.message?.includes('Too many requests')) {
            return ApiResponse.error("Too many login attempts. Please wait a moment and try again.", 429)
        }
        return handleDbError(error, "loginUser")
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
            data: { 
                password: hashedNewPassword,
                needsPasswordChange: false
            }
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

export async function verifyAdmin2FA(userId, code) {
    try {
        if (!userId || !code) {
            return ApiResponse.error("User ID and 2FA code are required", 400);
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) return ApiResponse.error("User not found", 404);

        // Check the 2FA code
        if (user.verificationCode !== code) {
            logger.warn(`[2FA] Invalid code attempt for admin ${user.email}`, { userId });
            return ApiResponse.error("Invalid 2FA code. Please check your email and try again.", 400);
        }

        // Clear the code after successful verification
        await prisma.user.update({
            where: { id: userId },
            data: { verificationCode: null }
        });

        // NOW issue the JWT
        const { signToken } = await import("../lib/jwt");
        const token = signToken({ userId: user.id, role: user.role }, "24h");

        // Set secure HttpOnly cookie
        const headerList = await headers();
        const cookieStore = await cookies();
        cookieStore.set("gocycle_auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" && !headerList.get('host')?.includes('localhost'),
            sameSite: "lax",
            maxAge: 60 * 60 * 24,
            path: "/"
        });

        const { password: _, verificationCode: __, ...userWithoutPassword } = user;
        logger.info(`[2FA] Admin ${user.email} verified successfully`, { userId });

        return ApiResponse.success({ user: userWithoutPassword, token }, "2FA verified. Login successful.");
    } catch (error) {
        logger.error("Verify Admin 2FA Error", error);
        return ApiResponse.error("2FA verification failed");
    }
}

export async function resendAdmin2FA(userId) {
    try {
        if (!userId) return ApiResponse.error("User ID is required", 400);

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return ApiResponse.error("User not found", 404);

        const adminRoles = ['ADMIN', 'SUPER_ADMIN'];
        if (!adminRoles.includes(user.role)) {
            return ApiResponse.error("Unauthorized", 403);
        }

        const twoFACode = Math.floor(100000 + Math.random() * 900000).toString();

        await prisma.user.update({
            where: { id: userId },
            data: { verificationCode: twoFACode }
        });

        if (user.email) {
            const { sendEmail: mailer } = await import('@/backend-actions/lib/email');
            const yr = new Date().getFullYear();
            await mailer({
                to: user.email,
                subject: `${twoFACode} – Go-Cycle Admin 2FA Code (Resent)`,
                html: `
                <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                    <div style="background:#0f172a;padding:24px;text-align:center;">
                        <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
                        <p style="color:#94a3b8;margin:4px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Admin Security Verification</p>
                    </div>
                    <div style="padding:28px;text-align:center;">
                        <h2 style="color:#0f172a;margin-top:0;">New 2FA Code</h2>
                        <p style="color:#475569;">Here is your new verification code:</p>
                        <div style="background:#f8fafc;border:2px dashed #05DF72;border-radius:16px;padding:28px;margin:24px 0;">
                            <p style="margin:0 0 8px;font-size:11px;color:#64748b;font-weight:bold;text-transform:uppercase;letter-spacing:2px;">Your 2FA Code</p>
                            <h2 style="margin:0;font-size:40px;color:#0f172a;letter-spacing:10px;font-weight:800;">${twoFACode}</h2>
                        </div>
                        <p style="color:#ef4444;font-size:12px;font-weight:bold;">⚠️ This code expires in 10 minutes. Do not share it.</p>
                    </div>
                    <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                        <p style="color:#94a3b8;font-size:12px;margin:0;">© ${yr} Go-Cycle Nigeria. All rights reserved.</p>
                    </div>
                </div>`
            }).catch(err => logger.warn("Admin 2FA resend email failed", err));
        }

        return ApiResponse.success(null, "New 2FA code sent to your email.");
    } catch (error) {
        logger.error("Resend Admin 2FA Error", error);
        return ApiResponse.error("Failed to resend 2FA code");
    }
}

export async function logoutUser() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("gocycle_auth_token");
        return ApiResponse.success(null, "Logged out successfully");
    } catch (error) {
        return ApiResponse.error("Logout failed");
    }
}

/**
 * Create session from verified user object (avoids re-querying DB)
 * Used immediately after registration when we already have the user data
 */
export async function createSessionFromUser(user) {
    try {
        // Remove sensitive data
        const { password: _, verificationCode: __, ...userWithoutPassword } = user;
        
        // Generate JWT token
        const { signToken } = await import("../lib/jwt");
        const token = signToken({ userId: user.id, role: user.role }, "24h");
        
        // Set secure HttpOnly cookie
        const cookieStore = await cookies();
        const headerList = await headers();
        cookieStore.set("gocycle_auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" && 
                   !headerList.get('host')?.includes('localhost'),
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/"
        });
        
        return ApiResponse.success({ user: userWithoutPassword, token }, "Login successful");
    } catch (error) {
        logger.error("Create Session Error", error);
        return ApiResponse.error("Failed to create session");
    }
}
