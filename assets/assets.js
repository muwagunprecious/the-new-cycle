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
import { Battery as BatteryIcon, Recycle as RecycleIcon, ShieldCheck as ShieldCheckIcon, Truck as TruckIcon } from "lucide-react";
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

export const dummyRatingsData = []

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
        id: "seller_demo",
        name: "Adebayo Kola",
        email: "adebayo@ecovolt.com",
        image: gs_logo,
    }
}

export const productDummyData = [];

export const ourSpecsData = [
    { title: "Eco-Friendly", description: "Every purchase supports battery recycling and reduces landfill waste.", icon: RecycleIcon, accent: '#05DF72' },
    { title: "Fast Pickup", description: "Schedule a collection in minutes. We handle the logistics.", icon: TruckIcon, accent: '#FF8904' },
    { title: "Verified Sellers", description: "All vendors are vetted for quality and environmental standards.", icon: ShieldCheckIcon, accent: '#A684FF' }
]

export const addressDummyData = {
    id: "addr_1",
    userId: "buyer_demo",
    name: "Demo Buyer",
    email: "buyer@gocycle.com",
    street: "12 Admiralty Way",
    city: "Lekki Phase 1",
    state: "Lagos",
    zip: "101233",
    country: "Nigeria",
    phone: "08091234567",
    createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)',
}

export const couponDummyData = []

export const dummyUserData = {
    id: "buyer_demo",
    name: "Demo Buyer",
    email: "buyer@gocycle.com",
    image: profile_pic1,
    role: "USER",
    cart: {}
}

export const orderDummyData = []

export const storesDummyData = [
    {
        id: "store_1",
        userId: "seller_demo",
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
        user: { name: 'Adebayo Kola', email: 'adebayo@ecovolt.com' },
    }
]

export const dummyUsers = [
    {
        id: "admin_demo",
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
        id: "buyer_demo",
        name: "Demo Buyer",
        email: "buyer@gocycle.com",
        password: "buyer123",
        whatsapp: "+234 809 123 4567",
        role: "USER",
        status: "active",
        lga: "Eti-Osa",
        isEmailVerified: true,
        isPhoneVerified: true,
        accountStatus: "approved",
        verificationStatus: "verified",
        verificationMethod: "NIN",
        image: profile_pic1
    },
    {
        id: "seller_demo",
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
        image: profile_pic2
    }
];

export const dummyNotifications = [];

export const dummyScheduleData = [];

export const dummyAdminDashboardData = {
    "orders": 0,
    "stores": 1,
    "products": 0,
    "revenue": 0,
    "pickedOrders": 0,
    "unpackedOrders": 0,
    "adminCommission": 0,
    "allOrders": [],
    "users": dummyUsers
}

export const dummyStoreDashboardData = {
    "ratings": [],
    "totalOrders": 0,
    "totalEarnings": 0,
    "totalProducts": 0,
    "pendingPickups": 0
}


