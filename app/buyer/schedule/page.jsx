'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar as CalendarIcon, MapPin as MapPinIcon, ShieldCheck as ShieldCheckIcon, AlertCircle as AlertCircleIcon, CheckCircle as CheckCircleIcon, MessageSquare as MessageSquareIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import ScheduleCalendar from '@/components/ScheduleCalendar'
import { useDispatch, useSelector } from 'react-redux'
import { showLoader, hideLoader } from '@/lib/features/ui/uiSlice'
import { getUserOrders } from '@/backend-actions/actions/order'

function ScheduleContent() {
    const router = useRouter()
    const dispatch = useDispatch()
    const searchParams = useSearchParams()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Get user ID from auth state
                const { user } = useSelector(state => state.auth)
                const res = await getUserOrders(user?.id)
                if (res.success) {
                    setOrders(res.data?.orders || res.data || [])
                }
            } catch (err) {
                console.error("Failed to fetch orders:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [])

    const handleConfirm = () => {
        if (!selectedSlot) {
            toast.error("Please select a date and time slot")
            return
        }

        setIsSubmitting(true)
        dispatch(showLoader("Scheduling pickup..."))

        setTimeout(() => {
            setIsSubmitting(false)
            dispatch(hideLoader())
            toast.success("Pickup scheduled successfully!")
            router.push('/buyer')
        }, 1500)
    }

    // Find orders that have a collection date
    const scheduledOrders = orders.filter(o => o.collectionDate && !o.isCollected)

    if (loading) return <SmartLoading />

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 bg-[#05DF72]/10 text-[#05DF72] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-[#05DF72]/20">
                        <CalendarIcon size={12} /> Coordination Hub
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 leading-tight">
                        Your <span className="text-[#05DF72]">Schedule</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">
                        View your confirmed pickups or schedule a new collection.
                    </p>
                </div>
            </div>

            {scheduledOrders.length > 0 ? (
                <div className="space-y-8">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Confirmed Pickups</h2>
                    <div className="grid gap-6">
                        {scheduledOrders.map(order => (
                            <div key={order.id} className="bg-white rounded-sm p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                                <div className="w-20 h-20 bg-[#0c101b] border border-slate-800 text-white rounded-sm flex flex-col items-center justify-center shrink-0">
                                    <span className="text-[10px] font-black uppercase opacity-60">
                                        {new Date(order.collectionDate).toLocaleDateString('en-US', { month: 'short' })}
                                    </span>
                                    <span className="text-2xl font-black">
                                        {new Date(order.collectionDate).getDate()}
                                    </span>
                                </div>
                                
                                <div className="flex-1 space-y-2 text-center md:text-left">
                                    <h3 className="text-xl font-black text-slate-900">
                                        {order.orderItems?.[0]?.product?.name || 'Battery Pickup'}
                                    </h3>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 font-medium text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <MapPinIcon size={14} />
                                            <span>{order.store?.address || 'Pickup Point'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[#05DF72]">
                                            <ShieldCheckIcon size={14} />
                                            <span>Verified Merchant</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                    <button 
                                        onClick={() => router.push(`/buyer?orderId=${order.id}`)}
                                        className="px-8 py-4 bg-slate-900 text-white rounded-sm font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CalendarIcon size={14} /> Reschedule
                                    </button>
                                    <button 
                                        onClick={() => router.push('/buyer')}
                                        className="px-8 py-4 bg-[#05DF72] text-white rounded-sm font-black uppercase text-[10px] tracking-widest hover:bg-[#04c764] transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircleIcon size={14} /> View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <ScheduleCalendar
                            onSelect={setSelectedSlot}
                            blockedDates={[]}
                        />
                    </div>

                    <div className="bg-[#0c101b] border border-slate-800 text-white rounded-sm p-8 space-y-8 sticky top-8 shadow-sm">
                        <div>
                            <h3 className="text-lg font-black mb-1">Schedule Pickup</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Select a slot to continue</p>
                        </div>

                        {selectedSlot && (
                            <div className="p-6 rounded-sm bg-[#05DF72]/10 border border-[#05DF72] text-[#05DF72]">
                                <p className="text-[10px] font-black uppercase mb-1">Selected Date</p>
                                <p className="text-xl font-black text-white">
                                    {new Date(selectedSlot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                                <p className="text-sm font-bold mt-1">{selectedSlot.slot}</p>
                            </div>
                        )}

                        <button
                            onClick={handleConfirm}
                            disabled={!selectedSlot || isSubmitting}
                            className="w-full py-5 bg-[#05DF72] disabled:bg-slate-800 text-white rounded-sm font-black uppercase tracking-widest text-[10px] transition-all"
                        >
                            {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

function SmartLoading() {
    const [slowConnection, setSlowConnection] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setSlowConnection(true)
        }, 5000) // Show message after 5 seconds
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 text-center space-y-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-[#05DF72] rounded-full animate-spin"></div>
                {slowConnection && (
                    <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full animate-bounce">
                        <AlertCircleIcon size={16} />
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-xl font-black text-slate-900 mb-1">
                    {slowConnection ? 'Slow Connection Detected' : 'Loading Schedule'}
                </h3>
                <p className="text-slate-500 font-medium">
                    {slowConnection 
                        ? 'It is taking longer than usual. Please check your internet.' 
                        : 'Fetching the latest pickup slots for you...'}
                </p>
            </div>
            {slowConnection && (
                <button 
                    onClick={() => window.location.reload()} 
                    className="px-6 py-3 bg-slate-900 text-white rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
                >
                    Retry Loading
                </button>
            )}
        </div>
    )
}

export default function PickupSchedule() {
    return (
        <Suspense fallback={<SmartLoading />}>
            <ScheduleContent />
        </Suspense>
    )
}
