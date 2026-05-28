import gs_logo from "./gocycle.png"
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

export const productDummyData = [];
export const dummyRatingsData = [];
export const dummyStoreData = {};
export const ourSpecsData = [
    { title: "Eco-Friendly", description: "Every purchase supports battery recycling and reduces landfill waste.", icon: RecycleIcon, accent: '#05DF72' },
    { title: "Fast Pickup", description: "Schedule a collection in minutes. We handle the logistics.", icon: TruckIcon, accent: '#FF8904' },
    { title: "Verified Sellers", description: "All vendors are vetted for quality and environmental standards.", icon: ShieldCheckIcon, accent: '#A684FF' }
];

export const dummyUserData = {};
export const orderDummyData = [];
export const storesDummyData = [];
export const dummyUsers = [];
export const dummyNotifications = [];
export const dummyScheduleData = [];
export const dummyAdminDashboardData = {
  "orders": 0,
  "stores": 0,
  "products": 0,
  "revenue": 0,
  "pickedOrders": 0,
  "unpackedOrders": 0,
  "adminCommission": 0,
  "allOrders": [],
  "users": []
};
export const dummyStoreDashboardData = {
  "ratings": [],
  "totalOrders": 0,
  "totalEarnings": 0,
  "totalProducts": 0,
  "pendingPickups": 0
};

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
};


