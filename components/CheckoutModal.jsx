'use client'
import { useState, useEffect, useCallback } from "react"
import { X as XIcon, Wallet as WalletIcon, CheckCircle as CheckCircleIcon, Calendar as CalendarIcon, Loader as LoaderIcon, AlertCircle as AlertCircleIcon, ShieldCheck as ShieldCheckIcon, CreditCard as CreditCardIcon, Building2 as BankIcon, Zap as ZapIcon, Clock as ClockIcon } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"
import Button from "./Button"
import { createOrder } from "@/backend-actions/actions/order"

/**
 * CheckoutModal - Payment flow for battery purchase
 * 
 * Flow:
 * 1. Order Summary
 * 2. Payment Method Selection (Flutterwave or Manual Transfer)
 * 3a. Flutterwave Inline Popup → Auto-verify → Success
 * 3b. Manual Transfer Details → Submit → Pending Verification
 * 4. Success / Failed
 */
export default function CheckoutModal({ isOpen, onClose, product, quantity = 1, selectedDate }) {
    const router = useRouter()
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)

    const [step, setStep] = useState('SUMMARY')
    // SUMMARY | PAYMENT_METHOD | PAYMENT_DETAILS | PROCESSING | SUCCESS | FAILED
    const [isLoading, setIsLoading] = useState(false)
    const [orderResult, setOrderResult] = useState(null)
    const [senderName, setSenderName] = useState('')
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('FLUTTERWAVE')

    useEffect(() => {
        if (isOpen) {
            const script = document.createElement('script')
            script.src = 'https://checkout.flutterwave.com/v3.js'
            script.async = true
            document.body.appendChild(script)
            return () => {
                const existingScript = document.querySelector('script[src="https://checkout.flutterwave.com/v3.js"]')
                if (existingScript && existingScript.parentNode) {
                    existingScript.parentNode.removeChild(existingScript)
                }
            }
        }
    }, [isOpen])

    if (!isOpen) return null

    const currency = '₦'
    const subtotal = (product?.price || 0) * quantity
    const platformFee = subtotal * 0.05
    const totalAmount = subtotal + platformFee

    const handleSelectPaymentMethod = () => {
        setStep('PAYMENT_METHOD')
    }

    const handleFlutterwavePayment = async () => {
        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
            toast.error("Administrators are not permitted to make purchases.")
            return
        }

        setIsLoading(true)
        setStep('PROCESSING')

        try {
            // 1. Create order with FLUTTERWAVE method
            const result = await createOrder({
                buyerId: user?.id,
                sellerId: product.sellerId || product.userId || product.store?.userId,
                productId: product.id,
                quantity,
                subtotal,
                buyerFee: platformFee,
                totalAmount,
                collectionDate: selectedDate,
                paymentMethod: 'FLUTTERWAVE'
            })

            if (!result.success) {
                toast.error(result.error || "Failed to create order")
                setStep('FAILED')
                setIsLoading(false)
                return
            }

            const order = result.data || result.order
            const txRef = order.paymentReference

            if (!txRef) {
                toast.error("Payment reference missing")
                setStep('FAILED')
                setIsLoading(false)
                return
            }

            // 2. Launch Flutterwave inline popup
            if (!window.FlutterwaveCheckout) {
                toast.error("Payment gateway is loading. Please try again.")
                setStep('PAYMENT_METHOD')
                setIsLoading(false)
                return
            }

            setIsLoading(false) // Popup handles its own loading

            try {
                // Diagnostic check for Live/Vercel
                if (typeof window.FlutterwaveCheckout !== 'function') {
                    console.error('[Flutterwave] SDK not found on window object')
                    throw new Error("Payment gateway is taking too long to load. Please refresh.")
                }

                const publicKey = process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY
                if (!publicKey || publicKey === 'undefined') {
                    console.error('[Flutterwave] NEXT_PUBLIC_FLW_PUBLIC_KEY is missing or undefined.')
                    throw new Error("Payment setup is incomplete. Admin needs to check Vercel environment variables.")
                }

                console.log('[Flutterwave] Launching with Key:', publicKey.substring(0, 15) + '...')

                const flwModal = window.FlutterwaveCheckout({
                    public_key: publicKey,
                    tx_ref: txRef,
                    amount: totalAmount,
                    currency: 'NGN',
                    payment_options: 'card,banktransfer,ussd',
                    customer: {
                        email: user?.email || 'buyer@gocycle.ng',
                        phone_number: user?.phone || '',
                        name: user?.name || 'GoCycle Buyer'
                    },
                    customizations: {
                        title: 'GoCycle Battery Purchase',
                        description: `Payment for ${product?.name || 'Battery'}`,
                        logo: 'https://gocycle.ng/favicon.ico'
                    },
                    callback: async (response) => {
                        console.log('[Flutterwave] Callback received:', response)
                        setStep('PROCESSING')
                        setIsLoading(true)

                        try {
                            const verifyRes = await fetch('/api/flutterwave/verify', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    transaction_id: response.transaction_id,
                                    tx_ref: txRef
                                })
                            })

                            const verifyData = await verifyRes.json()

                            if (verifyData.success) {
                                setOrderResult({
                                    ...order,
                                    ...verifyData.order,
                                    collectionToken: order.collectionToken || verifyData.order?.collectionToken,
                                    paymentMethod: 'FLUTTERWAVE'
                                })
                                
                                if (flwModal && typeof flwModal.close === 'function') {
                                    flwModal.close()
                                }

                                // Mark as bought locally (for instant UI update in demo mode)
                                try {
                                    const bought = JSON.parse(localStorage.getItem('gocycle_bought_products') || '[]')
                                    if (!bought.includes(product.id)) {
                                        bought.push(product.id)
                                        localStorage.setItem('gocycle_bought_products', JSON.stringify(bought))
                                    }
                                } catch (e) {}
                                
                                setStep('SUCCESS')
                            } else {
                                toast.error(verifyData.message || "Payment verification failed")
                                setStep('FAILED')
                            }
                        } catch (err) {
                            console.error('[Flutterwave] Verify error:', err)
                            toast.error("Verification failed. Contact support if debited.")
                            setStep('FAILED')
                        }

                        setIsLoading(false)
                    },
                    onclose: () => {
                        console.log('[Flutterwave] Popup closed by user')
                        if (step === 'PROCESSING' || step === 'SUCCESS') return 
                        setStep('PAYMENT_METHOD')
                    }
                })
            } catch (err) {
                console.error('[Flutterwave] Launcher Error:', err.message)
                toast.error(err.message)
                setStep('PAYMENT_METHOD')
                setIsLoading(false)
            }

        } catch (error) {
            console.error('[Checkout] Flutterwave error:', error)
            toast.error("Payment initialization failed")
            setStep('FAILED')
            setIsLoading(false)
        }
    }

    const handleSubmitManualTransfer = async () => {
        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
            toast.error("Administrators are not permitted to make purchases.")
            return
        }

        if (!senderName.trim()) {
            toast.error("Please enter the sender's account name")
            return
        }

        setIsLoading(true)
        setStep('PROCESSING')

        try {
            const result = await createOrder({
                buyerId: user?.id,
                sellerId: product.sellerId || product.userId || product.store?.userId,
                productId: product.id,
                quantity,
                subtotal,
                buyerFee: platformFee,
                totalAmount,
                collectionDate: selectedDate,
                paymentSenderName: senderName,
                paymentMethod: 'MANUAL_TRANSFER'
            })

            if (result.success) {
                const order = result.data || result.order
                setOrderResult({
                    ...order,
                    collectionToken: order.collectionToken,
                    paymentMethod: 'MANUAL_TRANSFER'
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
        setSenderName('')
        setSelectedPaymentMethod('FLUTTERWAVE')
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
                        {step === 'PAYMENT_METHOD' && 'Choose Payment'}
                        {step === 'PAYMENT_DETAILS' && 'Make Payment'}
                        {step === 'PROCESSING' && 'Authenticating Transaction'}
                        {step === 'SUCCESS' && (orderResult?.paymentMethod === 'FLUTTERWAVE' ? 'Payment Confirmed' : 'Order Received')}
                        {step === 'FAILED' && 'Transaction Error'}
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black tracking-tight">
                        {step === 'SUMMARY' && 'Confirm Order'}
                        {step === 'PAYMENT_METHOD' && 'How Would You Like to Pay?'}
                        {step === 'PAYMENT_DETAILS' && 'Bank Transfer'}
                        {step === 'PROCESSING' && 'Processing...'}
                        {step === 'SUCCESS' && (orderResult?.paymentMethod === 'FLUTTERWAVE' ? 'Payment Successful!' : 'Pending Verification')}
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
                                onClick={() => {
                                    setStep('PAYMENT_METHOD')
                                }}
                                loading={isLoading}
                                className="w-full !py-4 sm:!py-6 !rounded-[1.5rem] sm:!rounded-[2rem] shadow-2xl shadow-emerald-500/20 text-xs sm:text-sm font-black tracking-widest uppercase"
                            >
                                <ShieldCheckIcon size={18} className="mr-2" />
                                Proceed to Payment Methods
                            </Button>

                            <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-[0.1em] opacity-60">
                                ESCROW PROTECTION ENABLED
                            </p>
                        </div>
                    )}

                    {/* STEP 2: Payment Method Selection */}
                    {step === 'PAYMENT_METHOD' && (
                        <div className="space-y-6">
                            <p className="text-xs text-slate-500 font-medium text-center">
                                Select your preferred payment method for <span className="font-black text-slate-900">{currency}{totalAmount.toLocaleString()}</span>
                            </p>

                            {/* Flutterwave Card Option */}
                            <button
                                onClick={() => setSelectedPaymentMethod('FLUTTERWAVE')}
                                className={`w-full p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] text-left transition-all duration-300 border-2 relative overflow-hidden group ${
                                    selectedPaymentMethod === 'FLUTTERWAVE'
                                        ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl shadow-emerald-500/10'
                                        : 'border-slate-100 bg-white/80 hover:border-emerald-200'
                                }`}
                            >
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className={`p-3 rounded-2xl transition-all ${
                                        selectedPaymentMethod === 'FLUTTERWAVE'
                                            ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                                            : 'bg-slate-100'
                                    }`}>
                                        <CreditCardIcon size={20} className={selectedPaymentMethod === 'FLUTTERWAVE' ? 'text-white' : 'text-slate-400'} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-black text-slate-900 text-sm">Debit Card / USSD / Bank Transfer</h3>
                                            <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Instant</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            Secured by Flutterwave • Auto Verified
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                                            Pay instantly using your card, bank account, or USSD code. Payment is verified automatically.
                                        </p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${
                                        selectedPaymentMethod === 'FLUTTERWAVE'
                                            ? 'border-emerald-500 bg-emerald-500'
                                            : 'border-slate-300'
                                    }`}>
                                        {selectedPaymentMethod === 'FLUTTERWAVE' && (
                                            <CheckCircleIcon size={12} className="text-white" />
                                        )}
                                    </div>
                                </div>
                            </button>

                            {/* Manual Transfer Option */}
                            <button
                                onClick={() => setSelectedPaymentMethod('MANUAL_TRANSFER')}
                                className={`w-full p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] text-left transition-all duration-300 border-2 relative overflow-hidden group ${
                                    selectedPaymentMethod === 'MANUAL_TRANSFER'
                                        ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl shadow-amber-500/10'
                                        : 'border-slate-100 bg-white/80 hover:border-amber-200'
                                }`}
                            >
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className={`p-3 rounded-2xl transition-all ${
                                        selectedPaymentMethod === 'MANUAL_TRANSFER'
                                            ? 'bg-amber-500 shadow-lg shadow-amber-500/30'
                                            : 'bg-slate-100'
                                    }`}>
                                        <BankIcon size={20} className={selectedPaymentMethod === 'MANUAL_TRANSFER' ? 'text-white' : 'text-slate-400'} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-black text-slate-900 text-sm">Manual Bank Transfer</h3>
                                            <span className="bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">1-24hrs</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            Direct Bank Transfer • Admin Verified
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                                            Transfer to our bank account. Payment is verified manually by our finance team within 1-24 hours.
                                        </p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${
                                        selectedPaymentMethod === 'MANUAL_TRANSFER'
                                            ? 'border-amber-500 bg-amber-500'
                                            : 'border-slate-300'
                                    }`}>
                                        {selectedPaymentMethod === 'MANUAL_TRANSFER' && (
                                            <CheckCircleIcon size={12} className="text-white" />
                                        )}
                                    </div>
                                </div>
                            </button>

                            {/* Continue Button */}
                            <Button
                                onClick={() => {
                                    if (selectedPaymentMethod === 'FLUTTERWAVE') {
                                        handleFlutterwavePayment()
                                    } else {
                                        setStep('PAYMENT_DETAILS')
                                    }
                                }}
                                loading={isLoading}
                                className="w-full !py-4 sm:!py-6 !rounded-[1.5rem] sm:!rounded-[2rem] shadow-2xl shadow-emerald-500/20 text-xs sm:text-sm font-black tracking-widest uppercase"
                            >
                                <ZapIcon size={18} className="mr-2" />
                                {selectedPaymentMethod === 'FLUTTERWAVE' ? 'Pay Now with Flutterwave' : 'Continue to Transfer Details'}
                            </Button>

                            <button
                                onClick={() => setStep('SUMMARY')}
                                className="w-full text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-slate-600 transition-colors py-2"
                            >
                                ← Back to Order Summary
                            </button>
                        </div>
                    )}

                    {/* STEP 3: Bank Transfer Details (Manual only) */}
                    {step === 'PAYMENT_DETAILS' && (
                        <div className="space-y-6">
                            <div className="p-5 sm:p-8 bg-slate-900 rounded-3xl border border-slate-800 space-y-6 relative overflow-hidden text-white shadow-xl shadow-slate-900/20">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full"></div>
                                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest relative z-10 text-center">Transfer Details</h3>
                                <p className="text-xs text-slate-400 text-center relative z-10 leading-relaxed">
                                    Please transfer exactly <span className="font-black text-white text-base">{currency}{totalAmount.toLocaleString()}</span> to the account below to secure this order.
                                </p>
                                
                                <div className="bg-white/10 p-5 rounded-2xl border border-white/10 relative z-10 backdrop-blur-md">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bank Name</span>
                                        <span className="text-sm font-black">Sterling Bank</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Account Number</span>
                                        <span className="text-lg font-mono font-black text-white tracking-widest flex items-center gap-2">
                                            0143633968
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Account Name</span>
                                        <span className="text-sm font-black text-emerald-400">Go Cycle Limited</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 p-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sender Account Name</label>
                                <input
                                    type="text"
                                    value={senderName}
                                    onChange={(e) => setSenderName(e.target.value)}
                                    placeholder="E.g. John Doe"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                    disabled={isLoading}
                                />
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Ensure this name matches the account you transfer from. Our admins will verify this payment manually.</p>
                            </div>

                            <Button
                                onClick={handleSubmitManualTransfer}
                                loading={isLoading}
                                className="w-full !py-4 sm:!py-5 !rounded-2xl shadow-2xl shadow-emerald-500/20 text-sm font-black tracking-widest uppercase mt-4"
                            >
                                I Have Transferred The Funds
                            </Button>

                            <button
                                onClick={() => setStep('PAYMENT_METHOD')}
                                className="w-full text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-slate-600 transition-colors py-2"
                            >
                                ← Change Payment Method
                            </button>
                        </div>
                    )}

                    {/* STEP 4: Processing */}
                    {step === 'PROCESSING' && (
                        <div className="py-16 text-center space-y-8 animate-in fade-in zoom-in-95">
                            <div className="relative inline-block">
                                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center animate-pulse">
                                    <LoaderIcon className="text-emerald-500 animate-spin" size={48} />
                                </div>
                                <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping"></div>
                            </div>
                            {selectedPaymentMethod === 'MANUAL_TRANSFER' ? (
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Processing Manual Transfer</h3>
                                    <p className="text-sm text-slate-400 font-medium max-w-[240px] mx-auto">Submitting your order details...</p>
                                    <div className="flex flex-col items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                        <span className="flex items-center gap-2"><CheckCircleIcon size={12} className="text-emerald-400" /> Awaiting admin verification</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Securing Your Transaction</h3>
                                    <p className="text-sm text-slate-400 font-medium max-w-[240px] mx-auto">Connecting to payment gateway...</p>
                                    <div className="flex flex-col items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                        <span className="flex items-center gap-2"><CheckCircleIcon size={12} className="text-emerald-400" /> Validating order details</span>
                                        <span className="flex items-center gap-2"><CheckCircleIcon size={12} className="text-emerald-400" /> Secure gateway handshake</span>
                                        <span className="flex items-center gap-2 animate-pulse"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> Awaiting payment confirmation</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 5: Success */}
                    {step === 'SUCCESS' && orderResult && (
                        <div className="py-10 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                            {orderResult.paymentMethod === 'FLUTTERWAVE' ? (
                                <>
                                    {/* Flutterwave Success — Instant Confirmation */}
                                    <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 rotate-6">
                                        <CheckCircleIcon className="text-white" size={48} />
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Payment Confirmed!</h3>
                                        <p className="text-sm text-slate-400 font-medium">Your order has been paid and confirmed.</p>
                                    </div>

                                    {/* E-Receipt */}
                                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 space-y-5 text-left relative overflow-hidden shadow-inner">
                                        <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] text-slate-900">
                                            <ShieldCheckIcon size={160} />
                                        </div>
                                        <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Electronic Receipt</p>
                                                <h4 className="text-sm font-black text-slate-900">Go-Cycle Marketplace</h4>
                                            </div>
                                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                                                Paid
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-3.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">Transaction Ref</span>
                                                <span className="text-[11px] font-mono font-black text-slate-900">{orderResult?.paymentReference || orderResult?.id?.slice(0, 12)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">Amount Paid</span>
                                                <span className="text-[11px] font-black text-slate-900">₦{totalAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">Payment Method</span>
                                                <span className="text-[11px] font-black text-slate-900 flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    FLW / {orderResult.paymentMethod || 'Instant'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">Date & Time</span>
                                                <span className="text-[11px] font-black text-slate-900 uppercase">
                                                    {new Date().toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-200/60 flex items-center justify-center gap-2">
                                            <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                            <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                            <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 text-left flex items-start gap-4 shadow-sm">
                                        <div className="p-2.5 bg-emerald-500 rounded-xl shrink-0 shadow-lg shadow-emerald-500/20">
                                            <ZapIcon size={16} className="text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Order Processing</p>
                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                                The seller has been notified of your payment. Please proceed to <span className="font-bold text-slate-900">{orderResult?.store?.address || product?.pickupAddress || "the collection point"}</span> on the scheduled date. A detailed receipt has been sent to your email.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Manual Transfer Success — Pending Verification */}
                                    <div className="w-24 h-24 bg-amber-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/20 rotate-6">
                                        <WalletIcon className="text-white" size={48} />
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Verification Pending</h3>
                                        <p className="text-sm text-slate-400 font-medium">We have received your order details.</p>
                                    </div>

                                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-start gap-4">
                                        <AlertCircleIcon size={20} className="text-orange-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">Awaiting Admin Approval</p>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                Your bank transfer is being reviewed by our finance team. Once verified, the seller's pickup address and your collection code will be unlocked. This usually takes 1-24 hours.
                                            </p>
                                            <p className="text-xs text-slate-500 font-medium mt-2">
                                                <span className="font-bold text-slate-900">Pickup Address:</span> Address will be revealed after verification
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-left flex items-start gap-4">
                                        <div className="p-2.5 bg-slate-300 rounded-xl shrink-0">
                                            <ClockIcon size={16} className="text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">What Happens Next?</p>
                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                                Once our finance team verifies your transfer, you will receive an email with the seller's pickup address and your verification code. This usually takes 1-24 hours.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="grid grid-cols-1 gap-3">
                                <Button onClick={handleClose} className="w-full !py-5 !rounded-2xl shadow-none text-xs font-black uppercase tracking-widest">
                                    Go to My Orders
                                </Button>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    <ShieldCheckIcon size={12} /> Ref: {orderResult?.id?.slice(0, 12) || orderResult?.transactionId || 'N/A'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* STEP 6: Failed */}
                    {step === 'FAILED' && (
                        <div className="py-16 text-center space-y-8 animate-in fade-in zoom-in-95">
                            <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto rotate-12">
                                <AlertCircleIcon className="text-red-500" size={48} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Payment Failed</h3>
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
                                    onClick={() => setStep('PAYMENT_METHOD')}
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
