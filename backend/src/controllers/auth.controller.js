const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const { generateId, logger, normalizePhone } = require('../lib/api-utils');
const { sendEmail, welcomeEmail, verificationCodeEmail } = require('../lib/email');
const { sendOTP } = require('../lib/sms');
const { createNotification } = require('../services/notification.service');

/**
 * @desc    Register a user (Buyer or Seller)
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
    try {
        let { firstName, lastName, name, email, password, role, whatsapp, businessName, gender, state, lga, address } = req.body;

        if (role === 'BUYER') role = 'USER';

        const phoneConditions = [];
        const normalizedWhatsapp = normalizePhone(whatsapp);
        if (normalizedWhatsapp) phoneConditions.push({ phone: normalizedWhatsapp });
        if (whatsapp && whatsapp !== normalizedWhatsapp) phoneConditions.push({ phone: whatsapp });

        const [existingUserByPhone, existingUserByEmail] = await Promise.all([
            phoneConditions.length > 0 ? prisma.user.findFirst({ where: { OR: phoneConditions } }) : null,
            (email && email.trim() !== "") ? prisma.user.findFirst({ where: { email } }) : null
        ]);

        const usersToDelete = new Set();
        if (existingUserByPhone) {
            const isRealUser = existingUserByPhone.isPhoneVerified && 
                               existingUserByPhone.name !== "Prospective User" &&
                               existingUserByPhone.password && existingUserByPhone.password.length > 10;
            if (isRealUser) return res.status(400).json({ success: false, message: "A user with this phone number already exists." });
            usersToDelete.add(existingUserByPhone.id);
        }

        if (existingUserByEmail) {
            const isRealUser = existingUserByEmail.isEmailVerified && 
                               existingUserByEmail.name !== "Prospective User" &&
                               existingUserByEmail.password && existingUserByEmail.password.length > 10;
            if (isRealUser) return res.status(400).json({ success: false, message: "A user with this email already exists." });
            usersToDelete.add(existingUserByEmail.id);
        }

        if (usersToDelete.size > 0) {
            for (const id of usersToDelete) {
                await prisma.user.delete({ where: { id } }).catch(e => logger.warn(`Cleanup failed for user ${id}`, e));
            }
        }

        const safeEmail = (email && email.trim() !== "") ? email.trim() : null;
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const smsResult = await sendOTP(whatsapp, otp);
        
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    id: generateId("user"),
                    name,
                    firstName: firstName || null,
                    lastName: lastName || null,
                    fullName: name,
                    email: safeEmail,
                    password: hashedPassword,
                    role: role || 'USER',
                    phone: normalizedWhatsapp || whatsapp,
                    isEmailVerified: false,
                    isPhoneVerified: req.body.isPhoneVerified || false,
                    accountStatus: 'approved',
                    gender: gender || null,
                    state: state || "Lagos",
                    lga: lga || null,
                    verificationCode: otp
                }
            });

            if (role === 'SELLER') {
                const finalBusinessName = (businessName && businessName.trim()) || `${name}'s Store`;
                const username = generateId(finalBusinessName.toLowerCase().replace(/\s/g, '_').substr(0, 15));

                await tx.store.create({
                    data: {
                        name: finalBusinessName,
                        username,
                        description: "Battery Vendor",
                        address: address || "TBD",
                        email,
                        contact: whatsapp || "",
                        status: "approved",
                        isActive: true,
                        userId: newUser.id
                    }
                });
            }
            return newUser;
        });

        if (role === 'USER') {
            const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
            for (const admin of admins) {
                await createNotification(admin.id, "New Buyer Registration", `${name} has registered.`, "SYSTEM");
            }
        }

        if (email) {
            const verificationTemplate = verificationCodeEmail({ name, code: otp });
            sendEmail({ to: email, ...verificationTemplate }).catch(err => logger.warn("Verification email failed", err));

            const welcomeTemplate = welcomeEmail({ name });
            sendEmail({ to: email, ...welcomeTemplate }).catch(err => logger.warn("Welcome email failed", err));
        }

        res.status(201).json({ success: true, data: { user, requiresVerification: true }, message: "Registration successful" });
    } catch (error) {
        logger.error("Register Error", error);
        res.status(500).json({ success: false, message: `Registration failed: ${error.message}` });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const safeId = identifier?.trim().toLowerCase();
        
        const normalizedIdentifier = identifier.includes('@') ? identifier : normalizePhone(identifier);
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier }, 
                    { phone: normalizedIdentifier },
                    { phone: identifier }
                ]
            }
        });

        if (!user || !user.password) return res.status(401).json({ success: false, message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

        const { password: _, ...userWithoutPassword } = user;

        if (!user.isEmailVerified && !user.isPhoneVerified) {
            return res.status(200).json({ success: true, user: userWithoutPassword, requiresVerification: true, message: "Verification required" });
        }

        res.status(200).json({ success: true, user: userWithoutPassword, message: "Login successful" });
    } catch (error) {
        logger.error("Login Error", error);
        res.status(500).json({ success: false, message: `Login failed: ${error.message}` });
    }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-otp
 */
exports.verifyOTP = async (req, res) => {
    try {
        const { identifier, code } = req.body;
        const normalizedIdentifier = identifier.includes('@') ? identifier : normalizePhone(identifier);
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier }, 
                    { phone: normalizedIdentifier },
                    { phone: identifier }
                ]
            }
        });

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (user.verificationCode !== code) {
            return res.status(400).json({ success: false, message: "Invalid verification code" });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                isPhoneVerified: true,
                verificationCode: null
            }
        });
        res.status(200).json({ success: true, message: "Account verified successfully" });
    } catch (error) {
        logger.error("Verify OTP Error", error);
        res.status(500).json({ success: false, message: "Verification failed" });
    }
};
