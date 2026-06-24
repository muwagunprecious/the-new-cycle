'use server'

import prisma from '@/backend-actions/lib/prisma'
import { ApiResponse } from '@/backend-actions/lib/api-response'
import bcrypt from 'bcryptjs'
import { sendOTP, verifyOTP } from '@/backend-actions/lib/sms'
import { normalizePhone } from '@/backend-actions/lib/api-utils'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'gocycle-affiliate-secret-2024')
const AFFILIATE_COOKIE = 'aff_session'

// ─── Code Generator ────────────────────────────────────────────────────────
function generateAffiliateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = 'GCY-AFF-'
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
}

async function generateUniqueCode() {
    let code, exists
    do {
        code = generateAffiliateCode()
        exists = await prisma.affiliate.findUnique({ where: { referralCode: code } })
    } while (exists)
    return code
}

// ─── JWT Session Helpers ────────────────────────────────────────────────────
async function createAffiliateSession(affiliate) {
    const token = await new SignJWT({ id: affiliate.id, role: 'AFFILIATE' })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(JWT_SECRET)
    return token
}

export async function getAffiliateSession() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get(AFFILIATE_COOKIE)?.value
        if (!token) return null
        const { payload } = await jwtVerify(token, JWT_SECRET)
        if (payload.role !== 'AFFILIATE') return null
        return payload
    } catch {
        return null
    }
}

export async function getAffiliateMe() {
    const session = await getAffiliateSession()
    if (!session) return null
    return prisma.affiliate.findUnique({
        where: { id: session.id },
        select: {
            id: true, name: true, email: true, phone: true,
            referralCode: true, isPhoneVerified: true, status: true,
            walletBalance: true, totalEarned: true,
            bankName: true, accountNumber: true, accountName: true,
            createdAt: true
        }
    })
}

// ─── Registration ────────────────────────────────────────────────────────────
export async function registerAffiliate({ name, email, phone, password }) {
    try {
        if (!name?.trim() || !email?.trim() || !phone?.trim() || !password?.trim()) {
            return ApiResponse.error('All fields are required', 400)
        }

        const normalizedPhone = normalizePhone(phone)

        // Check duplicates
        const [existingEmail, existingPhone] = await Promise.all([
            prisma.affiliate.findUnique({ where: { email: email.toLowerCase().trim() } }),
            prisma.affiliate.findUnique({ where: { phone: normalizedPhone } })
        ])

        if (existingEmail) return ApiResponse.error('An affiliate account with this email already exists', 409)
        if (existingPhone) return ApiResponse.error('An affiliate account with this phone already exists', 409)

        const hashedPassword = await bcrypt.hash(password, 12)
        const referralCode = await generateUniqueCode()
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        const affiliate = await prisma.affiliate.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                phone: normalizedPhone,
                password: hashedPassword,
                referralCode,
                isPhoneVerified: false,
                verificationCode: otp
            }
        })

        // Send OTP for phone verification
        const otpResult = await sendOTP(phone, otp)
        if (!otpResult.success) {
            console.warn('[AFFILIATE OTP] OTP send failed:', otpResult.error)
        }

        return ApiResponse.success({
            affiliateId: affiliate.id,
            phone: normalizedPhone,
            message: 'Account created! Check your phone for a verification code.'
        })
    } catch (error) {
        console.error('[AFFILIATE REGISTER]', error)
        return ApiResponse.error('Registration failed. Please try again.', 500)
    }
}

// ─── OTP Verify ─────────────────────────────────────────────────────────────
export async function verifyAffiliateOTP(phone, otp) {
    try {
        const normalizedPhone = normalizePhone(phone)
        const affiliate = await prisma.affiliate.findUnique({ where: { phone: normalizedPhone } })
        if (!affiliate) return ApiResponse.error('Affiliate not found', 404)

        if (affiliate.verificationCode !== otp) {
            return ApiResponse.error('Invalid verification code. Please try again.', 400)
        }

        await prisma.affiliate.update({
            where: { id: affiliate.id },
            data: { isPhoneVerified: true, verificationCode: null }
        })

        // Create session
        const token = await createAffiliateSession(affiliate)
        const cookieStore = await cookies()
        cookieStore.set(AFFILIATE_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        })

        return ApiResponse.success({
            referralCode: affiliate.referralCode,
            referralLink: `https://gocycle.ng/signup?ref=${affiliate.referralCode}`,
            name: affiliate.name
        })
    } catch (error) {
        console.error('[AFFILIATE VERIFY OTP]', error)
        return ApiResponse.error('Verification failed', 500)
    }
}

