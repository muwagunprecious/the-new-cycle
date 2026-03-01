'use client'

import {
    Battery,
    MapPinIcon,
    BoxIcon,
    CalendarIcon,
    ShieldCheckIcon,
    WalletIcon,
    PhoneIcon,
    InfoIcon
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CheckoutModal from "./CheckoutModal";
import Button from "./Button";
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice";
import toast from "react-hot-toast";

/**
 * ProductDetails - Battery product details page
 * 
 * Layout order (as per requirements):
 * 1. Battery Specifications
 * 2. Logistics & Collection Dates
 * 3. Units Available
 * 4. Seller Location (LGA + Address)
 * 5. Pay Now button
 * 
 * Removed: ratings, reviews, discounts, environmental metrics, cart functionality
 */
const ProductDetails = ({ product }) => {
    const currency = '₦'
    const dispatch = useDispatch()
    const router = useRouter()
    const { user, isLoggedIn } = useSelector(state => state.auth)

    const [mainImage, setMainImage] = useState(product.images?.[0])
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState(product?.collectionDates?.[0] || null)
    const [quantity, setQuantity] = useState(1)

    const handlePayNow = () => {
        // Check if user is logged in
        if (!isLoggedIn) {
            toast.error("Please login to continue")
            router.push('/login?redirect=/product/' + product.id)
            return
        }

        // Check if collection date is selected
        if (!selectedDate) {
            toast.error("Please select a collection date")
            return
        }

        dispatch(showLoader("Setting up checkout..."))
        setTimeout(() => {
            dispatch(hideLoader())
            setIsCheckoutOpen(true)
        }, 800)
    }

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-NG', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const getImageUrl = (image) => {
        if (!image) return '/placeholder-battery.jpg'
        if (typeof image === 'string') {
            if (image === '[object Object]' || image === '') return '/placeholder-battery.jpg'
            return image
        }
        if (typeof image === 'object' && image.src) return image.src
        return '/placeholder-battery.jpg'
    }

    return (
        <div className="flex max-lg:flex-col gap-16 p-6 max-w-7xl mx-auto">

            {/* LEFT: Images Showcase */}
            <div className="flex max-sm:flex-col-reverse gap-6 flex-1 h-full sticky top-24">
                <div className="flex sm:flex-col gap-4">
                    {product.images?.map((image, index) => (
                        <div
                            key={index}
                            onClick={() => setMainImage(product.images[index])}
                            className={`bg-white flex items-center justify-center size-20 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden hover:border-emerald-200 ${mainImage === image ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-transparent'}`}
                        >
                            <img
                                src={getImageUrl(image)}
                                className="hover:scale-110 transition-transform duration-500 w-full h-full object-contain p-2"
                                alt=""
                                onError={(e) => { e.target.src = '/placeholder-battery.jpg' }}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex-1 flex justify-center items-center glass rounded-[3rem] p-12 relative group overflow-hidden border border-slate-100 min-h-[500px]">
                    <img
                        src={getImageUrl(mainImage || product.images?.[0])}
                        alt=""
                        className="group-hover:scale-105 transition-transform duration-700 relative z-10 w-full max-w-[450px] h-full object-contain p-4 drop-shadow-2xl"
                        onError={(e) => { e.target.src = '/placeholder-battery.jpg' }}
                    />

                    {/* Condition Badge */}
                    <div className="absolute top-8 left-8 z-20">
                        <span className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
                            {product.condition || 'SCRAP'}
                        </span>
                    </div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]"></div>
                </div>
            </div>

            {/* RIGHT: Product Information */}
            <div className="flex-1 lg:max-w-xl space-y-10">

                {/* Header Context */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                            <ShieldCheckIcon size={12} /> GoCycle Verified
                        </div>
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                            {product.batteryType || 'BATTERY'}
                        </div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-4 tracking-tight">{product.name}</h1>
                    <p className="text-slate-500 text-lg leading-relaxed font-medium">{product.description}</p>
                </div>

                {/* Price Display */}
                <div className="flex items-end gap-3">
                    <span className="text-4xl font-black text-slate-900">{currency}{(product.price || 0).toLocaleString()}</span>
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Per Unit</span>
                </div>

                {/* Specifications Grid */}
                <div className="grid grid-cols-2 gap-4 p-8 glass rounded-[2.5rem] border-slate-100">
                    {[
                        { label: 'Battery Type', value: product.batteryType || product.category, icon: Battery },
                        { label: 'Brand', value: product.brand || 'Original', icon: InfoIcon },
                        { label: 'Condition', value: product.condition || 'SCRAP', color: 'text-amber-600' },
                        { label: 'Stock Status', value: `${product.unitsAvailable || 0} Units In Stock`, color: 'text-emerald-600' }
                    ].map((spec, i) => (
                        <div key={i} className="space-y-1.5">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{spec.label}</span>
                            <p className={`text-sm font-black ${spec.color || 'text-slate-800'}`}>{spec.value}</p>
                        </div>
                    ))}
                </div>

                {/* Logistics Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Collection Schedule
                        </h2>
                        <span className="text-[10px] font-bold text-slate-400 px-2 py-1 bg-slate-50 rounded-lg">Lagos LGA: {product.lga || 'Verified'}</span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {product.collectionDates?.map(date => (
                            <button
                                key={date}
                                onClick={() => setSelectedDate(date)}
                                className={`px-6 py-4 rounded-2xl text-xs font-black transition-all border-2 ${selectedDate === date
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl translate-y-[-2px]'
                                    : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200 hover:text-emerald-600'
                                    }`}
                            >
                                {formatDate(date)}
                            </button>
                        ))}
                    </div>

                    {!product.collectionDates?.length && (
                        <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                            No dates scheduled. Contact seller.
                        </div>
                    )}
                </div>

                {/* Purchase Controls */}
                <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Quantity:</span>
                            <div className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 rounded-lg bg-slate-50 text-slate-600 font-black hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                >
                                    -
                                </button>
                                <span className="w-8 text-center font-black text-slate-900 text-lg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.unitsAvailable || 1, quantity + 1))}
                                    className="w-10 h-10 rounded-lg bg-slate-50 text-slate-600 font-black hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Subtotal</p>
                            <p className="text-3xl font-black text-slate-900">{currency}{(product.price * quantity).toLocaleString()}</p>
                        </div>
                    </div>

                    <Button
                        onClick={handlePayNow}
                        className="w-full !py-6 !rounded-[2rem] text-lg shadow-2xl"
                    >
                        <WalletIcon size={22} className="mr-2" />
                        PROCEED TO SECURE CHECKOUT
                    </Button>

                    <div className="flex items-center justify-center gap-4 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheckIcon size={12} className="text-emerald-500" /> Secure Payment via GoCycle Escrow
                        </p>
                    </div>
                </div>

            </div>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                product={product}
                quantity={quantity}
                selectedDate={selectedDate}
            />
        </div>
    )
}

export default ProductDetails
