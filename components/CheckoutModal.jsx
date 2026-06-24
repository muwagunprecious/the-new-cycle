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
 * 3a. Flutterwave VP4 → Server creates payment link → Browser redirects to hosted checkout → Callback page verifies
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

    // VP4: No inline script needed — payment is server-initiated via /api/flutterwave/initiate

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
            // 1. Create the order in the database
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

            // 2. VP4: Ask server to create a hosted payment link
            const initiateRes = await fetch('/api/flutterwave/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.id,
                    amount: totalAmount,
                    currency: 'NGN',
                    txRef,
                    customerEmail: user?.email || 'buyer@gocycle.ng',
                    customerName: user?.name || 'GoCycle Buyer',
                    customerPhone: user?.phone || '',
                    productName: product?.name || 'Battery'
                })
            })

            const initiateData = await initiateRes.json()

            if (!initiateData.success || !initiateData.paymentUrl) {
                toast.error(initiateData.message || 'Failed to initialize payment')
                setStep('PAYMENT_METHOD')
                setIsLoading(false)
                return
            }

            // 3. Redirect the browser to Flutterwave's hosted checkout page
            console.log('[Flutterwave VP4] Redirecting to hosted checkout...')
            window.location.href = initiateData.paymentUrl
            // (User returns to /payment/callback after completing payment)

        } catch (error) {
            console.error('[Checkout] Flutterwave VP4 error:', error)
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#0c101b] border border-slate-800 rounded-sm w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 max-h-[95vh] sm:max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="bg-[#0c101b] p-6 sm:p-8 text-white relative border-b border-slate-800">
                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 p-2 rounded-sm bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                    >
                        <XIcon size={14} />
                    </button>
                    <div className="flex items-center gap-2 text-[#05DF72] mb-2.5 font-semibold uppercase tracking-wider text-[10px]">
                        <WalletIcon size={12} />
                        {step === 'SUMMARY' && 'Secure Checkout'}
                        {step === 'PAYMENT_METHOD' && 'Choose Payment'}
                        {step === 'PAYMENT_DETAILS' && 'Make Payment'}
                        {step === 'PROCESSING' && 'Authenticating Transaction'}
                        {step === 'SUCCESS' && (orderResult?.paymentMethod === 'FLUTTERWAVE' ? 'Payment Confirmed' : 'Order Received')}
                        {step === 'FAILED' && 'Transaction Error'}
                    </div>
                    <h2 className="text-lg font-bold tracking-tight">
                        {step === 'SUMMARY' && 'Confirm Order'}
                        {step === 'PAYMENT_METHOD' && 'How Would You Like to Pay?'}
                        {step === 'PAYMENT_DETAILS' && 'Bank Transfer'}
                        {step === 'PROCESSING' && 'Processing...'}
                        {step === 'SUCCESS' && (orderResult?.paymentMethod === 'FLUTTERWAVE' ? 'Payment Successful!' : 'Pending Verification')}
                        {step === 'FAILED' && 'Payment Failed'}
                    </h2>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 bg-[#0c101b] overflow-y-auto flex-1">

                    {/* STEP 1: Order Summary */}
                    {step === 'SUMMARY' && (
                        <div className="space-y-6">
                            {/* Product Info */}
                            <div className="flex gap-4 p-4 bg-[#111625] rounded-sm border border-slate-800 shadow-sm relative group">
                                <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-sm flex items-center justify-center text-xl shrink-0">
                                    🔋
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-semibold text-[#05DF72] uppercase tracking-wider mb-1">Item Details</p>
                                    <h3 className="font-bold text-white text-sm truncate">{product?.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{product?.batteryType} • {product?.condition}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-bold text-white">{currency}{product?.price?.toLocaleString()}</span>
                                        <span className="text-[9px] font-semibold text-slate-500">× {quantity}</span>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 text-[#05DF72] opacity-30 group-hover:opacity-100 transition-opacity">
                                    <CheckCircleIcon size={16} />
                                </div>
                            </div>

                            {/* Collection Date */}
                            <div className="p-4 bg-[#111625] rounded-sm border border-slate-800 flex items-start gap-3">
                                <div className="p-2 bg-slate-800 border border-slate-700 rounded-sm text-slate-400 shrink-0">
                                    <CalendarIcon size={14} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-semibold text-slate-450 uppercase tracking-wider mb-0.5">Pickup Date</p>
                                    <p className="font-bold text-white text-xs">{formatDate(selectedDate)}</p>
                                </div>
                            </div>

                            {/* Total Bill */}
                            <div className="p-4 sm:p-5 bg-[#111625] border border-slate-800 rounded-sm text-white relative overflow-hidden space-y-3">
                                <div className="relative z-10 flex justify-between items-center text-slate-400 font-medium text-xs">
                                    <span>Item Subtotal</span>
                                    <span>{currency}{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="relative z-10 flex justify-between items-center text-slate-400 font-medium text-xs pb-3 border-b border-slate-800">
                                    <span className="flex items-center gap-1.5">Platform Fee (5%) <span className="p-0.5 px-1 bg-[#05DF72]/15 text-[#05DF72] rounded-sm text-[8px] font-mono">+</span></span>
                                    <span className="text-[#05DF72]">{currency}{platformFee.toLocaleString()}</span>
                                </div>
                                <div className="relative z-10 flex items-center justify-between pt-1">
                                    <p className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Total Payable</p>
                                    <span className="text-xl font-bold text-white">{currency}{totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Pay Button */}
                            <Button
                                onClick={() => {
                                    setStep('PAYMENT_METHOD')
                                }}
                                loading={isLoading}
                                className="w-full bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] text-slate-950 font-semibold text-xs uppercase tracking-wider py-3 rounded-sm transition-colors mt-2 flex items-center justify-center gap-1.5"
                            >
                                <ShieldCheckIcon size={14} />
                                Proceed to Payment Methods
                            </Button>

                            <p className="text-[8px] text-slate-500 text-center font-bold uppercase tracking-wider opacity-60">
                                ESCROW PROTECTION ENABLED
                            </p>
                        </div>
                    )}

                    {/* STEP 2: Payment Method Selection */}
                    {step === 'PAYMENT_METHOD' && (
                        <div className="space-y-4">
                            <p className="text-xs text-slate-400 font-medium text-center">
                                Select your preferred payment method for <span className="font-bold text-white">{currency}{totalAmount.toLocaleString()}</span>
                            </p>

                            {/* Flutterwave Card Option */}
                            <button
                                onClick={() => setSelectedPaymentMethod('FLUTTERWAVE')}
                                className={`w-full p-4 sm:p-5 rounded-sm text-left transition-all duration-300 border relative overflow-hidden group ${
                                    selectedPaymentMethod === 'FLUTTERWAVE'
                                        ? 'border-[#05DF72] bg-[#111625] shadow-lg shadow-[#05DF72]/5'
                                        : 'border-slate-800 bg-[#0c101b] hover:border-slate-700'
                                }`}
                            >
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className={`p-2.5 rounded-sm transition-all ${
                                        selectedPaymentMethod === 'FLUTTERWAVE'
                                            ? 'bg-[#05DF72] text-slate-950'
                                            : 'bg-slate-800 text-slate-400'
                                    }`}>
                                        <CreditCardIcon size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-white text-xs">Debit Card / USSD / Bank Transfer</h3>
                                            <span className="bg-[#05DF72]/10 border border-[#05DF72]/20 text-[#05DF72] text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm shrink-0">Instant</span>
                                        </div>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                                            Secured by Flutterwave • Auto Verified
                                        </p>
                                        <p className="text-xs text-slate-450 font-medium mt-1 leading-relaxed">
                                            Pay instantly using your card, bank account, or USSD code. Payment is verified automatically.
                                        </p>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                        selectedPaymentMethod === 'FLUTTERWAVE'
                                            ? 'border-[#05DF72] bg-[#05DF72]'
                                            : 'border-slate-600'
                                    }`}>
                                        {selectedPaymentMethod === 'FLUTTERWAVE' && (
                                            <CheckCircleIcon size={10} className="text-slate-950" />
                                        )}
                                    </div>
                                </div>
                            </button>

                            {/* Manual Transfer Option */}
                            <button
                                onClick={() => setSelectedPaymentMethod('MANUAL_TRANSFER')}
                                className={`w-full p-4 sm:p-5 rounded-sm text-left transition-all duration-300 border relative overflow-hidden group ${
                                    selectedPaymentMethod === 'MANUAL_TRANSFER'
                                        ? 'border-[#05DF72] bg-[#111625] shadow-lg shadow-[#05DF72]/5'
                                        : 'border-slate-800 bg-[#0c101b] hover:border-slate-700'
                                }`}
                            >
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className={`p-2.5 rounded-sm transition-all ${
                                        selectedPaymentMethod === 'MANUAL_TRANSFER'
                                            ? 'bg-[#05DF72] text-slate-950'
                                            : 'bg-slate-800 text-slate-400'
                                    }`}>
                                        <BankIcon size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-white text-xs">Manual Bank Transfer</h3>
                                            <span className="bg-[#05DF72]/10 border border-[#05DF72]/20 text-[#05DF72] text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm shrink-0">1-24hrs</span>
                                        </div>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                                            Direct Bank Transfer • Admin Verified
                                        </p>
                                        <p className="text-xs text-slate-450 font-medium mt-1 leading-relaxed">
                                            Transfer to our bank account. Payment is verified manually by our finance team within 1-24 hours.
                                        </p>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                        selectedPaymentMethod === 'MANUAL_TRANSFER'
                                            ? 'border-[#05DF72] bg-[#05DF72]'
                                            : 'border-slate-600'
                                    }`}>
                                        {selectedPaymentMethod === 'MANUAL_TRANSFER' && (
                                            <CheckCircleIcon size={10} className="text-slate-950" />
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
                                className="w-full bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] text-slate-950 font-semibold text-xs uppercase tracking-wider py-3 rounded-sm transition-colors mt-2 flex items-center justify-center gap-1.5"
                            >
                                <ZapIcon size={14} />
                                {selectedPaymentMethod === 'FLUTTERWAVE' ? 'Pay Now with Flutterwave' : 'Continue to Transfer Details'}
                            </Button>

                            <button
                                onClick={() => setStep('SUMMARY')}
                                className="w-full text-center text-[9px] text-slate-500 font-bold uppercase tracking-wider hover:text-white transition-colors py-2"
                            >
                                ← Back to Order Summary
                            </button>
                        </div>
                    )}

                    {/* STEP 3: Bank Transfer Details (Manual only) */}
                    {step === 'PAYMENT_DETAILS' && (
                        <div className="space-y-4">
                            <div className="p-4 sm:p-6 bg-[#111625] rounded-sm border border-slate-800 space-y-4 relative overflow-hidden text-white shadow-xl">
                                <h3 className="text-xs font-bold text-[#05DF72] uppercase tracking-wider text-center">Transfer Details</h3>
                                <p className="text-xs text-slate-400 text-center leading-relaxed">
                                    Please transfer exactly <span className="font-bold text-white text-sm">{currency}{totalAmount.toLocaleString()}</span> to the account below to secure this order.
                                </p>
                                
                                <div className="bg-[#0c101b] p-4 rounded-sm border border-slate-800">
                                    <div className="flex justify-between items-center mb-2.5">
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Bank Name</span>
                                        <span className="text-xs font-bold text-white">Sterling Bank</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2.5">
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Account Number</span>
                                        <span className="text-base font-mono font-bold text-white tracking-wider">
                                            0143633968
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Account Name</span>
                                        <span className="text-xs font-bold text-[#05DF72]">Go Cycle Limited</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-semibold text-slate-450 uppercase tracking-wider block">Sender Account Name</label>
                                <input
                                    type="text"
                                    value={senderName}
                                    onChange={(e) => setSenderName(e.target.value)}
                                    placeholder="E.g. John Doe"
                                    className="w-full bg-[#111625] border border-slate-700 focus:border-[#05DF72] rounded-sm py-2.5 px-4 text-white text-xs outline-none transition-all placeholder:text-slate-650"
                                    disabled={isLoading}
                                />
                                <p className="text-[9px] text-slate-550 font-medium leading-relaxed">Ensure this name matches the account you transfer from. Our admins will verify this payment manually.</p>
                            </div>

                            <Button
                                onClick={handleSubmitManualTransfer}
                                loading={isLoading}
                                className="w-full bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] text-slate-950 font-semibold text-xs uppercase tracking-wider py-3 rounded-sm transition-colors mt-2"
                            >
                                I Have Transferred The Funds
                            </Button>

                            <button
                                onClick={() => setStep('PAYMENT_METHOD')}
                                className="w-full text-center text-[9px] text-slate-500 font-bold uppercase tracking-wider hover:text-white transition-colors py-2"
                            >
                                ← Change Payment Method
                            </button>
                        </div>
                    )}

                    {/* STEP 4: Processing */}
                    {step === 'PROCESSING' && (
                        <div className="py-12 text-center space-y-6 animate-in fade-in zoom-in-95">
                            <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-sm flex items-center justify-center mx-auto">
                                <LoaderIcon className="text-[#05DF72] animate-spin" size={32} />
                            </div>
                            {selectedPaymentMethod === 'MANUAL_TRANSFER' ? (
                                <div className="space-y-2">
                                    <h3 className="text-base font-bold text-white tracking-tight">Processing Manual Transfer</h3>
                                    <p className="text-xs text-slate-400 font-medium max-w-[240px] mx-auto">Submitting your order details...</p>
                                    <div className="flex flex-col items-center gap-1.5 text-[9px] font-semibold text-slate-500 uppercase tracking-wider mt-4">
                                        <span className="flex items-center gap-1.5 text-[#05DF72]"><CheckCircleIcon size={11} /> Awaiting admin verification</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <h3 className="text-base font-bold text-white tracking-tight">Securing Your Transaction</h3>
                                    <p className="text-xs text-slate-400 font-medium max-w-[240px] mx-auto">Connecting to payment gateway...</p>
                                    <div className="flex flex-col items-center gap-1.5 text-[9px] font-semibold text-slate-500 uppercase tracking-wider mt-4">
                                        <span className="flex items-center gap-1.5"><CheckCircleIcon size={11} className="text-[#05DF72]" /> Validating order details</span>
                                        <span className="flex items-center gap-1.5"><CheckCircleIcon size={11} className="text-[#05DF72]" /> Secure gateway handshake</span>
                                        <span className="flex items-center gap-1.5 animate-pulse text-[#05DF72]"><div className="w-1.5 h-1.5 bg-[#05DF72] rounded-sm"></div> Awaiting payment confirmation</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 5: Success */}
                    {step === 'SUCCESS' && orderResult && (
                        <div className="py-6 text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                            {orderResult.paymentMethod === 'FLUTTERWAVE' ? (
                                <>
                                    {/* Flutterwave Success — Instant Confirmation */}
                                    <div className="w-14 h-14 bg-[#05DF72] rounded-sm flex items-center justify-center mx-auto shadow-xl">
                                        <CheckCircleIcon className="text-slate-950" size={32} />
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-white tracking-tight">Payment Confirmed!</h3>
                                        <p className="text-xs text-slate-400 font-medium">Your order has been paid and confirmed.</p>
                                    </div>

                                    {/* E-Receipt */}
                                    <div className="bg-[#111625] border border-slate-800 rounded-sm p-6 space-y-4 text-left relative overflow-hidden shadow-inner">
                                        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                            <div>
                                                <p className="text-[8px] font-bold text-slate-450 uppercase tracking-wider mb-0.5">Electronic Receipt</p>
                                                <h4 className="text-xs font-bold text-white">Go-Cycle Marketplace</h4>
                                            </div>
                                            <span className="text-[8px] font-bold text-[#05DF72] bg-[#05DF72]/10 border border-[#05DF72]/20 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                                Paid
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400">Transaction Ref</span>
                                                <span className="font-mono font-semibold text-white">{orderResult?.paymentReference || orderResult?.id?.slice(0, 12)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400">Amount Paid</span>
                                                <span className="font-semibold text-white">₦{totalAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400">Payment Method</span>
                                                <span className="font-semibold text-white flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 bg-[#05DF72] rounded-sm"></div>
                                                    FLW / {orderResult.paymentMethod || 'Instant'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400">Date & Time</span>
                                                <span className="font-semibold text-white uppercase">
                                                    {new Date().toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#111625] border border-slate-800 rounded-sm p-4 text-left flex items-start gap-3 shadow-sm">
                                        <div className="p-2 bg-[#05DF72]/10 border border-[#05DF72]/20 rounded-sm shrink-0">
                                            <ZapIcon size={14} className="text-[#05DF72]" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-bold text-white uppercase tracking-wider">Order Processing</p>
                                            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                                The seller has been notified of your payment. Please proceed to <span className="font-semibold text-white">{orderResult?.store?.address || product?.pickupAddress || "the collection point"}</span> on the scheduled date. A detailed receipt has been sent to your email.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Manual Transfer Success — Pending Verification */}
                                    <div className="w-14 h-14 bg-amber-500 rounded-sm flex items-center justify-center mx-auto shadow-xl">
                                        <WalletIcon className="text-slate-950" size={32} />
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-white tracking-tight">Verification Pending</h3>
                                        <p className="text-xs text-slate-400 font-medium">We have received your order details.</p>
                                    </div>

                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-sm p-4 flex items-start gap-3 text-left">
                                        <AlertCircleIcon size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider mb-1">Awaiting Admin Approval</p>
                                            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                                Your bank transfer is being reviewed by our finance team. Once verified, the seller's pickup address and your collection code will be unlocked. This usually takes 1-24 hours.
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                                <span className="font-bold text-white">Pickup Address:</span> Address will be revealed after verification
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-[#111625] border border-slate-800 rounded-sm p-4 text-left flex items-start gap-3">
                                        <div className="p-2 bg-slate-800 border border-slate-700 rounded-sm shrink-0">
                                            <ClockIcon size={14} className="text-slate-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-bold text-white uppercase tracking-wider">What Happens Next?</p>
                                            <p className="text-[10px] text-slate-450 leading-relaxed font-medium">
                                                Once our finance team verifies your transfer, you will receive an email with the seller's pickup address and your verification code. This usually takes 1-24 hours.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-3">
                                <Button onClick={handleClose} className="w-full bg-[#05DF72] hover:bg-[#04c865] text-slate-950 font-semibold text-xs uppercase tracking-wider py-3 rounded-sm transition-colors">
                                    Go to My Orders
                                </Button>
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                                    <ShieldCheckIcon size={12} className="text-[#05DF72]/60" /> Ref: {orderResult?.id?.slice(0, 12) || orderResult?.transactionId || 'N/A'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* STEP 6: Failed */}
                    {step === 'FAILED' && (
                        <div className="py-12 text-center space-y-6 animate-in fade-in zoom-in-95">
                            <div className="w-14 h-14 bg-red-500 rounded-sm flex items-center justify-center mx-auto">
                                <AlertCircleIcon className="text-slate-950" size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-base font-bold text-white tracking-tight">Payment Failed</h3>
                                <p className="text-xs text-slate-400 font-medium max-w-[260px] mx-auto">
                                    We couldn't process this transaction. Please check your balance or try again.
                                </p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 py-2.5 rounded-sm font-semibold text-[10px] uppercase tracking-wider text-slate-400 hover:text-white transition-colors bg-[#111625] hover:bg-[#111625]/80 border border-slate-700"
                                >
                                    Cancel Order
                                </button>
                                <Button
                                    onClick={() => setStep('PAYMENT_METHOD')}
                                    className="flex-1 !py-3 bg-[#05DF72] hover:bg-[#04c865] text-slate-950 font-semibold text-xs uppercase tracking-wider rounded-sm transition-colors"
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