// ─── Login ───────────────────────────────────────────────────────────────────
export async function loginAffiliate(phone, password) {
    try {
        const normalizedPhone = normalizePhone(phone)
        const affiliate = await prisma.affiliate.findUnique({ where: { phone: normalizedPhone } })

        if (!affiliate) return ApiResponse.error('No affiliate account found with this phone number', 404)
        if (affiliate.status === 'suspended') return ApiResponse.error('Your affiliate account has been suspended. Contact support.', 403)

        const passwordMatch = await bcrypt.compare(password, affiliate.password)
        if (!passwordMatch) return ApiResponse.error('Incorrect password', 401)

        const token = await createAffiliateSession(affiliate)
        const cookieStore = await cookies()
        cookieStore.set(AFFILIATE_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        })

        return ApiResponse.success({
            affiliate: {
                id: affiliate.id,
                name: affiliate.name,
                referralCode: affiliate.referralCode,
                isPhoneVerified: affiliate.isPhoneVerified
            }
        })
    } catch (error) {
        console.error('[AFFILIATE LOGIN]', error)
        return ApiResponse.error('Login failed. Please try again.', 500)
    }
}

// ─── Logout ──────────────────────────────────────────────────────────────────
export async function logoutAffiliate() {
    const cookieStore = await cookies()
    cookieStore.delete(AFFILIATE_COOKIE)
    return ApiResponse.success({ message: 'Logged out' })
}

// ─── Dashboard Data ──────────────────────────────────────────────────────────
export async function getAffiliateDashboard() {
    try {
        const session = await getAffiliateSession()
        if (!session) return ApiResponse.error('Unauthorized', 401)

        const [affiliate, earnings, referrals, payoutRequests] = await Promise.all([
            prisma.affiliate.findUnique({
                where: { id: session.id },
                select: {
                    id: true, name: true, email: true, phone: true,
                    referralCode: true, walletBalance: true, totalEarned: true,
                    bankName: true, accountNumber: true, accountName: true,
                    isPhoneVerified: true, createdAt: true
                }
            }),
            prisma.affiliateEarning.findMany({
                where: { affiliateId: session.id },
                orderBy: { createdAt: 'desc' },
                take: 50
            }),
            prisma.user.count({ where: { referredByCode: null, role: 'USER' } }), // placeholder
            prisma.affiliatePayoutRequest.findMany({
                where: { affiliateId: session.id },
                orderBy: { createdAt: 'desc' }
            })
        ])

        if (!affiliate) return ApiResponse.error('Affiliate not found', 404)

        // Count referred users
        const referralCount = await prisma.user.count({
            where: { referredByCode: affiliate.referralCode, role: 'SELLER' }
        })

        const pendingEarnings = earnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.commission, 0)
        const paidEarnings = earnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.commission, 0)

        return ApiResponse.success({
            affiliate,
            referralCode: affiliate.referralCode,
            referralLink: `https://gocycle.ng/signup?ref=${affiliate.referralCode}`,
            stats: {
                totalEarned: affiliate.totalEarned,
                walletBalance: affiliate.walletBalance,
                referralCount,
                pendingEarnings,
                paidEarnings,
                totalPayoutRequests: payoutRequests.length
            },
            earnings,
            payoutRequests
        })
    } catch (error) {
        console.error('[AFFILIATE DASHBOARD]', error)
        return ApiResponse.error('Failed to load dashboard', 500)
    }
}

// ─── Update Bank Details ─────────────────────────────────────────────────────
export async function updateAffiliateBankDetails({ bankName, accountNumber, accountName }) {
    try {
        const session = await getAffiliateSession()
        if (!session) return ApiResponse.error('Unauthorized', 401)

        if (!bankName?.trim() || !accountNumber?.trim() || !accountName?.trim()) {
            return ApiResponse.error('All bank details are required', 400)
        }

        await prisma.affiliate.update({
            where: { id: session.id },
            data: { bankName: bankName.trim(), accountNumber: accountNumber.trim(), accountName: accountName.trim() }
        })

        return ApiResponse.success({ message: 'Bank details saved successfully' })
    } catch (error) {
        console.error('[AFFILIATE BANK UPDATE]', error)
        return ApiResponse.error('Failed to save bank details', 500)
    }
}

