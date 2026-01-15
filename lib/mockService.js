/**
 * GoCycle Mock Service Layer
 * All operations are frontend-only with localStorage persistence
 * No real API calls - demo/simulation only
 */

import { dummyUsers } from "@/assets/assets"

// ============================================
// STORAGE KEYS
// ============================================
const STORAGE_KEYS = {
    USERS: 'gocycle_users',
    SESSION: 'gocycle_session',
    PRODUCTS: 'gocycle_products',
    ORDERS: 'gocycle_orders',
    NOTIFICATIONS: 'gocycle_notifications',
    STORES: 'gocycle_stores'
}

// ============================================
// DEMO DATA
// ============================================
const LAGOS_LGAS = [
    "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa",
    "Badagry", "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye",
    "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland",
    "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"
]

const BATTERY_TYPES = ["Car Battery", "Inverter Battery", "Heavy Duty Battery"]

const NETWORK_PROVIDERS = ["MTN", "Airtel", "Glo", "9mobile"]

// ============================================
// UTILITY FUNCTIONS
// ============================================
const generateId = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

const generateToken = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let token = ''
    for (let i = 0; i < 8; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return token
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const getFromStorage = (key, fallback = null) => {
    if (typeof window === 'undefined') return fallback
    try {
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : fallback
    } catch {
        return fallback
    }
}

const saveToStorage = (key, data) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, JSON.stringify(data))
}

// ============================================
// MOCK VERIFICATION SERVICE (Demo QoreID)
// ============================================
export const mockVerificationService = {
    // Simulate email verification
    async sendEmailOTP(email) {
        await delay(1000)
        return { success: true, message: "Verification email sent", mockOTP: "123456" }
    },

    async verifyEmailOTP(email, otp) {
        await delay(800)
        if (otp === "123456") {
            return { success: true, message: "Email verified successfully" }
        }
        return { success: false, error: "Invalid verification code" }
    },

    // Simulate phone intelligence check
    async checkPhoneIntelligence(phone) {
        await delay(1200)
        const mockData = {
            success: true,
            data: {
                phoneNumber: phone,
                isValid: true,
                networkProvider: NETWORK_PROVIDERS[Math.floor(Math.random() * NETWORK_PROVIDERS.length)],
                registrationAge: `${Math.floor(Math.random() * 5) + 1}+ years ago`,
                riskLevel: Math.random() > 0.2 ? "Low" : (Math.random() > 0.5 ? "Medium" : "High"),
                lineType: "Mobile",
                country: "Nigeria"
            }
        }
        return mockData
    },

    // Simulate CAC verification
    async verifyCAC(cacNumber) {
        await delay(1500)
        if (!cacNumber || cacNumber.length < 5) {
            return { success: false, error: "Invalid CAC number format" }
        }
        return {
            success: true,
            data: {
                businessName: "Verified Business Ltd",
                registrationDate: "2020-03-15",
                status: "Active",
                verificationId: generateId('cac_verify')
            }
        }
    },

    // Simulate NIN verification
    async verifyNIN(nin) {
        await delay(1500)
        if (!nin || nin.length !== 11) {
            return { success: false, error: "Invalid NIN format (must be 11 digits)" }
        }
        return {
            success: true,
            data: {
                firstName: "Verified",
                lastName: "User",
                dateOfBirth: "1990-01-01",
                verificationId: generateId('nin_verify')
            }
        }
    },

    // Simulate bank account validation
    async validateBankAccount(accountNumber, bankCode) {
        await delay(1200)
        if (!accountNumber || accountNumber.length !== 10) {
            return { success: false, error: "Invalid account number (must be 10 digits)" }
        }
        const banks = ["Access Bank", "GTBank", "First Bank", "UBA", "Zenith Bank"]
        return {
            success: true,
            data: {
                accountName: "GoCycle User Account",
                accountNumber,
                bankName: banks[Math.floor(Math.random() * banks.length)],
                verificationId: generateId('bank_verify')
            }
        }
    }
}

