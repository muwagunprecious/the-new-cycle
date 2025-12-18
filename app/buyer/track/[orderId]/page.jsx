'use client'
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
    CheckCircle2Icon,
    CircleIcon,
    PackageCheckIcon,
    TruckIcon,
    HomeIcon,
    UserIcon,
    ShieldCheckIcon,
    ArrowLeftIcon,
    AlertCircleIcon
} from "lucide-react"
import Link from "next/link"

const STEPS = [
    { name: 'Order confirmed', icon: CheckCircle2Icon },
    { name: 'Delivery agent arrived at seller’s location', icon: UserIcon },
    { name: 'On the way to buyer', icon: TruckIcon },
    { name: 'Arrived at buyer’s location', icon: HomeIcon },
    { name: 'Order completed', icon: PackageCheckIcon }
]

import { useDispatch } from "react-redux"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"
import Button from "@/components/Button"

export default function OrderTracking() {
    const { orderId } = useParams()
    const dispatch = useDispatch()
    const [orderData, setOrderData] = useState(null)
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        const saved = localStorage.getItem('active_order')
        if (saved) {
            setOrderData(JSON.parse(saved))
        } else {
            // Mock fallback
            setOrderData({
                id: orderId,
                product: 'Solar Battery 200Ah',
                total: 125000,
                method: 'Pay Now',
                deliveryType: 'Delivery',
                code: '882190',
                status: 'Confirmed',
                date: new Date().toLocaleDateString()
            })
        }
    }, [orderId])

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) {
            const nextStepName = STEPS[currentStep + 1].name
            dispatch(showLoader(`Courier: ${nextStepName}...`))

            setTimeout(() => {
                dispatch(hideLoader())
                setCurrentStep(currentStep + 1)
            }, 800)
        }
    }

    if (!orderData) return null

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-3xl mx-auto">

                <Link href="/buyer" className="inline-flex items-center gap-2 text-slate-500 font-bold text-sm mb-8 hover:text-[#05DF72] transition-colors">
                    <ArrowLeftIcon size={16} /> Back to Dashboard
                </Link>

                <div className="card !p-0 overflow-hidden mb-8">
                    <div className="bg-slate-900 p-10 text-white relative">
                        <div className="relative z-10">
                            <span className="bg-[#05DF72] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Live Tracking</span>
                            <h1 className="text-4xl font-black mb-2">Order {orderData.id}</h1>
                            <p className="text-slate-400 font-medium">Placed on {orderData.date} • {orderData.deliveryType}</p>
                        </div>
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-[#05DF72]/10 rounded-full blur-[80px]"></div>
                    </div>

                    <div className="p-10">
                        <div className="flex flex-col gap-10">
                            {STEPS.map((step, index) => (
                                <div key={index} className="flex gap-6 items-start relative">
                                    {index !== STEPS.length - 1 && (
                                        <div className={`absolute left-[23px] top-10 w-0.5 h-16 ${index < currentStep ? 'bg-[#05DF72]' : 'bg-slate-100'}`}></div>
                                    )}
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${index <= currentStep ? 'bg-[#05DF72] text-white shadow-lg shadow-[#05DF72]/20' : 'bg-slate-100 text-slate-300'}`}>
                                        <step.icon size={24} />
                                    </div>
                                    <div className="pt-2">
                                        <h3 className={`font-bold transition-colors ${index <= currentStep ? 'text-slate-900' : 'text-slate-300'}`}>{step.name}</h3>
                                        <p className="text-sm text-slate-400 font-medium mt-1">
                                            {index === currentStep ? 'In progress...' : index < currentStep ? 'Completed' : 'Pending'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {orderData.deliveryType === 'Delivery' && (
                    <div className="card p-10 bg-slate-900 text-white border-none mb-8 relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-[#05DF72] mb-4">
                                    <ShieldCheckIcon size={24} />
                                    <span className="font-bold uppercase tracking-[0.2em] text-[10px]">Security Protocol</span>
                                </div>
                                <h3 className="text-2xl font-black mb-2">Delivery Confirmation Code</h3>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">Provide this code to the delivery personnel only when you have received your battery in good condition.</p>
                            </div>
                            <div className="bg-white/10 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md">
                                <span className="text-5xl font-black text-[#05DF72] tracking-[0.2em]">{orderData.code}</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#05DF72]/10 rounded-full blur-[100px]"></div>
                    </div>
                )}

                {/* Mock Courier Controls */}
                <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <UserIcon size={24} />
                    </div>
                    <h4 className="font-bold text-blue-900 mb-1">Mock Delivery Controls</h4>
                    <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6">(This section is for demo only)</p>

                    <button
                        onClick={nextStep}
                        disabled={currentStep === STEPS.length - 1}
                        className="btn-primary !bg-blue-600 !hover:bg-blue-700 !shadow-blue-200"
                    >
                        {currentStep === STEPS.length - 1 ? 'Job Completed' : 'Update Next Step'}
                    </button>

                    {currentStep === STEPS.length - 1 && (
                        <div className="mt-6 flex items-center gap-2 text-green-600 font-bold animate-pulse">
                            <CheckCircle2Icon size={20} />
                            Order successfully delivered!
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
