'use client'
import { useState } from "react"
import { XIcon, WalletIcon, CheckCircleIcon, CopyIcon, CalendarIcon, MapPinIcon, LoaderIcon, AlertCircleIcon, ShieldCheckIcon } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"
import Button from "./Button"
import { mockOrderService, mockPaymentService, mockNotificationService } from "@/lib/mockService"
import { createOrder, verifyOrderCollection } from "@/backend/actions/order"

/**
 * CheckoutModal - Demo payment flow for battery purchase
 * 
 * Flow:
 * 1. Order Summary
 * 2. Mock Payment Processing
 * 3. Success with Collection Token
 * 
 * No Pay on Delivery - Pay Now only as per requirements
 */
export default function CheckoutModal({ isOpen, onClose, product, quantity = 1, selectedDate }) {
    const router = useRouter()
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)

    const [step, setStep] = useState('SUMMARY') // SUMMARY | PROCESSING | SUCCESS | FAILED
    const [isLoading, setIsLoading] = useState(false)
    const [orderResult, setOrderResult] = useState(null)
    const [verifyToken, setVerifyToken] = useState('')
    const [verifying, setVerifying] = useState(false)

    if (!isOpen) return null

    const currency = '₦'
    const totalAmount = (product?.price || 0) * quantity

    const handlePayNow = async () => {
        setIsLoading(true)
        setStep('PROCESSING')

        try {
            // Step 1: Simulate payment
            const paymentResult = await mockPaymentService.initiatePayment({
                amount: totalAmount,
                productId: product.id,
                buyerId: user?.id
            })

            if (!paymentResult.success) {
                setStep('FAILED')
                setIsLoading(false)
                return
            }


            // Step 2: Create order with collection token (REAL ACTION)
            const result = await createOrder({
                buyerId: user?.id,
                sellerId: product.sellerId || product.userId || product.store?.userId,
                productId: product.id,
                quantity,
                totalAmount,
                collectionDate: selectedDate,
                paymentReference: paymentResult.reference
            })

            if (result.success) {
                setOrderResult({
                    ...result.order,
                    collectionToken: result.collectionToken
                })
                setStep('SUCCESS')
            } else {
                toast.error(result.error || "Failed to create order")
                setStep('FAILED')
            }
        } catch (error) {
            console.error(error)
            setStep('FAILED')
        }

        setIsLoading(false)
    }

    const handleVerifyCollection = async (e) => {
        e.preventDefault()
        if (!verifyToken || verifyToken.length < 6) return

        setVerifying(true)
        try {
            const res = await verifyOrderCollection(orderResult.id, verifyToken)
            if (res.success) {
                toast.success("Pickup verified successfully!")
                router.push('/buyer') // Redirect to orders after verification
            } else {
                toast.error(res.error || "Invalid code")
            }
        } catch (error) {
            toast.error("Verification failed")
        }
        setVerifying(false)
    }

    const handleClose = () => {
        if (step === 'SUCCESS') {
            router.push('/buyer')
        }
        onClose()
        setStep('SUMMARY')
        setOrderResult(null)
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Not selected'
        return new Date(dateStr).toLocaleDateString('en-NG', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass rounded-[3rem] w-full max-w-lg shadow-glass border border-white/40 overflow-hidden animate-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="bg-slate-900/90 p-8 text-white relative border-b border-white/10">
                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/10"
                    >
                        <XIcon size={18} />
                    </button>
                    <div className="flex items-center gap-2 text-emerald-400 mb-3 font-black uppercase tracking-[0.2em] text-[10px]">
                        <WalletIcon size={14} />
                        {step === 'SUMMARY' && 'Secure Checkout'}
                        {step === 'PROCESSING' && 'Authenticating Transaction'}
                        {step === 'SUCCESS' && 'Verified Payment'}
                        {step === 'FAILED' && 'Transaction Error'}
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">
                        {step === 'SUMMARY' && 'Confirm Order'}
                        {step === 'PROCESSING' && 'Processing...'}
                        {step === 'SUCCESS' && 'Order Secured!'}
                        {step === 'FAILED' && 'Payment Failed'}
                    </h2>
                </div>

                {/* Content */}
                <div className="p-8 sm:p-10 bg-white/60">

                    {/* STEP 1: Order Summary */}
                    {step === 'SUMMARY' && (
                        <div className="space-y-8">
                            {/* Product Info */}
                            <div className="flex gap-6 p-6 bg-white/80 rounded-[2rem] border border-white/60 shadow-sm relative group">
                                <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                                    🔋
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Item Details</p>
                                    <h3 className="font-black text-slate-900 text-lg leading-tight">{product?.name}</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-1">{product?.batteryType} • {product?.condition}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-sm font-black text-slate-900">{currency}{product?.price?.toLocaleString()}</span>
                                        <span className="text-[10px] font-bold text-slate-300">× {quantity}</span>
                                    </div>
                                </div>
                                <div className="absolute top-6 right-6 text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity">
                                    <CheckCircleIcon size={20} />
                                </div>
                            </div>

                            {/* Collection Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-5 bg-white/40 rounded-3xl border border-white/40 flex items-start gap-4">
                                    <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                                        <CalendarIcon size={16} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pickup Date</p>
                                        <p className="font-black text-slate-900 text-xs">{formatDate(selectedDate)}</p>
                                    </div>
                                </div>
                                <div className="p-5 bg-white/40 rounded-3xl border border-white/40 flex items-start gap-4">
                                    <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                                        <MapPinIcon size={16} className="text-emerald-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                        <p className="font-black text-slate-900 text-xs truncate">{product?.lga}, Lagos</p>
                                        <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{product?.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Total Bill */}
                            <div className="flex items-center justify-between p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Total Payable</p>
                                    <span className="text-3xl font-black">{currency}{totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="p-4 bg-emerald-500 rounded-3xl relative z-10 rotate-3 shadow-lg shadow-emerald-500/20">
                                    <WalletIcon size={24} className="text-white" />
                                </div>
                                {/* Decorative Blur */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                            </div>

                            {/* Pay Button */}
                            <Button
                                onClick={handlePayNow}
                                loading={isLoading}
                                loadingText="ENCRYPTING..."
                                className="w-full !py-6 !rounded-[2rem] shadow-2xl shadow-emerald-500/20 text-sm font-black tracking-widest uppercase"
                            >
                                <ShieldCheckIcon size={18} className="mr-2" />
                                Pay {currency}{totalAmount.toLocaleString()} Securely
                            </Button>

                            <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-[0.1em] opacity-60">
                                Encrypted by GoCycle Pay • ESCROW PROTECTION ENABLED
                            </p>
                        </div>
                    )}

                    {/* STEP 2: Processing */}
                    {step === 'PROCESSING' && (
                        <div className="py-16 text-center space-y-8 animate-in fade-in zoom-in-95">
                            <div className="relative inline-block">
                                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center animate-pulse">
                                    <LoaderIcon className="text-emerald-500 animate-spin" size={48} />
                                </div>
                                <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping"></div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Securing Your Transaction</h3>
                                <p className="text-sm text-slate-400 font-medium max-w-[240px] mx-auto">Connecting to bank authentication servers...</p>
                            </div>
                            <div className="flex flex-col items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                <span className="flex items-center gap-2"><CheckCircleIcon size={12} className="text-emerald-400" /> Validating order details</span>
                                <span className="flex items-center gap-2"><CheckCircleIcon size={12} className="text-emerald-400" /> Secure gateway handshake</span>
                                <span className="flex items-center gap-2 animate-pulse"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> Minting collection token</span>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Success */}
                    {step === 'SUCCESS' && orderResult && (
                        <div className="py-10 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                            <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 rotate-6 animate-float">
                                <CheckCircleIcon className="text-white" size={48} />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Order Confirmed!</h3>
                                <p className="text-sm text-slate-400 font-medium">Funds held in escrow for your security.</p>
                            </div>

                            {/* Verification Input Section */}
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white text-left relative overflow-hidden shadow-2xl">
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-black tracking-tight">Final Step: Verify Pickup</h3>
                                        <span className="bg-emerald-500 text-white text-[9px] uppercase font-black px-3 py-1.2 rounded-full tracking-[0.1em] shadow-lg shadow-emerald-500/20">Action Required</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-6 font-medium leading-relaxed">
                                        Once you arrive at the pickup location, ask the seller for the <span className="text-emerald-400 font-black">6-digit pickup code</span> to release funds.
                                    </p>

                                    <form onSubmit={handleVerifyCollection} className="flex gap-3">
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="ENTER CODE"
                                            className="flex-1 bg-white/10 border-2 border-white/10 rounded-2xl px-6 py-4 text-center font-black tracking-[0.3em] text-xl text-white placeholder:text-white/20 focus:border-emerald-500 focus:bg-white/15 outline-none uppercase transition-all"
                                            value={verifyToken}
                                            onChange={(e) => setVerifyToken(e.target.value.replace(/[^0-9]/g, ''))}
                                        />
                                        <button
                                            type="submit"
                                            disabled={verifying || verifyToken.length < 6}
                                            className="bg-emerald-500 text-white px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/20"
                                        >
                                            {verifying ? <LoaderIcon className="animate-spin" /> : "Verify"}
                                        </button>
                                    </form>
                                </div>
                                {/* Decorative Blur */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <Button onClick={handleClose} className="w-full !py-5 !rounded-2xl !bg-slate-100 !text-slate-900 hover:!bg-slate-200 shadow-none text-xs font-black uppercase tracking-widest">
                                    Manage My Orders
                                </Button>
                                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    <ShieldCheckIcon size={12} /> Transaction ID: {orderResult.id.slice(0, 12)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Failed */}
                    {step === 'FAILED' && (
                        <div className="py-16 text-center space-y-8 animate-in fade-in zoom-in-95">
                            <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto rotate-12 bg-red-50">
                                <AlertCircleIcon className="text-red-500" size={48} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Payment Declined</h3>
                                <p className="text-sm text-slate-400 font-medium max-w-[260px] mx-auto">
                                    We couldn't process this transaction. Please check your balance or try again.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 py-5 bg-white text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 border-slate-100 hover:bg-slate-50 transition-all"
                                >
                                    Cancel Order
                                </button>
                                <Button
                                    onClick={() => setStep('SUMMARY')}
                                    className="flex-1 !py-5 !rounded-2xl !bg-slate-900"
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