// ============================================
// AUTH SERVICE
// ============================================
export const mockAuthService = {
    async register(userData) {
        await delay(1000)

        const users = getFromStorage(STORAGE_KEYS.USERS, [])

        // Check if email exists
        if (users.find(u => u.email === userData.email)) {
            return { success: false, error: "Email already registered" }
        }

        const newUser = {
            id: generateId('user'),
            ...userData,
            status: 'active',
            isEmailVerified: false,
            isPhoneVerified: false,
            verificationStatus: 'pending', // pending, verified, failed
            phoneIntelligence: null,
            bankDetails: null,
            createdAt: new Date().toISOString()
        }

        users.push(newUser)
        saveToStorage(STORAGE_KEYS.USERS, users)

        return {
            success: true,
            user: newUser,
            requiresVerification: true,
            message: "Account created! Please verify your email."
        }
    },

    async login(email, password) {
        await delay(800)

        let users = getFromStorage(STORAGE_KEYS.USERS, [])

        // INTELLIGENT SEEDING: 
        // 1. If storage is empty, seed everything.
        // 2. If storage has users but missing the requested email (and that email is in dummyUsers), inject it.
        // 3. Always ensure the admin user is present if not already.
        const adminUser = dummyUsers.find(u => u.email === "admin@gocycle.com");

        if (users.length === 0) {
            console.log("Storage empty. Seeding all dummy users...")
            users = [...dummyUsers]
            saveToStorage(STORAGE_KEYS.USERS, users)
        } else {
            // Check if the requested user is missing from storage but exists in dummy data
            const targetDummy = dummyUsers.find(d => d.email === email)
            const targetExists = users.find(u => u.email === email)

            if (targetDummy && !targetExists) {
                console.log(`Injecting missing default user: ${email}`)
                users.push(targetDummy)
                saveToStorage(STORAGE_KEYS.USERS, users)
            }

            // Force seed admin if missing
            if (adminUser && !users.find(u => u.email === adminUser.email)) {
                console.log("Injecting missing admin user.")
                users.push(adminUser)
                saveToStorage(STORAGE_KEYS.USERS, users)
            }
        }

        const user = users.find(u => u.email === email)

        if (!user) {
            return { success: false, error: "Account not found" }
        }

        if (user.password !== password) {
            return { success: false, error: "Invalid password" }
        }

        if (user.status === 'banned') {
            return { success: false, error: "Account has been suspended" }
        }

        saveToStorage(STORAGE_KEYS.SESSION, user)

        return { success: true, user }
    },

    async logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.SESSION)
        }
        return { success: true }
    },

    getSession() {
        return getFromStorage(STORAGE_KEYS.SESSION)
    },

    async updateUserVerification(userId, verificationData) {
        await delay(500)
        const users = getFromStorage(STORAGE_KEYS.USERS, [])
        const userIndex = users.findIndex(u => u.id === userId)

        if (userIndex === -1) {
            return { success: false, error: "User not found" }
        }

        users[userIndex] = { ...users[userIndex], ...verificationData }
        saveToStorage(STORAGE_KEYS.USERS, users)

        // Update session if current user
        const session = getFromStorage(STORAGE_KEYS.SESSION)
        if (session && session.id === userId) {
            saveToStorage(STORAGE_KEYS.SESSION, users[userIndex])
        }

        return { success: true, user: users[userIndex] }
    }
}

