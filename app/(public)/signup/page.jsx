'use client'
import { useState } from "react"
import { useDispatch } from "react-redux"
import { signup } from "@/lib/features/auth/authSlice"
import { useRouter } from "next/navigation"
import { ShieldCheckIcon, UserIcon, MailIcon, LockIcon, PhoneIcon, UserCircleIcon, BriefcaseIcon } from "lucide-react"
import Link from "next/link"
import { addNotification } from "@/lib/features/notification/notificationSlice"
import toast from "react-hot-toast"

import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"
import Button from "@/components/Button"

export default function SignupPage() {
    const dispatch = useDispatch()
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        whatsapp: '',
        role: 'BUYER'
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsLoading(true)
        dispatch(showLoader("Creating your account..."))

        setTimeout(() => {
            try {
                dispatch(signup(formData))

                // System Notification for Admin
                dispatch(addNotification({
                    userId: 'user_admin',
                    title: 'New User Registered',
                    message: `${formData.name} joined as a ${formData.role}.`,
                    type: 'SYSTEM'
                }))

                dispatch(hideLoader())
                setIsLoading(false)
                toast.success(`Welcome to GoCycle, ${formData.name}!`)

                // Redirect based on role
                if (formData.role === 'BUYER') router.push('/buyer')
                else router.push('/seller')

            } catch (error) {
                dispatch(hideLoader())
                setIsLoading(false)
                toast.error(error.message)
            }
        }, 2000)
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-slate-900 p-10 text-white relative h-48 flex flex-col justify-end">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-[#05DF72] mb-2 font-black uppercase tracking-widest text-[10px]">
                            <ShieldCheckIcon size={16} /> Secure Registration
                        </div>
                        <h1 className="text-4xl font-black">Join <span className="text-[#05DF72]">GoCycle</span></h1>
                    </div>
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-[#05DF72]/10 rounded-full blur-[80px]"></div>
                </div>

                <form className="p-10 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <span className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Full Name</span>
                            <div className="relative">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input required type="text" placeholder="John Doe" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                        </div>

                        <div className="relative">
                            <span className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Account Type</span>
                            <div className="flex bg-slate-50 p-1 rounded-2xl">
                                <button type="button" onClick={() => setFormData({ ...formData, role: 'BUYER' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${formData.role === 'BUYER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                                    <UserCircleIcon size={16} /> Buyer
                                </button>
                                <button type="button" onClick={() => setFormData({ ...formData, role: 'SELLER' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${formData.role === 'SELLER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                                    <BriefcaseIcon size={16} /> Seller
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <span className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Email Address</span>
                        <div className="relative">
                            <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input required type="email" placeholder="john@example.com" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                    </div>

                    <div className="relative">
                        <span className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">WhatsApp Number</span>
                        <div className="relative">
                            <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input required type="tel" placeholder="+234..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} />
                        </div>
                    </div>

                    <div className="relative">
                        <span className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Create Password</span>
                        <div className="relative">
                            <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input required type="password" placeholder="••••••••" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        loading={isLoading}
                        loadingText="Regsitering..."
                        className="w-full !py-5 shadow-2xl shadow-[#05DF72]/20 mt-4"
                    >
                        Create {formData.role.charAt(0) + formData.role.slice(1).toLowerCase()} Account
                    </Button>

                    <p className="text-center text-sm text-slate-400 font-medium mt-6">
                        Already have an account? <Link href="/login" className="text-[#05DF72] font-black hover:underline ml-1">Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