// ─── Request Payout ──────────────────────────────────────────────────────────
export async function sendPayoutOTP() {
    try {
        const session = await getAffiliateSession()
        if (!session) return ApiResponse.error('Unauthorized', 401)

        const affiliate = await prisma.affiliate.findUnique({ where: { id: session.id } })
        if (!affiliate) return ApiResponse.error('Affiliate not found', 404)

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        await prisma.affiliate.update({
            where: { id: session.id },
            data: { verificationCode: otp }
        })

        const otpResult = await sendOTP(affiliate.phone, otp)
        if (!otpResult.success) return ApiResponse.error('Failed to send verification code. Try again.', 500)

        return ApiResponse.success({ message: 'Verification code sent to your phone!' })
    } catch (error) {
        console.error('[AFFILIATE SEND PAYOUT OTP]', error)
        return ApiResponse.error('Failed to send verification code', 500)
    }
}

export async function requestAffiliatePayout({ amount, bankName, accountNumber, accountName, otp }) {
    try {
        const session = await getAffiliateSession()
        if (!session) return ApiResponse.error('Unauthorized', 401)

        const affiliate = await prisma.affiliate.findUnique({ where: { id: session.id } })
        if (!affiliate) return ApiResponse.error('Affiliate not found', 404)

        if (!otp?.trim()) {
            return ApiResponse.error('Verification code is required', 400)
        }

        if (affiliate.verificationCode !== otp.trim()) {
            return ApiResponse.error('Invalid verification code', 400)
        }

        if (!bankName?.trim() || !accountNumber?.trim() || !accountName?.trim()) {
            return ApiResponse.error('Bank details are required to request a payout', 400)
        }

        if (amount <= 0) return ApiResponse.error('Payout amount must be greater than 0', 400)
        if (amount > affiliate.walletBalance) {
            return ApiResponse.error(`Insufficient balance. Your wallet has ₦${affiliate.walletBalance.toLocaleString()}`, 400)
        }

        // Check no pending payout already
        const pending = await prisma.affiliatePayoutRequest.findFirst({
            where: { affiliateId: session.id, status: 'pending' }
        })
        if (pending) {
            return ApiResponse.error('You already have a pending payout request. Please wait for it to be processed.', 409)
        }

        // Save bank details to profile, clear code, and create request
        await prisma.$transaction([
            prisma.affiliate.update({
                where: { id: session.id },
                data: {
                    bankName: bankName.trim(),
                    accountNumber: accountNumber.trim(),
                    accountName: accountName.trim(),
                    verificationCode: null
                }
            }),
            prisma.affiliatePayoutRequest.create({
                data: {
                    affiliateId: session.id,
                    amount,
                    bankName: bankName.trim(),
                    accountNumber: accountNumber.trim(),
                    accountName: accountName.trim(),
                    status: 'pending'
                }
            })
        ])

        return ApiResponse.success({ message: 'Payout request submitted! Admin will process within 2-3 business days.' })
    } catch (error) {
        console.error('[AFFILIATE PAYOUT REQUEST]', error)
        return ApiResponse.error('Failed to submit payout request', 500)
    }
}

// ─── Validate Referral Code (public) ─────────────────────────────────────────
export async function validateAffiliateCode(code) {
    try {
        if (!code?.trim()) return { valid: false }
        const affiliate = await prisma.affiliate.findUnique({
            where: { referralCode: code.trim().toUpperCase() },
            select: { id: true, name: true, status: true }
        })
        if (!affiliate || affiliate.status !== 'active') return { valid: false }
        return { valid: true, affiliateName: affiliate.name }
    } catch {
        return { valid: false }
    }
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────
export async function resendAffiliateOTP(phone) {
    try {
        const normalizedPhone = normalizePhone(phone)
        const affiliate = await prisma.affiliate.findUnique({ where: { phone: normalizedPhone } })
        if (!affiliate) return ApiResponse.error('Affiliate not found', 404)

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        await prisma.affiliate.update({
            where: { id: affiliate.id },
            data: { verificationCode: otp }
        })

        const otpResult = await sendOTP(phone, otp)
        if (!otpResult.success) return ApiResponse.error('Failed to send OTP. Try again.', 500)

        return ApiResponse.success({ message: 'Verification code resent!' })
    } catch (error) {
        return ApiResponse.error('Failed to resend code', 500)
    }
}
