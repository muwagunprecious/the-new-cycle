import gs_logo from "./gs_logo.jpg"
import happy_store from "./happy_store.webp"
import upload_area from "./upload_area.svg"
import gocycle from "./gocycle.png"
import hero_product_img1 from "./battery 2.png"
import hero_product_img2 from "./battery 2.png"
import product_img1 from "./battery 2.jpg"
import product_img2 from "./battery 3.jpg"
import product_img3 from "./battery 4.jpg"
import product_img4 from "./battery 5.jpg"
import product_img5 from "./battery 6.jpg"
import product_img6 from "./battery 7.jpg"
import product_img7 from "./battery 8.jpg"
import product_img8 from "./battery 9.jpg"
import product_img9 from "./battery 10.jpg"
import product_img10 from "./battery 11.jpg"
import product_img11 from "./battery 12.jpg"
import product_img12 from "./battery 13.jpg"
import { BatteryIcon, RecycleIcon, ShieldCheckIcon, TruckIcon } from "lucide-react";
import profile_pic1 from "./profile_pic1.jpg"
import profile_pic2 from "./profile_pic2.jpg"
import profile_pic3 from "./profile_pic3.jpg"

export const assets = {
    upload_area, gocycle,
    hero_product_img1, hero_product_img2, gs_logo,
    product_img1, product_img2, product_img3, product_img4, product_img5, product_img6,
    product_img7, product_img8, product_img9, product_img10, product_img11, product_img12,
}

export const categories = ["Car Battery", "Inverter Battery", "Heavy Duty Battery"];

export const lagosLGAs = [
    "Ikeja", "Surulere", "Alimosho", "Kosofe", "Eti-Osa", "Agege", "Mushin",
    "Shomolu", "Apapa", "Badagry", "Epe", "Ikorodu", "Lagos Island",
    "Lagos Mainland", "Ifako-Ijaiye", "Ajeromi-Ifelodun", "Amuwo-Odofin",
    "Oshodi-Isolo", "Ojo", "Ibeju-Lekki"
];

