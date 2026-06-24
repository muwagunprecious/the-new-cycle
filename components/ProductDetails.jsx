'use client'

import {
    Battery,
    MapPin as MapPinIcon,
    Box as BoxIcon,
    Calendar as CalendarIcon,
    ShieldCheck as ShieldCheckIcon,
    Wallet as WalletIcon,
    Phone as PhoneIcon,
    Info as InfoIcon
} from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";
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
    const searchParams = useSearchParams()
    const isAdminPreview = searchParams.get('adminPreview') === 'true'

    const [mainImage, setMainImage] = useState(product.images?.[0])
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)
    const [selectedDate, setSelectedDate] = useState(product?.collectionDates?.[0] || null)
    const quantity = product?.unitsAvailable || product?.quantity || 1

    const handlePayNow = () => {
        if (!isLoggedIn) {
            toast.error("Please login to proceed with purchase")
            router.push(`/login?redirect=/product/${product?.id}`)
            return
        }

        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'SELLER') {
            toast.error(user?.role === 'SELLER' ? "Sellers cannot purchase batteries. Please use a buyer account." : "Administrators are not permitted to make purchases.")
            return
        }

        // Check if collection date is selected
        if (!selectedDate) {
            toast.error("Please select a collection date")
            return
        }

        setIsInitializing(true)
        dispatch(showLoader("Setting up checkout..."))
        setTimeout(() => {
            dispatch(hideLoader())
            setIsInitializing(false)
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
        <div className="flex max-lg:flex-col gap-8 lg:gap-16 py-6 max-w-7xl mx-auto">

            {/* LEFT: Images Showcase */}
            <div className="flex max-sm:flex-col-reverse gap-4 sm:gap-6 flex-1 lg:sticky lg:top-24 lg:self-start">
                <div className="flex sm:flex-col gap-3">
                    {product.images?.map((image, index) => (
                        <div
                            key={index}
                            onClick={() => setMainImage(product.images[index])}
                            className={`bg-white flex items-center justify-center size-20 rounded-sm border transition-all cursor-pointer overflow-hidden ${mainImage === image ? 'border-[#05DF72] ring-2 ring-[#05DF72]/10 bg-slate-50' : 'border-slate-200 hover:border-[#05DF72]/50'}`}
                        >
                            <img
                                src={getImageUrl(image)}
                                className="transition-transform duration-500 w-full h-full object-contain p-2"
                                alt=""
                                onError={(e) => { e.target.src = '/placeholder-battery.jpg' }}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex-1 flex justify-center items-center bg-white border border-slate-200 rounded-sm p-6 sm:p-10 relative group overflow-hidden shadow-sm min-h-[280px] sm:min-h-[400px] lg:min-h-[500px]">
                    <img
                        src={getImageUrl(mainImage || product.images?.[0])}
                        alt=""
                        className="group-hover:scale-[1.02] transition-transform duration-700 relative z-10 w-full max-w-[420px] h-full object-contain p-4 drop-shadow-md"
                        onError={(e) => { e.target.src = '/placeholder-battery.jpg' }}
                    />

                    {/* Condition Badge */}
                    <div className="absolute top-4 left-4 z-20">
                        <span className="bg-[#05DF72]/10 border border-[#05DF72]/20 text-[#05DF72] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm">
                            {product.condition || 'SCRAP'}
                        </span>
                    </div>
                </div>
            </div>

            {/* RIGHT: Product Information */}
            <div className="flex-1 lg:max-w-xl space-y-6 sm:space-y-8">

                {/* Header Context */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-1.5 bg-[#05DF72]/10 text-[#05DF72] px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border border-[#05DF72]/20">
                            <ShieldCheckIcon size={12} /> GoCycle Verified
                        </div>
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                            {product.batteryType || 'BATTERY'}
                        </div>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight tracking-tight">{product.name}</h1>
                    <p className="text-slate-500 text-sm sm:text-base leading-relaxed">{product.description}</p>
                </div>

                {/* Price Display */}
                <div className="flex items-end gap-2">
                    <span className="text-xl sm:text-3xl font-bold text-slate-900">{currency}{(product.price || 0).toLocaleString()}</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Per Unit</span>
                </div>

                {/* Specifications Grid */}
                <div className="grid grid-cols-2 gap-4 p-5 sm:p-6 bg-white border border-slate-200 rounded-sm shadow-sm">
                    {[
                        { label: 'Battery Type', value: product.batteryType || product.category, icon: Battery },
                        { label: 'Brand', value: product.brand || '', icon: InfoIcon },
                        { label: 'Condition', value: product.condition || 'SCRAP', color: 'text-amber-600' },
                        { label: 'Stock Status', value: `${product.unitsAvailable || 0} Units In Stock`, color: 'text-emerald-600' }
                    ].map((spec, i) => (
                        <div key={i} className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{spec.label}</span>
                            <p className={`text-xs sm:text-sm font-semibold ${spec.color || 'text-slate-800'}`}>{spec.value}</p>
                        </div>
                    ))}
                </div>

                {/* Logistics Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            Collection Schedule
                        </h2>
                        <span className="text-[9px] font-bold text-slate-500 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-sm">Lagos LGA: {product.lga || 'Verified'}</span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                        {product.collectionDates?.map(date => (
                            <button
                                key={date}
                                onClick={() => setSelectedDate(date)}
                                className={`px-4 py-2.5 rounded-sm text-xs font-bold transition-all border ${selectedDate === date
                                    ? 'bg-[#0c101b] border-slate-900 text-white shadow-sm'
                                    : 'bg-white border-slate-200 text-slate-650 hover:border-[#05DF72]/50 hover:text-[#05DF72]'
                                    }`}
                            >
                                {formatDate(date)}
                            </button>
                        ))}
                    </div>

                    {!product.collectionDates?.length && (
                        <div className="p-4 bg-slate-50 rounded-sm border border-slate-200 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                            No dates scheduled. Contact seller.
                        </div>
                    )}
                </div>

                {/* Purchase Controls */}
                <div className="space-y-4 pt-6 border-t border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-5 rounded-sm border border-slate-200 gap-4 sm:gap-0">
                        <div className="flex items-center justify-between sm:justify-start gap-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Units:</span>
                            <span className="text-xl font-bold text-slate-900">{quantity}</span>
                        </div>
                        <div className="text-left sm:text-right border-t sm:border-t-0 border-slate-200 pt-4 sm:pt-0">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Total Amount</p>
                            <p className="text-lg sm:text-2xl font-bold text-slate-900">{currency}{(product.price * quantity).toLocaleString()}</p>
                        </div>
                    </div>

                    {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'SELLER' || isAdminPreview) ? (
                        <div className="w-full py-4 rounded-sm text-xs bg-slate-100 text-slate-400 font-bold text-center flex items-center justify-center border border-slate-200 shadow-inner uppercase tracking-wider">
                            <ShieldCheckIcon size={16} className="mr-2 opacity-50" />
                            {user?.role === 'SELLER' ? 'SELLERS CANNOT PURCHASE BATTERIES' : 'ADMIN PREVIEW MODE - PURCHASE DISABLED'}
                        </div>
                    ) : (
                        <button
                            onClick={handlePayNow}
                            disabled={isInitializing}
                            className="w-full bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] text-slate-950 font-bold uppercase tracking-wider py-4 rounded-sm text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            <WalletIcon size={16} />
                            PROCEED TO SECURE CHECKOUT
                        </button>
                    )}

                    <div className="flex items-center justify-center gap-2 text-center">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheckIcon size={12} className="text-[#05DF72]" /> Secure Payment via GoCycle Escrow
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