// ============================================
// PRODUCT SERVICE
// ============================================
export const mockProductService = {
    async createProduct(productData, sellerId) {
        await delay(800)

        const products = getFromStorage(STORAGE_KEYS.PRODUCTS, [])

        const newProduct = {
            id: generateId('prod'),
            sellerId,
            ...productData,
            condition: 'SCRAP', // Always SCRAP
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        products.push(newProduct)
        saveToStorage(STORAGE_KEYS.PRODUCTS, products)

        return { success: true, product: newProduct }
    },

    async getProducts(filters = {}) {
        await delay(300)

        let products = getFromStorage(STORAGE_KEYS.PRODUCTS, [])

        // Apply filters
        if (filters.batteryType) {
            products = products.filter(p => p.batteryType === filters.batteryType)
        }
        if (filters.lga) {
            products = products.filter(p => p.lga === filters.lga)
        }
        if (filters.sellerId) {
            products = products.filter(p => p.sellerId === filters.sellerId)
        }

        return { success: true, products }
    },

    async getProductById(productId) {
        await delay(200)

        const products = getFromStorage(STORAGE_KEYS.PRODUCTS, [])
        const product = products.find(p => p.id === productId)

        if (!product) {
            return { success: false, error: "Product not found" }
        }

        return { success: true, product }
    },

    async updateProduct(productId, updates) {
        await delay(500)

        const products = getFromStorage(STORAGE_KEYS.PRODUCTS, [])
        const index = products.findIndex(p => p.id === productId)

        if (index === -1) {
            return { success: false, error: "Product not found" }
        }

        products[index] = {
            ...products[index],
            ...updates,
            updatedAt: new Date().toISOString()
        }
        saveToStorage(STORAGE_KEYS.PRODUCTS, products)

        return { success: true, product: products[index] }
    },

    async deleteProduct(productId) {
        await delay(500)

        let products = getFromStorage(STORAGE_KEYS.PRODUCTS, [])
        products = products.filter(p => p.id !== productId)
        saveToStorage(STORAGE_KEYS.PRODUCTS, products)

        return { success: true }
    }
}

// ============================================
// ORDER SERVICE
// ============================================
export const mockOrderService = {
    async createOrder(orderData) {
        await delay(1000)

        const orders = getFromStorage(STORAGE_KEYS.ORDERS, [])
        const collectionToken = generateToken()

        const newOrder = {
            id: generateId('ord'),
            ...orderData,
            collectionToken,
            status: 'PAID', // PAID -> AWAITING_PICKUP -> PICKED_UP -> COMPLETED
            isPaid: true,
            paymentMethod: 'Bank Transfer',
            paymentDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        orders.push(newOrder)
        saveToStorage(STORAGE_KEYS.ORDERS, orders)

        return { success: true, order: newOrder, collectionToken }
    },

    async getOrders(filters = {}) {
        await delay(300)

        let orders = getFromStorage(STORAGE_KEYS.ORDERS, [])

        if (filters.buyerId) {
            orders = orders.filter(o => o.buyerId === filters.buyerId)
        }
        if (filters.sellerId) {
            orders = orders.filter(o => o.sellerId === filters.sellerId)
        }
        if (filters.status) {
            orders = orders.filter(o => o.status === filters.status)
        }

        return { success: true, orders }
    },

    async getOrderById(orderId) {
        await delay(200)

        const orders = getFromStorage(STORAGE_KEYS.ORDERS, [])
        const order = orders.find(o => o.id === orderId)

        if (!order) {
            return { success: false, error: "Order not found" }
        }

        return { success: true, order }
    },

    async verifyCollectionToken(orderId, token) {
        await delay(800)

        const orders = getFromStorage(STORAGE_KEYS.ORDERS, [])
        const index = orders.findIndex(o => o.id === orderId)

        if (index === -1) {
            return { success: false, error: "Order not found" }
        }

        if (orders[index].collectionToken !== token) {
            return { success: false, error: "Invalid collection token" }
        }

        orders[index].status = 'PICKED_UP'
        orders[index].pickedUpAt = new Date().toISOString()
        orders[index].updatedAt = new Date().toISOString()
        saveToStorage(STORAGE_KEYS.ORDERS, orders)

        return { success: true, order: orders[index] }
    },

    async updateOrderStatus(orderId, status) {
        await delay(500)

        const orders = getFromStorage(STORAGE_KEYS.ORDERS, [])
        const index = orders.findIndex(o => o.id === orderId)

        if (index === -1) {
            return { success: false, error: "Order not found" }
        }

        orders[index].status = status
        orders[index].updatedAt = new Date().toISOString()

        if (status === 'COMPLETED') {
            orders[index].completedAt = new Date().toISOString()
            orders[index].payoutStatus = 'pending'
        }

        saveToStorage(STORAGE_KEYS.ORDERS, orders)

        return { success: true, order: orders[index] }
    }
}

// ============================================
// PAYMENT SERVICE (Demo Only)
// ============================================
export const mockPaymentService = {
    async initiatePayment(orderDetails) {
        await delay(1500)

        // Simulate payment processing
        const isSuccess = Math.random() > 0.1 // 90% success rate

        if (isSuccess) {
            return {
                success: true,
                transactionId: generateId('txn'),
                reference: `PAY-${Date.now()}`,
                message: "Payment successful"
            }
        }

        return {
            success: false,
            error: "Payment failed. Please try again."
        }
    },

    async verifyPayment(reference) {
        await delay(800)
        return {
            success: true,
            status: 'success',
            reference
        }
    }
}

// ============================================
// NOTIFICATION SERVICE
// ============================================
export const mockNotificationService = {
    async createNotification(notificationData) {
        const notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, [])

        const newNotification = {
            id: generateId('notif'),
            ...notificationData,
            status: 'unread',
            createdAt: new Date().toISOString()
        }

        notifications.push(newNotification)
        saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications)

        return { success: true, notification: newNotification }
    },

    async getNotifications(userId) {
        const notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, [])
        const userNotifications = notifications.filter(n => n.userId === userId)
        return { success: true, notifications: userNotifications }
    },

    async markAsRead(notificationId) {
        const notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, [])
        const index = notifications.findIndex(n => n.id === notificationId)

        if (index !== -1) {
            notifications[index].status = 'read'
            saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications)
        }

        return { success: true }
    },

    // Trigger notification helpers
    triggerWelcome(userId, userName) {
        return this.createNotification({
            userId,
            title: "Welcome to GoCycle!",
            message: `Hi ${userName}, welcome to Lagos' trusted battery marketplace.`,
            type: "WELCOME"
        })
    },

    triggerVerificationStatus(userId, status) {
        const messages = {
            pending: "Your verification is being processed.",
            verified: "Congratulations! Your account is now verified.",
            failed: "Verification failed. Please try again with correct details."
        }
        return this.createNotification({
            userId,
            title: "Verification Update",
            message: messages[status] || messages.pending,
            type: "VERIFICATION"
        })
    },

    triggerListingApproved(userId, productName) {
        return this.createNotification({
            userId,
            title: "Listing Approved",
            message: `Your "${productName}" listing is now live on the marketplace.`,
            type: "LISTING_APPROVED"
        })
    },

    triggerPaymentSuccess(userId, orderId, amount) {
        return this.createNotification({
            userId,
            title: "Payment Received",
            message: `Payment of ₦${amount.toLocaleString()} for order ${orderId} was successful.`,
            type: "PAYMENT_SUCCESS"
        })
    },

    triggerCollectionReminder(userId, orderId, date) {
        return this.createNotification({
            userId,
            title: "Collection Reminder",
            message: `Reminder: Your order ${orderId} is scheduled for collection on ${date}.`,
            type: "COLLECTION_REMINDER"
        })
    },

    triggerPaymentReleased(userId, amount) {
        return this.createNotification({
            userId,
            title: "Payment Released",
            message: `₦${amount.toLocaleString()} has been released to your bank account.`,
            type: "PAYMENT_RELEASED"
        })
    }
}

