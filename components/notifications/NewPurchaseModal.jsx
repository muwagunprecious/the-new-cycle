'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Calendar, User, CreditCard, ArrowRight, Copy, Check, Phone, Clock, ChevronRight, AlertTriangle } from 'lucide-react'
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
                onDismiss()
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
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="bg-white w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 relative rounded-sm"
                >
                    {/* Header */}
                    <div className={`relative p-6 flex items-center justify-between ${isRescheduleType ? 'bg-amber-500' : 'bg-[#05DF72]'}`}>
                        {/* Subtle pattern overlay */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '8px 8px' }} />
                        <div className="relative flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 rounded-sm">
                                {isRescheduleType
                                    ? <Calendar className="text-white" size={22} />
                                    : <ShoppingBag className="text-white" size={22} />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-0.5">
                                    {isRescheduleType ? 'Pickup Reschedule' : isRescheduling ? 'Propose New Date' : isSeller ? (notification.awaitingPayment ? 'Awaiting Payment' : 'New Sale') : 'Order Confirmed'}
                                </p>
                                <h3 className="text-white text-xl font-black leading-none">
                                    {isRescheduleType ? 'Reschedule Request' : (isRescheduling ? 'Reschedule Pickup' : (isSeller ? (notification.awaitingPayment ? 'New Order' : 'New Purchase!') : 'Payment Confirmed!'))}
                                </h3>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            title="Close (Remind me later)"
                            className="relative w-9 h-9 rounded-sm bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/20"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6 space-y-5">
                        {isRescheduleType ? (
                            <div className="space-y-5">
                                {/* Order Reference Tag */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Reference</span>
                                    <span className="text-[10px] font-black bg-slate-100 text-slate-700 px-2 py-1 rounded-sm border border-slate-200 font-mono tracking-wider">
                                        #{notification.orderId?.slice(-12).toUpperCase() || 'N/A'}
                                    </span>
                                </div>

                                {/* Proposal Card */}
                                <div className="border border-amber-200 rounded-sm overflow-hidden">
                                    {/* Amber accent top strip */}
                                    <div className="bg-amber-500 px-4 py-2 flex items-center gap-2">
                                        <Clock size={13} className="text-white" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">New Pickup Proposal</span>
                                    </div>
                                    {/* Proposal body */}
                                    <div className="bg-amber-50 px-5 py-4 space-y-3">
                                        <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                                            {notification.rawMessage}
                                        </p>
                                        {/* Divider with action hint */}
                                        <div className="flex items-center gap-3 pt-1">
                                            <div className="flex-1 h-px bg-amber-200" />
                                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                                                <AlertTriangle size={10} /> Action Required
                                            </span>
                                            <div className="flex-1 h-px bg-amber-200" />
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            Open the order to accept or reject this new pickup date. You can also propose a counter-date from the order detail page.
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            window.location.href = isSeller ? `/seller?id=${notification.orderId}` : `/buyer/orders?id=${notification.orderId}`
                                            onDismiss()
                                        }}
                                        className="flex-1 bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest py-4 rounded-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                                    >
                                        View Details & Respond <ChevronRight size={15} />
                                    </button>
                                    <button
                                        onClick={onDismiss}
                                        className="px-6 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-widest rounded-sm hover:bg-slate-50 transition-all"
                                    >
                                        Dismiss
                                    </button>
                                </div>

                                {/* Footer note */}
                                <p className="text-[10px] text-slate-400 text-center font-medium">
                                    Dismissing will remove this alert. The proposal remains on your order page.
                                </p>
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

                                <div className="space-y-1 pt-2 border-t border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Calendar size={12} /> Pickup Date
                                    </p>
                                    <p className="text-sm font-bold text-slate-900">{notification.collectionDate}</p>
                                </div>

                                {/* Verification Code */}
                                {notification.verificationCode ? (
                                    <div className="bg-slate-50 rounded-sm p-5 border border-slate-200 flex flex-col items-center gap-4 text-center">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Verification Code</p>
                                            <div className="flex items-center gap-3">
                                                <div className="text-3xl font-black text-slate-900 tracking-[0.2em] bg-white px-6 py-3 rounded-sm shadow-sm border border-slate-200">
                                                    {notification.verificationCode}
                                                </div>
                                                <button
                                                    onClick={handleCopy}
                                                    className="w-11 h-11 rounded-sm bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#05DF72] hover:border-[#05DF72] transition-all"
                                                >
                                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium max-w-[200px]">
                                            Ask the buyer for this code during pickup to confirm the transaction.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-amber-50 rounded-sm p-4 border border-amber-200 text-center">
                                        <p className="text-xs font-bold text-amber-700">Payment Verification Pending</p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-1">The buyer paid via bank transfer. You will receive a verification code once payment is confirmed.</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-1">
                                    {isSeller && (
                                        <button
                                            onClick={() => setIsRescheduling(true)}
                                            className="flex-1 bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest py-4 rounded-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                                        >
                                            Reschedule <ArrowRight size={15} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            window.location.href = isSeller ? `/seller?id=${notification.orderId}` : `/buyer/orders?id=${notification.orderId}`
                                            onDismiss()
                                        }}
                                        className={`flex-1 bg-white border border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-sm hover:bg-slate-50 transition-all ${!isSeller ? 'py-4' : ''}`}
                                    >
                                        {isSeller ? 'View Details' : 'View My Orders'}
                                    </button>
                                    <button
                                        onClick={onDismiss}
                                        className="px-6 bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-sm hover:bg-slate-100 transition-all"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Calendar size={12} /> New Pickup Date
                                    </label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={rescheduleData.date}
                                        onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-sm p-4 font-bold text-slate-900 outline-none focus:border-[#05DF72] transition-all"
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
                                        className="w-full bg-slate-50 border border-slate-200 rounded-sm p-4 font-bold text-slate-900 outline-none focus:border-[#05DF72] transition-all resize-none text-sm"
                                    />
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button
                                        onClick={handleReschedule}
                                        disabled={isSubmitting}
                                        className="flex-1 bg-[#05DF72] text-slate-900 font-black text-[11px] uppercase tracking-widest py-4 rounded-sm flex items-center justify-center gap-2 hover:bg-[#04c764] transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Sending..." : "Confirm Reschedule"}
                                    </button>
                                    <button
                                        onClick={() => setIsRescheduling(false)}
                                        className="px-6 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-widest rounded-sm hover:bg-slate-50 transition-all"
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
