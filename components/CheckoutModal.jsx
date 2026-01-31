'use client'
import { useState } from "react"
import { XIcon, WalletIcon, CheckCircleIcon, CopyIcon, CalendarIcon, MapPinIcon, LoaderIcon, AlertCircleIcon } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"
import Button from "./Button"
import { mockOrderService, mockPaymentService, mockNotificationService } from "@/lib/mockService"
import { createOrder } from "@/backend/actions/order"

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
    const [copied, setCopied] = useState(false)

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

    const copyToken = () => {
        if (orderResult?.collectionToken) {
            navigator.clipboard.writeText(orderResult.collectionToken)
            setCopied(true)
            toast.success("Token copied!")
            setTimeout(() => setCopied(false), 2000)
        }
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="bg-slate-900 p-6 text-white relative">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <XIcon size={20} />
                    </button>
                    <div className="flex items-center gap-2 text-[#05DF72] mb-2 font-black uppercase tracking-widest text-[10px]">
                        <WalletIcon size={14} />
                        {step === 'SUMMARY' && 'Secure Checkout'}
                        {step === 'PROCESSING' && 'Processing Payment'}
                        {step === 'SUCCESS' && 'Payment Successful'}
                        {step === 'FAILED' && 'Payment Failed'}
                    </div>
                    <h2 className="text-xl font-bold">
                        {step === 'SUMMARY' && 'Complete Your Order'}
                        {step === 'PROCESSING' && 'Please Wait...'}
                        {step === 'SUCCESS' && 'Order Confirmed!'}
                        {step === 'FAILED' && 'Transaction Failed'}
                    </h2>
                </div>

                {/* Content */}
                <div className="p-6">

                    {/* STEP 1: Order Summary */}
                    {step === 'SUMMARY' && (
                        <div className="space-y-6">
                            {/* Product Info */}
                            <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                                <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center">
                                    <span className="text-2xl">🔋</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900">{product?.name}</h3>
                                    <p className="text-xs text-slate-500">{product?.batteryType} • {product?.condition}</p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">
                                        {currency}{product?.price?.toLocaleString()} × {quantity}
                                    </p>
                                </div>
                            </div>

                            {/* Collection Details */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <CalendarIcon size={16} className="text-[#05DF72]" />
                                    <div>
                                        <span className="text-slate-500">Collection Date:</span>
                                        <span className="font-bold text-slate-900 ml-2">{formatDate(selectedDate)}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPinIcon size={16} className="text-[#05DF72] mt-0.5" />
                                    <div>
                                        <span className="text-slate-500">Pickup Location:</span>
                                        <p className="font-medium text-slate-900">{product?.lga}, Lagos</p>
                                        <p className="text-xs text-slate-500">{product?.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white">
                                <span className="font-medium">Total Amount:</span>
                                <span className="text-2xl font-black">{currency}{totalAmount.toLocaleString()}</span>
                            </div>

                            {/* Pay Button */}
                            <Button
                                onClick={handlePayNow}
                                loading={isLoading}
                                loadingText="Processing..."
                                className="w-full !py-4"
                            >
                                <WalletIcon size={18} className="mr-2" />
                                Pay {currency}{totalAmount.toLocaleString()} Now
                            </Button>

                            <p className="text-xs text-slate-400 text-center">
                                Demo: Payment will simulate success (90% success rate)
                            </p>
                        </div>
                    )}

                    {/* STEP 2: Processing */}
                    {step === 'PROCESSING' && (
                        <div className="py-12 text-center space-y-6">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                <LoaderIcon className="text-[#05DF72] animate-spin" size={40} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Processing Payment</h3>
                                <p className="text-sm text-slate-500 mt-2">Please don't close this window...</p>
                            </div>
                            <div className="flex flex-col gap-2 text-xs text-slate-400">
                                <span>✓ Validating order details</span>
                                <span>✓ Processing payment</span>
                                <span className="animate-pulse">● Generating collection token...</span>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Success */}
                    {step === 'SUCCESS' && orderResult && (
                        <div className="py-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-[#05DF72]/10 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircleIcon className="text-[#05DF72]" size={40} />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Payment Successful!</h3>
                                <p className="text-sm text-slate-500 mt-2">Your order has been confirmed</p>
                            </div>

                            {/* Collection Token */}
                            <div className="bg-slate-900 rounded-2xl p-6 text-white">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Your Collection Token</p>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-3xl font-mono font-black tracking-widest text-[#05DF72]">
                                        {orderResult.collectionToken}
                                    </span>
                                    <button
                                        onClick={copyToken}
                                        className={`p-2 rounded-lg transition-colors ${copied ? 'bg-green-500' : 'bg-white/10 hover:bg-white/20'
                                            }`}
                                    >
                                        {copied ? <CheckCircleIcon size={18} /> : <CopyIcon size={18} />}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-4">
                                    Show this token to the seller on collection day
                                </p>
                            </div>

                            <div className="text-left bg-amber-50 rounded-xl p-4 border border-amber-100">
                                <p className="text-xs font-bold text-amber-800 mb-2">📋 Next Steps:</p>
                                <ol className="text-xs text-amber-700 space-y-1">
                                    <li>1. Visit the pickup location on {formatDate(selectedDate)}</li>
                                    <li>2. Show your collection token to the seller</li>
                                    <li>3. Collect your battery</li>
                                </ol>
                            </div>

                            <Button onClick={handleClose} className="w-full">
                                Go to My Orders
                            </Button>
                        </div>
                    )}

                    {/* STEP 4: Failed */}
                    {step === 'FAILED' && (
                        <div className="py-12 text-center space-y-6">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircleIcon className="text-red-500" size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Payment Failed</h3>
                                <p className="text-sm text-slate-500 mt-2">
                                    Something went wrong with your payment. Please try again.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <Button
                                    onClick={() => setStep('SUMMARY')}
                                    className="flex-1"
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