// ============================================
// ADMIN SERVICE
// ============================================
export const mockAdminService = {
    async getAllUsers() {
        await delay(300)
        const users = getFromStorage(STORAGE_KEYS.USERS, [])
        return { success: true, users }
    },

    async toggleUserStatus(userId) {
        await delay(500)
        const users = getFromStorage(STORAGE_KEYS.USERS, [])
        const index = users.findIndex(u => u.id === userId)

        if (index === -1) {
            return { success: false, error: "User not found" }
        }

        users[index].status = users[index].status === 'active' ? 'banned' : 'active'
        saveToStorage(STORAGE_KEYS.USERS, users)

        return { success: true, user: users[index] }
    },

    async releasePayout(orderId) {
        await delay(800)
        const orders = getFromStorage(STORAGE_KEYS.ORDERS, [])
        const index = orders.findIndex(o => o.id === orderId)

        if (index === -1) {
            return { success: false, error: "Order not found" }
        }

        orders[index].payoutStatus = 'released'
        orders[index].payoutDate = new Date().toISOString()
        saveToStorage(STORAGE_KEYS.ORDERS, orders)

        return { success: true, order: orders[index] }
    },

    async getDashboardStats() {
        await delay(500)
        const users = getFromStorage(STORAGE_KEYS.USERS, [])
        const products = getFromStorage(STORAGE_KEYS.PRODUCTS, [])
        const orders = getFromStorage(STORAGE_KEYS.ORDERS, [])

        const sellers = users.filter(u => u.role === 'SELLER')
        const buyers = users.filter(u => u.role === 'BUYER')
        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)

        return {
            success: true,
            stats: {
                totalSellers: sellers.length,
                totalBuyers: buyers.length,
                totalProducts: products.length,
                totalOrders: orders.length,
                totalRevenue,
                pendingPayouts: orders.filter(o => o.payoutStatus === 'pending').length,
                completedOrders: orders.filter(o => o.status === 'COMPLETED').length
            }
        }
    }
}

// ============================================
// EXPORTS
// ============================================
export const CONSTANTS = {
    LAGOS_LGAS,
    BATTERY_TYPES,
    NETWORK_PROVIDERS
}

export default {
    auth: mockAuthService,
    verification: mockVerificationService,
    product: mockProductService,
    order: mockOrderService,
    payment: mockPaymentService,
    notification: mockNotificationService,
    admin: mockAdminService,
    CONSTANTS
}
