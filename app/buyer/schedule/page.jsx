'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CalendarIcon, MapPinIcon, ShieldCheckIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import ScheduleCalendar from '@/components/ScheduleCalendar'
import { dummyScheduleData } from '@/assets/assets'
import { useDispatch } from 'react-redux'
import { showLoader, hideLoader } from '@/lib/features/ui/uiSlice'

function ScheduleContent() {
    const router = useRouter()
    const dispatch = useDispatch()
    const searchParams = useSearchParams()

    // Demo: get order ID from URL or default to a dummy one
    const orderId = searchParams.get('orderId') || 'ORD-102'

    const [selectedSlot, setSelectedSlot] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleConfirm = () => {
        if (!selectedSlot) {
            toast.error("Please select a date and time slot")
            return
        }

        setIsSubmitting(true)
        dispatch(showLoader("Scheduling pickup..."))

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false)
            dispatch(hideLoader())

            toast.success(
                <div className='text-sm font-medium'>
                    Pickup confirmed for <br />
                    <span className='font-bold'>{new Date(selectedSlot.date).toDateString()}</span> ({selectedSlot.slot})
                </div>,
                { duration: 4000 }
            )

            // Redirect back to dashboard after brief delay
            setTimeout(() => {
                router.push('/buyer')
            }, 1000)
        }, 1500)
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 space-y-10">
            {/* Header */}
            <div>
                <div className="inline-flex items-center gap-2 bg-green-50 text-[#05DF72] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-green-100">
                    <CalendarIcon size={12} /> Easy Scheduling
                </div>
                <h1 className="text-4xl font-black text-slate-900 leading-tight mb-2">
                    Schedule <span className="text-[#05DF72]">Pickup</span>
                </h1>
                <p className="text-slate-500 font-medium max-w-xl">
                    Choose a convenient time to collect your battery from the seller.
                    Green slots are available.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">

                {/* LEFT: Calendar Interface */}
                <div className="lg:col-span-2 space-y-6">
                    <ScheduleCalendar
                        onSelect={setSelectedSlot}
                        blockedDates={dummyScheduleData}
                    />

                    {/* Interaction Hint */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-700 rounded-2xl text-xs font-medium border border-blue-100">
                        <AlertCircleIcon size={18} className="shrink-0 mt-0.5" />
                        <p>
                            Once scheduled, the seller will be notified. You can reschedule up to 24 hours before the appointment.
                            Please bring your Collection Token (<b>GC-{Math.random().toString(36).substr(2, 4).toUpperCase()}</b>) for verification.
                        </p>
                    </div>
                </div>

                {/* RIGHT: Summary & Actions */}
                <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 space-y-8 sticky top-8 shadow-2xl">
                    <div>
                        <h3 className="text-lg font-black mb-1">Order Context</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{orderId}</p>
                    </div>

                    <div className="space-y-6">
                        {/* Selection Summary */}
                        <div className={`p-4 rounded-2xl border transition-all ${selectedSlot ? 'bg-[#05DF72]/10 border-[#05DF72] text-[#05DF72]' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <CalendarIcon size={18} />
                                <span className="text-xs font-bold uppercase tracking-widest">Selected Slot</span>
                            </div>
                            {selectedSlot ? (
                                <div>
                                    <p className="text-xl font-black text-white">
                                        {new Date(selectedSlot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </p>
                                    <p className="text-sm font-bold text-[#05DF72]">{selectedSlot.slot}</p>
                                </div>
                            ) : (
                                <p className="text-sm italic">No date selected</p>
                            )}
                        </div>

                        {/* Seller Location (Static Demo) */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                                <MapPinIcon size={18} className="text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pickup Location</p>
                                <p className="font-bold text-white">EcoVolt Solutions</p>
                                <p className="text-sm text-slate-400">45 Ikeja Industrial Estate, Lagos</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800 space-y-3">
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedSlot || isSubmitting}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2
                                ${selectedSlot
                                    ? 'bg-[#05DF72] text-white hover:bg-[#04c965] shadow-lg shadow-[#05DF72]/20'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }
                            `}
                        >
                            {isSubmitting ? 'Processing...' : 'Confirm Schedule'}
                            {!isSubmitting && <CheckCircleIcon size={16} />}
                        </button>

                        <button
                            onClick={() => setSelectedSlot(null)}
                            disabled={!selectedSlot}
                            className="w-full py-3 rounded-xl font-bold text-xs text-slate-400 hover:text-white transition-colors"
                        >
                            Reset Selection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function PickupSchedule() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading schedule...</div>}>
            <ScheduleContent />
        </Suspense>
    )
}