export const dummyRatingsData = [
    { id: "rat_1", rating: 4.2, review: "Great battery life, works perfectly for my car setup. Very happy with the recycling service too!", user: { name: 'Kristin Watson', image: profile_pic1 }, productId: "prod_1", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', product: { name: 'Car Battery 12V', category: 'Car Battery', id: 'prod_1' } },
    { id: "rat_2", rating: 5.0, review: "Excellent condition for a used battery. Picked up on time. Highly recommended.", user: { name: 'Jenny Wilson', image: profile_pic2 }, productId: "prod_2", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)', product: { name: 'Inverter Battery', category: 'Inverter Battery', id: 'prod_1' } },
]

export const dummyStoreData = {
    id: "store_1",
    userId: "user_1",
    name: "EcoVolt Solutions",
    description: "EcoVolt Solutions is a leading vendor of sustainable energy storage. We specialize in refurbishing and recycling batteries to promote a circular economy in Lagos.",
    username: "ecovolt",
    address: "45 Ikeja Industrial Estate, Ikeja, Lagos",
    status: "approved",
    isActive: true,
    logo: happy_store,
    email: "contact@ecovolt.com",
    contact: "+234 801 234 5678",
    createdAt: "2025-09-04T09:04:16.189Z",
    updatedAt: "2025-09-04T09:04:44.273Z",
    user: {
        id: "user_31dOriXqC4TATvc0brIhlYbwwc5",
        name: "Adebayo Kola",
        email: "adebayo@ecovolt.com",
        image: gs_logo,
    }
}

export const productDummyData = [
    {
        id: "prod_1",
        name: "Scrap Car Battery 12V",
        description: "Used 12V car battery suitable for recycling or refurbishment. Good core value.",
        batteryType: "Car Battery",
        brand: "Bosch",
        condition: "SCRAP",
        unitsAvailable: 5,
        price: 15000,
        images: [product_img1, product_img2],
        storeId: "store_1",
        sellerId: "user_seller_1",
        lga: "Ikeja",
        address: "45 Ikeja Industrial Estate, Near LASUTH",
        collectionDates: ["2026-01-14", "2026-01-15", "2026-01-16", "2026-01-17"],
        comments: "Batteries are from fleet vehicles. Good for core exchange programs.",
        store: dummyStoreData,
        createdAt: '2026-01-10T14:51:25.000Z',
        updatedAt: '2026-01-10T14:51:25.000Z',
    },
    {
        id: "prod_2",
        name: "Scrap Inverter Battery 200Ah",
        description: "Used deep cycle inverter battery. Cells still hold partial charge. Ideal for recycling.",
        batteryType: "Inverter Battery",
        brand: "Luminous",
        condition: "SCRAP",
        unitsAvailable: 3,
        price: 25000,
        images: [product_img3, product_img4],
        storeId: "store_1",
        sellerId: "user_seller_1",
        lga: "Lekki",
        address: "12 Admiralty Way, Lekki Phase 1",
        collectionDates: ["2026-01-14", "2026-01-15", "2026-01-18"],
        comments: "From residential inverter systems. Pickup available all listed dates.",
        store: dummyStoreData,
        createdAt: '2026-01-09T14:51:25.000Z',
        updatedAt: '2026-01-09T14:51:25.000Z',
    },
    {
        id: "prod_3",
        name: "Heavy Duty Truck Battery Pack",
        description: "Commercial vehicle batteries for scrap. Multiple units available.",
        batteryType: "Heavy Duty Battery",
        brand: null,
        condition: "SCRAP",
        unitsAvailable: 8,
        price: 35000,
        images: [product_img5, product_img6],
        storeId: "store_1",
        sellerId: "user_seller_1",
        lga: "Apapa",
        address: "Wharf Road, Near Tin Can Island Port",
        collectionDates: ["2026-01-15", "2026-01-16", "2026-01-17", "2026-01-20"],
        comments: "From logistics fleet. Heavy items - bring appropriate vehicle for pickup.",
        store: dummyStoreData,
        createdAt: '2026-01-08T14:51:25.000Z',
        updatedAt: '2026-01-08T14:51:25.000Z',
    }
];

export const ourSpecsData = [
    { title: "Eco-Friendly", description: "Every purchase supports battery recycling and reduces landfill waste.", icon: RecycleIcon, accent: '#05DF72' },
    { title: "Fast Pickup", description: "Schedule a collection in minutes. We handle the logistics.", icon: TruckIcon, accent: '#FF8904' },
    { title: "Verified Sellers", description: "All vendors are vetted for quality and environmental standards.", icon: ShieldCheckIcon, accent: '#A684FF' }
]

export const addressDummyData = {
    id: "addr_1",
    userId: "user_1",
    name: "Emeka Obi",
    email: "emeka@example.com",
    street: "12 Admiralty Way",
    city: "Lekki Phase 1",
    state: "Lagos",
    zip: "101233",
    country: "Nigeria",
    phone: "08091234567",
    createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)',
}

