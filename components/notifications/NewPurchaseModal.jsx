'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Calendar, User, CreditCard, ArrowRight, Copy, Check, Phone } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { requestReschedule } from '@/backend-actions/actions/order'

export default function NewPurchaseModal({ notification, onClose, onDismiss, userRole }) {
    const [copied, setCopied] = useState(false)
    const [isRescheduling, setIsRescheduling] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [rescheduleData, setRescheduleData] = useState({
        date: '',
        message: ''
    })

    if (!notification) return null

    const isSeller = userRole === 'SELLER'
    const isBuyer = userRole === 'USER'

    const handleCopy = () => {
        navigator.clipboard.writeText(notification.verificationCode)
        setCopied(true)
        toast.success("Code copied!")
        setTimeout(() => setCopied(false), 2000)
    }

    const handleReschedule = async () => {
        if (!rescheduleData.date) {
            toast.error("Please select a date")
            return
        }
        setIsSubmitting(true)
        try {
            const roleForAction = isSeller ? 'SELLER' : 'BUYER'
            const res = await requestReschedule(notification.orderId, rescheduleData.date, roleForAction, rescheduleData.message)
            if (res.success) {
                toast.success("Reschedule request sent")
                onDismiss() // Acted on, so dismiss permanently
            } else {
                toast.error(res.message || "Failed to reschedule")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const isRescheduleType = notification.type === 'RESCHEDULE'

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 relative"
                >
                    {/* Header with gradient */}
                    <div className={`h-32 bg-gradient-to-br ${isRescheduleType ? 'from-amber-500 to-orange-500' : 'from-[#05DF72] to-[#04c764]'} relative p-8 flex items-end`}>
                        <div className="absolute top-6 right-6">
                            <button 
                                onClick={onClose}
                                title="Close (Remind me later)"
                                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                                {isRescheduleType ? <Calendar className="text-amber-500" size={32} /> : <ShoppingBag className="text-[#05DF72]" size={32} />}
                            </div>
                            <div>
                                <h3 className="text-white text-2xl font-black leading-none">
                                    {isRescheduleType ? "Reschedule Request" : (isRescheduling ? "Reschedule Pickup" : (isSeller ? "New Purchase!" : "Payment Confirmed!"))}
                                </h3>
                                <p className="text-white/80 font-bold text-xs mt-2 uppercase tracking-widest">
                                    {isRescheduleType ? "Review Proposal" : (isRescheduling ? "Propose New Date" : (isSeller ? "Immediate Confirmation" : "Order Processing"))}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        {isRescheduleType ? (
                            <div className="space-y-6">
                                <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 space-y-3">
                                    <p className="text-xs font-bold text-amber-900 leading-relaxed">
                                        {notification.rawMessage}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => {
                                            window.location.href = isSeller ? `/seller?id=${notification.orderId}` : `/buyer/orders?id=${notification.orderId}`
                                            onDismiss()
                                        }}
                                        className="flex-1 bg-slate-900 text-white font-black text-xs uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                                    >
                                        View Details & Respond <ArrowRight size={16} />
                                    </button>
                                    <button 
                                        onClick={onDismiss}
                                        className="px-8 bg-white border border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        ) : !isRescheduling ? (
                            <>
                                {/* Order Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <User size={12} /> Buyer
                                        </p>
                                        <p className="text-sm font-bold text-slate-900">{notification.buyerName}</p>
                                        {notification.buyerPhone && (
                                            <a href={`tel:${notification.buyerPhone}`} className="text-[10px] font-bold text-[#05DF72] flex items-center gap-1 hover:underline">
                                                <Phone size={10} /> {notification.buyerPhone}
                                            </a>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <CreditCard size={12} /> Amount
                                        </p>
                                        <p className="text-sm font-bold text-[#05DF72]">₦{notification.amount?.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <ShoppingBag size={12} /> Product
                                    </p>
                                    <p className="text-sm font-bold text-slate-900">{notification.productName}</p>
                                    {notification.quantity && notification.quantity !== '1' && (
                                        <p className="text-xs text-slate-400">Qty: {notification.quantity} units</p>
                                    )}
                                </div>

                                <div className="space-y-1 pt-2 border-t border-slate-50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Calendar size={12} /> Pickup Date
                                    </p>
                                    <p className="text-sm font-bold text-slate-900">{notification.collectionDate}</p>
                                </div>

                                {/* Verification Code Section */}
                                {notification.verificationCode ? (
                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col items-center gap-4 text-center">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Verification Code</p>
                                        <div className="flex items-center gap-3">
                                            <div className="text-4xl font-black text-slate-900 tracking-[0.2em] bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
                                                {notification.verificationCode}
                                            </div>
                                            <button 
                                                onClick={handleCopy}
                                                className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#05DF72] hover:border-[#05DF72] transition-all shadow-sm"
                                            >
                                                {copied ? <Check size={20} /> : <Copy size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium max-w-[200px]">
                                        Ask the buyer for this code during pickup to confirm the transaction.
                                    </p>
                                </div>
                                ) : (
                                <div className="bg-amber-50 rounded-3xl p-5 border border-amber-100 text-center">
                                    <p className="text-xs font-bold text-amber-700">Payment Verification Pending</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1">The buyer paid via bank transfer. You will receive a verification code once payment is confirmed.</p>
                                </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    {isSeller && (
                                        <button 
                                            onClick={() => setIsRescheduling(true)}
                                            className="flex-1 bg-slate-900 text-white font-black text-xs uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                                        >
                                            Reschedule Date <ArrowRight size={16} />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => {
                                            window.location.href = isSeller ? `/seller?id=${notification.orderId}` : `/buyer/orders?id=${notification.orderId}`
                                            onDismiss()
                                        }}
                                        className={`flex-1 bg-white border border-slate-100 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all ${!isSeller ? 'py-5' : ''}`}
                                    >
                                        {isSeller ? 'View Details' : 'View My Orders'}
                                    </button>
                                    <button 
                                        onClick={onDismiss}
                                        className="px-8 bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Calendar size={12} /> New Pickup Date
                                    </label>
                                    <input 
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={rescheduleData.date}
                                        onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-[#05DF72] transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <ShoppingBag size={12} /> Instructions (Optional)
                                    </label>
                                    <textarea 
                                        placeholder="E.g. There is a black gate at the location, call me when you arrive..."
                                        rows={3}
                                        value={rescheduleData.message}
                                        onChange={(e) => setRescheduleData({...rescheduleData, message: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-[#05DF72] transition-all resize-none text-sm"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button 
                                        onClick={handleReschedule}
                                        disabled={isSubmitting}
                                        className="flex-1 bg-[#05DF72] text-slate-900 font-black text-xs uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#04c764] transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Sending..." : "Confirm Reschedule"}
                                    </button>
                                    <button 
                                        onClick={() => setIsRescheduling(false)}
                                        className="px-8 bg-white border border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
