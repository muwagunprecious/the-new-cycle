'use client'
import { useState } from "react"
import { XIcon, LockIcon, MailIcon, UserIcon, ShieldCheckIcon, CreditCardIcon, TruckIcon } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { showLoader, hideLoader, setLoadingSteps, nextLoadingStep } from "@/lib/features/ui/uiSlice"
import Button from "./Button"

export default function CheckoutModal({ isOpen, onClose, product, paymentMethod }) {
    const router = useRouter()
    const dispatch = useDispatch()
    const [step, setStep] = useState('auth') // auth, courier, success
    const [isLogin, setIsLogin] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)

    if (!isOpen) return null

    const handleAuth = (e) => {
        e.preventDefault()
        setIsProcessing(true)
        dispatch(showLoader(isLogin ? "Signing you in..." : "Creating your account..."))

        setTimeout(() => {
            dispatch(hideLoader())
            setIsProcessing(false)
            toast.success(isLogin ? "Welcome back!" : "Account created successfully!")
            setStep('courier')
        }, 1500)
    }

    const completeCheckout = (deliveryType) => {
        const orderId = "ORD-" + Math.floor(1000 + Math.random() * 9000)
        const deliveryCode = Math.floor(100000 + Math.random() * 900000)

        const orderData = {
            id: orderId,
            product: product.name,
            total: product.price,
            method: paymentMethod,
            deliveryType: deliveryType,
            code: deliveryCode,
            status: 'Confirmed',
            date: new Date().toLocaleDateString()
        }

        localStorage.setItem('active_order', JSON.stringify(orderData))
        dispatch(hideLoader())
        setStep('success')

        setTimeout(() => {
            onClose()
            router.push(`/buyer/track/${orderId}`)
        }, 3000)
    }

    const handleFinalize = (deliveryType) => {
        const steps = [
            "Confirming order...",
            paymentMethod === 'Pay Now' ? "Processing payment (Demo)..." : "Registering cash delivery...",
            "Finalizing order..."
        ]

        dispatch(setLoadingSteps(steps))

        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            if (currentStep < steps.length) {
                dispatch(nextLoadingStep())
            } else {
                clearInterval(interval)
                completeCheckout(deliveryType)
            }
        }, 1200)
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="p-8 pb-0 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[#05DF72]">
                        <ShieldCheckIcon size={24} />
                        <span className="font-bold uppercase tracking-widest text-[10px]">Secure Checkout</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <XIcon size={20} className="text-slate-400" />
                    </button>
                </div>

                {step === 'auth' && (
                    <div className="p-8 pt-6">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </h2>
                        <p className="text-slate-500 mb-8 text-sm font-medium">Please authenticate to secure your battery order.</p>

                        <form className="space-y-4" onSubmit={handleAuth}>
                            {!isLogin && (
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input required type="text" placeholder="Full Name" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20" />
                                </div>
                            )}
                            <div className="relative">
                                <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input required type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20" />
                            </div>
                            <div className="relative">
                                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input required type="password" placeholder="Password" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20" />
                            </div>

                            <Button
                                type="submit"
                                loading={isProcessing}
                                loadingText={isLogin ? "Signing in..." : "Creating..."}
                                className="w-full !py-5 shadow-xl shadow-[#05DF72]/20 mt-4"
                            >
                                {isLogin ? 'Sign In & Continue' : 'Create Account'}
                            </Button>
                        </form>

                        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button onClick={() => setIsLogin(!isLogin)} className="text-[#05DF72] ml-2 font-bold hover:underline">
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    </div>
                )}

                {step === 'courier' && (
                    <div className="p-8 pt-6">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Fulfillment</h2>
                        <p className="text-slate-500 mb-8 text-sm font-medium">How would you like to receive your battery?</p>

                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => handleFinalize('Pickup')}
                                className="flex items-center gap-6 p-6 border-2 border-slate-100 rounded-3xl hover:border-[#05DF72] hover:bg-[#05DF72]/5 transition-all text-left"
                            >
                                <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                                    <UserIcon size={28} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Pickup at Seller Location</p>
                                    <p className="text-xs text-slate-500 mt-1">Free • Save on delivery costs</p>
                                </div>
                            </button>

                            <button
                                onClick={() => handleFinalize('Delivery')}
                                className="flex items-center gap-6 p-6 border-2 border-slate-100 rounded-3xl hover:border-[#05DF72] hover:bg-[#05DF72]/5 transition-all text-left"
                            >
                                <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shrink-0">
                                    <TruckIcon size={28} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Request GoCycle Delivery</p>
                                    <p className="text-xs text-slate-500 mt-1">₦2,500 • Secured with delivery code</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {step === 'success' && (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-[#05DF72] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#05DF72]/40 animate-bounce">
                            <ShieldCheckIcon size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Order Secured!</h2>
                        <p className="text-slate-500 font-medium">Your {paymentMethod === 'Pay Now' ? 'payment' : 'request'} was successful. Redirecting to tracking...</p>
                        <div className="mt-8 flex justify-center gap-1">
                            <div className="w-2 h-2 bg-[#05DF72] rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-[#05DF72] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-[#05DF72] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