export const couponDummyData = [
    { code: "RECYCLE20", description: "20% Off for your first recycling purchase", discount: 20, forNewUser: true, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:35:31.183Z" },
]

export const dummyUserData = {
    id: "user_1",
    name: "Emeka Obi",
    email: "emeka@example.com",
    image: profile_pic1,
    role: "BUYER",
    cart: {}
}

export const orderDummyData = [
    {
        id: "ord_101",
        totalAmount: 15000,
        status: "COMPLETED",
        buyerId: "user_buyer_1",
        sellerId: "user_seller_1",
        productId: "prod_1",
        quantity: 1,
        collectionToken: "GC7XK2M9",
        collectionDate: "2026-01-14",
        isPaid: true,
        paymentMethod: "Bank Transfer",
        payoutStatus: "released",
        createdAt: "2026-01-10T09:15:03.929Z",
        updatedAt: "2026-01-14T12:30:00.000Z",
        pickedUpAt: "2026-01-14T12:25:00.000Z",
        completedAt: "2026-01-14T12:30:00.000Z",
        product: productDummyData[0],
        buyerAddress: addressDummyData
    },
    {
        id: "ord_102",
        totalAmount: 25000,
        status: "AWAITING_PICKUP",
        buyerId: "user_buyer_1",
        sellerId: "user_seller_1",
        productId: "prod_2",
        quantity: 1,
        collectionToken: "GC4RT8P2",
        collectionDate: "2026-01-15",
        isPaid: true,
        paymentMethod: "Bank Transfer",
        payoutStatus: "pending",
        createdAt: "2026-01-12T10:00:00.000Z",
        updatedAt: "2026-01-12T10:00:00.000Z",
        product: productDummyData[1],
        buyerAddress: addressDummyData
    }
]

export const storesDummyData = [
    {
        id: "store_1",
        userId: "user_1",
        name: "EcoVolt Solutions",
        description: "Specializing in used and scrap batteries.",
        username: "ecovolt",
        address: "Ikeja, Lagos",
        status: "approved",
        isActive: true,
        logo: happy_store,
        email: "adebayo@ecovolt.com",
        contact: "+234 801 234 5678",
        createdAt: "2025-08-22T08:22:16.189Z",
        updatedAt: "2025-08-22T08:22:44.273Z",
        user: dummyUserData,
    }
]

export const dummyUsers = [
    {
        id: "user_admin",
        name: "Admin Superuser",
        email: "admin@gocycle.com",
        password: "admin123",
        whatsapp: "+234 900 000 0001",
        role: "ADMIN",
        status: "active",
        isEmailVerified: true,
        isPhoneVerified: true,
        verificationStatus: "verified",
        image: profile_pic1
    },
    {
        id: "user_buyer_1",
        name: "Emeka Obi",
        email: "emeka@example.com",
        password: "buyer123",
        whatsapp: "+234 809 123 4567",
        role: "BUYER",
        status: "active",
        lga: "Eti-Osa",
        isEmailVerified: true,
        isPhoneVerified: true,
        verificationStatus: "verified",
        verificationMethod: "NIN",
        bankDetails: {
            accountNumber: "0123456789",
            bankName: "GTBank",
            accountName: "Emeka Obi"
        },
        image: profile_pic1
    },
    {
        id: "user_seller_1",
        name: "Adebayo Kola",
        email: "adebayo@ecovolt.com",
        password: "seller123",
        whatsapp: "+234 801 234 5678",
        role: "SELLER",
        status: "active",
        businessName: "EcoVolt Solutions",
        lga: "Ikeja",
        isEmailVerified: true,
        isPhoneVerified: true,
        verificationStatus: "verified",
        phoneIntelligence: {
            registrationAge: "4+ years ago",
            networkProvider: "MTN",
            riskLevel: "Low"
        },
        bankDetails: {
            accountNumber: "9876543210",
            bankName: "Access Bank",
            accountName: "EcoVolt Solutions"
        },
        image: profile_pic2
    }
];

export const dummyNotifications = [
    {
        id: "notif_1",
        userId: "user_admin",
        title: "New Vendor Application",
        message: "EcoVolt Solutions has applied to be a seller.",
        type: "SYSTEM",
        status: "unread",
        createdAt: new Date().toISOString()
    },
    {
        id: "notif_2",
        userId: "user_seller_1",
        title: "Product Approved",
        message: "Your 'Classic Car Battery 12V' listing is now live.",
        type: "SUCCESS",
        status: "unread",
        createdAt: new Date().toISOString()
    },
    {
        id: "notif_3",
        userId: "user_buyer_1",
        title: "Order Confirmed",
        message: "Your order ORD-101 has been confirmed by the seller.",
        type: "ORDER",
        status: "unread",
        createdAt: new Date().toISOString()
    }
];

// Simulate blocked dates for the calendar demo
export const dummyScheduleData = [
    // Random dates in near future to show as blocked
    { date: "2026-01-20", slot: "Morning" },
    { date: "2026-01-22", slot: "Afternoon" },
    { date: "2026-02-15", slot: "Morning" }
].map(d => d.date); // For simple blocking logic, just blocking the whole day in demo or specific check

export const dummyAdminDashboardData = {
    "orders": 124,
    "stores": 45,
    "products": 312,
    "revenue": 2450000,
    "pickedOrders": 89,
    "unpackedOrders": 15,
    "adminCommission": 245000,
    "allOrders": orderDummyData,
    "users": dummyUsers
}

export const dummyStoreDashboardData = {
    "ratings": dummyRatingsData,
    "totalOrders": 12,
    "totalEarnings": 450000,
    "totalProducts": 8,
    "pendingPickups": 3
}

