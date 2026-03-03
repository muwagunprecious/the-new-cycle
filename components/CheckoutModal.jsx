'use client'
import { useState } from "react"
import { X as XIcon, Wallet as WalletIcon, CheckCircle as CheckCircleIcon, Copy as CopyIcon, Calendar as CalendarIcon, MapPin as MapPinIcon, Loader as LoaderIcon, AlertCircle as AlertCircleIcon, ShieldCheck as ShieldCheckIcon } from "lucide-react"
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

    if (!isOpen) return null

    const currency = '₦'
    const subtotal = (product?.price || 0) * quantity
    const platformFee = subtotal * 0.05
    const totalAmount = subtotal + platformFee

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
                subtotal,
                buyerFee: platformFee,
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
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass rounded-t-[2rem] sm:rounded-[3rem] w-full max-w-lg shadow-glass border border-white/40 overflow-hidden animate-in zoom-in-95 duration-500 max-h-[95vh] sm:max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="bg-slate-900/90 p-5 sm:p-8 text-white relative border-b border-white/10">
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
                    <h2 className="text-xl sm:text-3xl font-black tracking-tight">
                        {step === 'SUMMARY' && 'Confirm Order'}
                        {step === 'PROCESSING' && 'Processing...'}
                        {step === 'SUCCESS' && 'Order Secured!'}
                        {step === 'FAILED' && 'Payment Failed'}
                    </h2>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-8 md:p-10 bg-white/60 overflow-y-auto flex-1">

                    {/* STEP 1: Order Summary */}
                    {step === 'SUMMARY' && (
                        <div className="space-y-8">
                            {/* Product Info */}
                            <div className="flex gap-4 sm:gap-6 p-4 sm:p-6 bg-white/80 rounded-[1.5rem] sm:rounded-[2rem] border border-white/60 shadow-sm relative group">
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

                            {/* Collection Date */}
                            <div className="p-5 bg-white/40 rounded-3xl border border-white/40 flex items-start gap-4">
                                <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                                    <CalendarIcon size={16} className="text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pickup Date</p>
                                    <p className="font-black text-slate-900 text-xs">{formatDate(selectedDate)}</p>
                                </div>
                            </div>

                            {/* Total Bill */}
                            <div className="p-4 sm:p-6 bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden space-y-3 sm:space-y-4">
                                <div className="relative z-10 flex justify-between items-center text-slate-300 font-medium text-sm">
                                    <span>Item Subtotal</span>
                                    <span>{currency}{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="relative z-10 flex justify-between items-center text-slate-300 font-medium text-sm pb-4 border-b border-white/10">
                                    <span className="flex items-center gap-2">Platform Fee (5%) <span className="p-1 min-w-[16px] h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[8px]">+</span></span>
                                    <span className="text-emerald-400">{currency}{platformFee.toLocaleString()}</span>
                                </div>
                                <div className="relative z-10 flex items-center justify-between pt-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total Payable</p>
                                    <span className="text-2xl sm:text-3xl font-black">{currency}{totalAmount.toLocaleString()}</span>
                                </div>

                                <div className="absolute -top-4 -right-4 p-4 bg-emerald-500 rounded-3xl z-10 rotate-12 shadow-lg shadow-emerald-500/20 opacity-50">
                                    <span className="text-white text-3xl">🔋</span>
                                </div>
                                {/* Decorative Blur */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                            </div>

                            {/* Pay Button */}
                            <Button
                                onClick={handlePayNow}
                                loading={isLoading}
                                loadingText="ENCRYPTING..."
                                className="w-full !py-4 sm:!py-6 !rounded-[1.5rem] sm:!rounded-[2rem] shadow-2xl shadow-emerald-500/20 text-xs sm:text-sm font-black tracking-widest uppercase"
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
                            <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 rotate-6">
                                <CheckCircleIcon className="text-white" size={48} />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Order Confirmed!</h3>
                                <p className="text-sm text-slate-400 font-medium">Funds are held securely in escrow.</p>
                            </div>

                            {/* Info banner */}
                            <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-6 text-left flex items-start gap-4">
                                <div className="p-2.5 bg-emerald-500 rounded-xl shrink-0">
                                    <ShieldCheckIcon size={16} className="text-white" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">What happens next?</p>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        Your order has been recorded. You can track your purchase and access the <span className="font-black text-emerald-600">Verification Steps</span> directly from your buyer dashboard.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <Button onClick={handleClose} className="w-full !py-5 !rounded-2xl shadow-none text-xs font-black uppercase tracking-widest">
                                    Go to My Orders
                                </Button>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    <ShieldCheckIcon size={12} /> Ref: {orderResult?.id?.slice(0, 12) || 'N/A'}
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
