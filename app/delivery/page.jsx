'use client'
import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import {
    TruckIcon,
    MapPinIcon,
    PhoneIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    AlertCircleIcon,
    PackageIcon,
    Navigation2Icon,
    UserIcon
} from "lucide-react"
import { addNotification } from "@/lib/features/notification/notificationSlice"
import toast from "react-hot-toast"

export default function DeliveryDashboard() {
    const { user, isLoggedIn } = useSelector(state => state.auth)
    const router = useRouter()
    const dispatch = useDispatch()

    // Mock active delivery assignment
    const [assignment, setAssignment] = useState({
        id: "DLV-9821",
        orderId: "ORD-101",
        status: "assigned", // assigned, at_seller, picked_up, on_way, at_buyer, completed
        buyer: {
            name: "Emeka Obi",
            whatsapp: "+234 809 123 4567",
            location: "12 Admiralty Way, Lekki Phase 1"
        },
        seller: {
            name: "EcoVolt Solutions",
            whatsapp: "+234 801 234 5678",
            location: "45 Ikeja Industrial Estate, Ikeja"
        },
        item: "Classic Car Battery 12V",
        confirmationCode: "772 109"
    })

    useEffect(() => {
        if (isLoggedIn && user?.role !== 'DELIVERY' && user?.role !== 'ADMIN') {
            router.push('/')
        }
    }, [isLoggedIn, user, router])

    const updateStatus = (newStatus, label) => {
        setAssignment(prev => ({ ...prev, status: newStatus }))
        toast.success(`Status updated: ${label}`)

        // Notify Buyer
        dispatch(addNotification({
            userId: 'user_buyer_1',
            title: 'Delivery Update',
            message: `Delivery Agent: ${label} for your order ${assignment.orderId}`,
            type: 'ORDER'
        }))
    }

    const steps = [
        { key: 'at_seller', label: 'Arrived at Seller', icon: MapPinIcon },
        { key: 'picked_up', label: 'Item Picked Up', icon: PackageIcon },
        { key: 'on_way', label: 'On the Way', icon: Navigation2Icon },
        { key: 'at_buyer', label: 'Arrived at Buyer', icon: UserIcon },
        { key: 'completed', label: 'Delivered Successfully', icon: CheckCircleIcon },
    ]

    const getStepStatus = (stepKey) => {
        const order = ['assigned', 'at_seller', 'picked_up', 'on_way', 'at_buyer', 'completed']
        const currentIdx = order.indexOf(assignment.status)
        const stepIdx = order.indexOf(stepKey)
        if (currentIdx >= stepIdx) return 'completed'
        if (currentIdx === stepIdx - 1) return 'next'
        return 'locked'
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 sm:p-10">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-2 text-[#05DF72] mb-2 font-black uppercase tracking-widest text-[10px]">
                            <TruckIcon size={16} /> Logistics Portal
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 leading-tight">Delivery <span className="text-[#05DF72]">Assignment</span></h1>
                        <p className="text-slate-400 font-bold text-sm mt-1">Manage pickups and handovers in real-time.</p>
                    </div>
                    <div className="bg-white px-6 py-4 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent Status</p>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">Active Duty</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-[#05DF72]/10 flex items-center justify-center text-[#05DF72]">
                            <TruckIcon size={20} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Assignment Detail Card */}
                        <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">#{assignment.id}</span>
                                    <div className="flex items-center gap-2 py-1 px-3 bg-[#05DF72]/10 rounded-full">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#05DF72] animate-pulse"></div>
                                        <span className="text-[10px] font-black text-[#05DF72] uppercase tracking-widest">{assignment.status.replace('_', ' ')}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pickup From</p>
                                        <div className="flex flex-col">
                                            <p className="font-black text-slate-900 text-lg uppercase tracking-tight">{assignment.seller.name}</p>
                                            <p className="text-sm text-slate-500 font-medium mb-3">{assignment.seller.location}</p>
                                            <a href={`https://wa.me/${assignment.seller.whatsapp.replace(/\D/g, '')}`} className="inline-flex items-center gap-2 text-[#05DF72] font-black text-xs hover:underline">
                                                <PhoneIcon size={14} /> WhatsApp Seller
                                            </a>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deliver To</p>
                                        <div className="flex flex-col">
                                            <p className="font-black text-slate-900 text-lg uppercase tracking-tight">{assignment.buyer.name}</p>
                                            <p className="text-sm text-slate-500 font-medium mb-3">{assignment.buyer.location}</p>
                                            <a href={`https://wa.me/${assignment.buyer.whatsapp.replace(/\D/g, '')}`} className="inline-flex items-center gap-2 text-[#05DF72] font-black text-xs hover:underline">
                                                <PhoneIcon size={14} /> WhatsApp Buyer
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Description</p>
                                        <p className="font-bold text-slate-900">{assignment.item}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirmation Code</p>
                                        <p className="text-xl font-black text-[#05DF72] tracking-[0.2em]">{assignment.confirmationCode}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 border border-slate-100/50"></div>
                        </div>

                        {/* Status Update Control */}
                        <div className="bg-slate-900 rounded-[3rem] p-8 text-white">
                            <h3 className="font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                                <Navigation2Icon size={16} className="text-[#05DF72]" /> Update Progress
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {steps.map((step) => {
                                    const status = getStepStatus(step.key)
                                    return (
                                        <button
                                            key={step.key}
                                            disabled={status !== 'next'}
                                            onClick={() => updateStatus(step.key, step.label)}
                                            className={`flex items-center gap-4 p-5 rounded-2xl transition-all text-left ${status === 'completed' ? 'bg-[#05DF72]/10 border border-[#05DF72]/20 text-[#05DF72]' :
                                                status === 'next' ? 'bg-white/10 border border-white/10 text-white hover:bg-white/20' :
                                                    'bg-white/5 border border-white/5 text-white/30 cursor-not-allowed'
                                                }`}
                                        >
                                            <step.icon size={20} />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{status === 'completed' ? 'Done' : 'Update'}</span>
                                                <span className="font-bold text-sm">{step.label}</span>
                                            </div>
                                            {status === 'completed' && <CheckCircleIcon size={18} className="ml-auto" />}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#05DF72] rounded-[2rem] p-8 text-slate-900 shadow-2xl shadow-[#05DF72]/20">
                            <ShieldCheckIcon size={40} className="mb-4" />
                            <h3 className="text-xl font-black leading-tight mb-2">Security Handover</h3>
                            <p className="text-sm font-bold opacity-80 leading-relaxed mb-6">
                                Always verify the Confirmation Code with the buyer before handing over the item. Do not leave the battery at the doorstep without verification.
                            </p>
                            <div className="bg-white/20 p-4 rounded-xl border border-white/20">
                                <p className="text-[10px] font-black uppercase tracking-widest mb-1">Warning</p>
                                <p className="text-xs font-bold leading-tight flex items-center gap-2">
                                    <AlertCircleIcon size={12} /> Record every pickup on camera if possible.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl">
                            <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-400 mb-4">Route Info</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-2"></div>
                                    <p className="text-xs font-medium text-slate-500 italic">"Pickup at the main gate of Ikeja Industrial Estate. Ask for Adebayo."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
