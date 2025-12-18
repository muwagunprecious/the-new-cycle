'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import {
    StarIcon,
    TagIcon,
    Battery,
    MapPin,
    Package,
    Boxes,
    ShieldCheckIcon,
    TruckIcon,
    WalletIcon,
    CheckCircle2
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";
import CheckoutModal from "./CheckoutModal";
import Button from "./Button";
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice";

const ProductDetails = ({ product }) => {

    const productId = product.id;
    const currency = '₦'; // As per NEXT_PUBLIC_CURRENCY_SYMBOL

    const cart = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();

    const router = useRouter()

    const [mainImage, setMainImage] = useState(product.images[0]);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState('Pay Now');
    const [isAdding, setIsAdding] = useState(false);
    const [added, setAdded] = useState(false);

    const addToCartHandler = () => {
        setIsAdding(true)
        setTimeout(() => {
            dispatch(addToCart({ productId }))
            setIsAdding(false)
            setAdded(true)
            setTimeout(() => setAdded(false), 2000)
        }, 1200)
    }

    const openCheckout = (method) => {
        setSelectedPayment(method)
        dispatch(showLoader(`Setting up ${method} checkout...`))
        setTimeout(() => {
            dispatch(hideLoader())
            setIsCheckoutOpen(true)
        }, 1000)
    }

    const averageRating = product.rating?.length > 0 ?
        product.rating.reduce((acc, item) => acc + item.rating, 0) /
        product.rating.length : 0;

    return (
        <div className="flex max-lg:flex-col gap-12 p-4">

            {/* LEFT: Images */}
            <div className="flex max-sm:flex-col-reverse gap-4 flex-1">
                <div className="flex sm:flex-col gap-4">
                    {product.images.map((image, index) => (
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
                                objectFit="cover"
                            />
                        </div>
                    ))}
                </div>

                <div className="flex-1 flex justify-center items-center bg-slate-50 rounded-[2.5rem] p-10 relative group overflow-hidden border border-slate-100 min-h-[400px]">
                    <Image src={mainImage} alt="" width={400} height={400} className="group-hover:scale-105 transition-transform duration-700 relative z-10" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#05DF72]/5 rounded-full blur-[80px]"></div>
                </div>
            </div>

            {/* RIGHT: Product info */}
            <div className="flex-1 lg:max-w-xl">
                <div className="inline-flex items-center gap-2 bg-green-50 text-[#05DF72] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-green-100">
                    <ShieldCheckIcon size={12} /> Verified Battery
                </div>

                <h1 className="text-4xl font-black text-slate-900 leading-tight">{product.name}</h1>

                <div className="flex items-center mt-4">
                    <div className="flex gap-0.5">
                        {Array(5)
                            .fill('')
                            .map((_, index) => (
                                <StarIcon
                                    key={index}
                                    size={16}
                                    fill={averageRating >= index + 1 ? "#05DF72" : "#E2E8F0"}
                                    stroke="none"
                                />
                            ))}
                    </div>
                    <p className="text-sm ml-3 text-slate-500 font-medium">({product.rating.length} customer reviews)</p>
                </div>

                <div className="flex items-baseline my-8 gap-4">
                    <p className="text-4xl font-black text-slate-900">{currency}{product.price.toLocaleString()}</p>
                    <p className="text-xl text-slate-400 line-through font-medium">
                        {currency}{product.mrp.toLocaleString()}
                    </p>
                    <span className="bg-rose-50 text-rose-500 text-[10px] font-black px-2 py-1 rounded-md">
                        {((product.mrp - product.price) / product.mrp * 100).toFixed(0)}% OFF
                    </span>
                </div>

                <div className="flex flex-col gap-4 mb-10">
                    <h2 className="text-lg font-bold text-slate-900 border-l-4 border-[#05DF72] pl-4">Purchase Options</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => openCheckout('Pay Now')}
                            className="flex flex-col items-center justify-center p-6 bg-slate-900 text-white rounded-[2rem] hover:bg-[#05DF72] transition-all group shadow-xl hover:scale-[1.02] active:scale-95 duration-300"
                        >
                            <WalletIcon className="mb-2 group-hover:scale-110 transition-transform" size={24} />
                            <span className="font-bold">Pay Now</span>
                            <span className="text-[10px] text-white/60 font-medium font-bold">Secure Card Payment</span>
                        </button>
                        <button
                            onClick={() => openCheckout('Pay on Delivery')}
                            className="flex flex-col items-center justify-center p-6 bg-white border-2 border-slate-100 text-slate-900 rounded-[2rem] hover:border-[#05DF72] hover:text-[#05DF72] transition-all group hover:scale-[1.02] active:scale-95 duration-300 shadow-sm"
                        >
                            <TruckIcon className="mb-2 group-hover:scale-110 transition-transform" size={24} />
                            <span className="font-bold">Pay on Delivery</span>
                            <span className="text-[10px] text-slate-400 font-bold">Lagos Delivery only</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-5 mt-10">
                    {cart[productId] && (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs text-slate-400 font-black uppercase tracking-widest pl-1">Quantity</p>
                            <Counter productId={productId} />
                        </div>
                    )}

                    <Button
                        onClick={() => !cart[productId] ? addToCartHandler() : router.push('/cart')}
                        loading={isAdding}
                        loadingText="Adding..."
                        variant={cart[productId] ? "secondary" : "primary"}
                        className={`flex-1 !rounded-[2rem] !py-5 shadow-lg ${added ? '!bg-green-50 !text-green-600 !border-green-200 !border-2' : ''}`}
                    >
                        {added ? (
                            <span className="flex items-center gap-2"><CheckCircle2 size={18} /> Added ✓</span>
                        ) : (
                            !cart[productId] ? 'Add to Cart' : 'View in Cart'
                        )}
                    </Button>
                </div>

                <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Battery className="text-[#05DF72]" size={20} /> Specs & Logistics
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm"><Battery size={16} className="text-slate-400" /></div>
                                <div className="flex flex-col"><span className="text-[10px] text-slate-400 font-bold uppercase">Capacity</span><span className="text-sm font-bold text-slate-700">{product.capacity || 'N/A'}</span></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm"><MapPin size={16} className="text-slate-400" /></div>
                                <div className="flex flex-col"><span className="text-[10px] text-slate-400 font-bold uppercase">Pickup Location</span><span className="text-sm font-bold text-slate-700">{product.store?.address || 'Lagos'}</span></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm"><Package size={16} className="text-slate-400" /></div>
                                <div className="flex flex-col"><span className="text-[10px] text-slate-400 font-bold uppercase">Condition</span><span className="text-sm font-bold text-slate-700">{product.condition || 'Used'}</span></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm"><Boxes size={16} className="text-slate-400" /></div>
                                <div className="flex flex-col"><span className="text-[10px] text-slate-400 font-bold uppercase">Availability</span><span className="text-sm font-bold text-[#05DF72]">In Stock</span></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                product={product}
                paymentMethod={selectedPayment}
            />
        </div>
    )
}

export default ProductDetails

