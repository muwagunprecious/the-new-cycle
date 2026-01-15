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
import Image from "next/image";
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
    const [selectedDate, setSelectedDate] = useState(null)
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

    return (
        <div className="flex max-lg:flex-col gap-12 p-4">

            {/* LEFT: Images */}
            <div className="flex max-sm:flex-col-reverse gap-4 flex-1">
                <div className="flex sm:flex-col gap-4">
                    {product.images?.map((image, index) => (
                        <div
                            key={index}
                            onClick={() => setMainImage(product.images[index])}
                            className={`bg-slate-50 flex items-center justify-center size-24 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${mainImage === image ? 'border-[#05DF72]' : 'border-transparent'}`}
                        >
                            <Image
                                src={image}
                                className="hover:scale-110 transition-transform duration-500"
                                alt=""
                                width={80}
                                height={80}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex-1 flex justify-center items-center bg-slate-50 rounded-[2.5rem] p-10 relative group overflow-hidden border border-slate-100 min-h-[400px]">
                    <Image src={mainImage || product.images?.[0]} alt="" width={400} height={400} className="group-hover:scale-105 transition-transform duration-700 relative z-10" />

                    {/* Condition Badge */}
                    <div className="absolute top-6 left-6 z-20">
                        <span className="bg-amber-500 text-white text-xs font-black uppercase px-3 py-1.5 rounded-full">
                            {product.condition || 'SCRAP'}
                        </span>
                    </div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#05DF72]/5 rounded-full blur-[80px]"></div>
                </div>
            </div>

            {/* RIGHT: Product info - Ordered as per requirements */}
            <div className="flex-1 lg:max-w-xl space-y-8">

                {/* Header */}
                <div>
                    <div className="inline-flex items-center gap-2 bg-green-50 text-[#05DF72] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-green-100">
                        <ShieldCheckIcon size={12} /> GoCycle Verified
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 leading-tight">{product.name}</h1>
                    <p className="text-slate-500 mt-2">{product.description}</p>
                </div>

                {/* SECTION 1: Battery Specifications */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Battery className="text-[#05DF72]" size={18} />
                        Battery Specifications
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Type</span>
                            <p className="text-sm font-bold text-slate-800">{product.batteryType || product.category}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Brand</span>
                            <p className="text-sm font-bold text-slate-800">{product.brand || 'Not specified'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Condition</span>
                            <p className="text-sm font-bold text-amber-600">{product.condition || 'SCRAP'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Price Per Unit</span>
                            <p className="text-lg font-black text-slate-900">{currency}{(product.price || 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: Logistics & Collection Dates */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <CalendarIcon className="text-[#05DF72]" size={18} />
                        Collection Dates
                    </h2>
                    <p className="text-xs text-slate-500 mb-4">Select your preferred pickup date:</p>

                    <div className="flex flex-wrap gap-2">
                        {product.collectionDates?.map(date => (
                            <button
                                key={date}
                                onClick={() => setSelectedDate(date)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedDate === date
                                        ? 'bg-[#05DF72] text-white'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-[#05DF72]'
                                    }`}
                            >
                                {formatDate(date)}
                            </button>
                        ))}
                    </div>

                    {!product.collectionDates?.length && (
                        <p className="text-sm text-slate-400">No collection dates available. Contact seller.</p>
                    )}
                </div>

                {/* SECTION 3: Units Available */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <BoxIcon className="text-[#05DF72]" size={18} />
                        Units Available
                    </h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-black text-slate-900">{product.unitsAvailable || 1}</p>
                            <p className="text-xs text-slate-500">units in stock</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 font-medium">Quantity:</span>
                            <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                                >
                                    -
                                </button>
                                <span className="w-8 text-center font-bold text-slate-900">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.unitsAvailable || 1, quantity + 1))}
                                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 4: Seller Location */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <MapPinIcon className="text-[#05DF72]" size={18} />
                        Pickup Location
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 font-medium w-16">LGA:</span>
                            <span className="text-sm font-bold text-slate-800">{product.lga || 'Lagos'}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xs text-slate-500 font-medium w-16">Address:</span>
                            <span className="text-sm font-medium text-slate-700">{product.address || product.store?.address || 'Contact seller for address'}</span>
                        </div>
                    </div>

                    {/* Seller Contact Info */}
                    {product.store && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                    <span className="text-sm font-bold text-slate-600">
                                        {product.store.name?.charAt(0) || 'S'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{product.store.name}</p>
                                    <p className="text-xs text-slate-500">Verified Seller</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* SECTION 5: Pay Now Button */}
                <div className="space-y-4">
                    {/* Total */}
                    <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white">
                        <span className="text-sm font-medium">Total ({quantity} unit{quantity > 1 ? 's' : ''}):</span>
                        <span className="text-2xl font-black">{currency}{(product.price * quantity).toLocaleString()}</span>
                    </div>

                    {/* Pay Now Button */}
                    <Button
                        onClick={handlePayNow}
                        className="w-full !py-5 !rounded-2xl shadow-xl shadow-[#05DF72]/20 text-lg"
                    >
                        <WalletIcon size={20} className="mr-2" />
                        Pay Now
                    </Button>

                    {/* Info Note */}
                    <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                        <InfoIcon size={12} />
                        Payment goes to GoCycle. Seller receives payment after collection is confirmed.
                    </p>
                </div>

                {/* Comments/Description */}
                {product.comments && (
                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                        <h2 className="text-sm font-bold text-amber-800 mb-2">Seller Notes</h2>
                        <p className="text-sm text-amber-700">{product.comments}</p>
                    </div>
                )}
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
