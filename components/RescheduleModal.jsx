'use client'
import { useState } from 'react'
import { X, Calendar, MessageSquare, Loader2, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { requestReschedule } from '@/backend-actions/actions/order'

export default function RescheduleModal({ isOpen, onClose, orderId, onRescheduled, role = 'SELLER' }) {
    const [date, setDate] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async () => {
        if (!date) {
            toast.error("Please select a date")
            return
        }
        setLoading(true)
        try {
            const res = await requestReschedule(orderId, date, role, message)
            if (res.success) {
                toast.success("Reschedule request sent")
                onRescheduled(res.data || res.order || res)
                onClose()
            } else {
                toast.error(res.error || "Failed to reschedule")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-sm w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-sm bg-[#05DF72]/10 border border-[#05DF72]/20 flex items-center justify-center text-[#05DF72]">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 leading-none">Reschedule <span className="text-[#05DF72]">Pickup</span></h3>
                            <p className="text-slate-400 font-bold text-[10px] mt-2 uppercase tracking-widest">Propose a new collection date</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-sm bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Date Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={12} /> Select New Date
                        </label>
                        <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-sm p-4 font-bold text-slate-900 outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20 transition-all"
                        />
                    </div>

                    {/* Message Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare size={12} /> Note to {role === 'SELLER' ? 'Buyer' : 'Seller'} (Optional)
                        </label>
                        <textarea
                            placeholder="E.g. I won't be available on the previous date..."
                            rows={3}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-sm p-4 font-bold text-slate-900 outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20 transition-all resize-none text-sm"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-[#05DF72] text-slate-950 font-bold text-xs uppercase tracking-wider py-4 rounded-sm flex items-center justify-center gap-2 hover:bg-[#04c865] transition-all shadow-sm disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Confirm Reschedule"}
                    </button>
                    
                    <p className="text-[10px] text-center text-slate-400 font-medium">
                        The {role === 'SELLER' ? 'buyer' : 'seller'} will be notified and can choose to accept or suggest another date.
                    </p>
                </div>
            </div>
        </div>
    )
}
