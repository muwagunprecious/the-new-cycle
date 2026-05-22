'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { assets } from '@/assets/assets'
// Removed server action import; using API route
import toast from 'react-hot-toast'
import { Loader2, CheckCircle2 } from 'lucide-react'

const ContactPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        organization: '',
        phone: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            const res = await response.json()
            if (response.ok && res.success) {
                toast.success(res.message)
                setIsSuccess(true)
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    organization: '',
                    phone: '',
                    message: '',
                })
            } else {
                toast.error(res.message || 'Failed to send message')
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#00D166] pt-24 pb-32 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Decorative background blurs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/[0.05] rounded-full blur-[120px] pointer-events-none -mr-40 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-black/[0.02] rounded-full blur-[100px] pointer-events-none -ml-40 -mb-20"></div>

            <div className="max-w-3xl w-full px-4 md:px-8 relative z-10">
                {/* Header Section */}
                <div className="text-center space-y-6 mb-12">
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">Contact Us</h1>
                    
                    <div className="flex flex-col items-center justify-center gap-4 mt-8">
                        <div className="flex items-center justify-center">
                            {/* Profile Images overlap */}
                            <div className="w-14 h-14 rounded-full border-4 border-[#00D166] overflow-hidden -mr-4 relative z-30 bg-slate-200">
                                {assets.profile_pic1 && <Image src={assets.profile_pic1} alt="Expert 1" width={56} height={56} className="object-cover w-full h-full" />}
                            </div>
                            <div className="w-14 h-14 rounded-full border-4 border-[#00D166] overflow-hidden -mr-4 relative z-20 bg-slate-300">
                                {assets.profile_pic2 && <Image src={assets.profile_pic2} alt="Expert 2" width={56} height={56} className="object-cover w-full h-full" />}
                            </div>
                            <div className="w-14 h-14 rounded-full border-4 border-[#00D166] overflow-hidden -mr-4 relative z-10 bg-slate-400">
                                {assets.profile_pic3 && <Image src={assets.profile_pic3} alt="Expert 3" width={56} height={56} className="object-cover w-full h-full" />}
                            </div>
                            <div className="w-14 h-14 rounded-full border-4 border-[#00D166] overflow-hidden relative z-0 bg-white flex items-center justify-center text-[#00D166] font-bold text-lg shadow-sm">
                                +3
                            </div>
                        </div>
                        <p className="text-white/90 font-medium text-lg tracking-wide">experts to help you</p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-2xl shadow-black/10">
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                            <div className="w-20 h-20 bg-emerald-50 text-[#00D166] rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 size={48} />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900">Message Sent!</h3>
                            <p className="text-lg text-slate-500 max-w-md">Thank you for reaching out. One of our experts will get back to you shortly.</p>
                            <button onClick={() => setIsSuccess(false)} className="mt-8 px-8 py-4 bg-[#00D166] text-white rounded-full font-bold hover:bg-[#00a350] transition-colors">
                                Send Another Message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">First Name<span className="text-rose-500">*</span></label>
                                    <input 
                                        type="text" 
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#00D166]/50 focus:border-[#00D166] transition-all"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Last Name<span className="text-rose-500">*</span></label>
                                    <input 
                                        type="text" 
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#00D166]/50 focus:border-[#00D166] transition-all"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Email Address<span className="text-rose-500">*</span></label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#00D166]/50 focus:border-[#00D166] transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Organization</label>
                                    <input 
                                        type="text" 
                                        name="organization"
                                        value={formData.organization}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#00D166]/50 focus:border-[#00D166] transition-all"
                                        placeholder="Your Company (Optional)"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Phone Number<span className="text-rose-500">*</span></label>
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#00D166]/50 focus:border-[#00D166] transition-all"
                                        placeholder="+234 XXX XXXX"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Message<span className="text-rose-500">*</span></label>
                                <textarea 
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#00D166]/50 focus:border-[#00D166] transition-all resize-none"
                                    placeholder="How can we help you today?"
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-[#00D166] text-white rounded-2xl py-5 font-bold text-lg hover:bg-[#00a350] hover:shadow-lg hover:shadow-[#00D166]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="animate-spin" size={24} /> Sending...</>
                                ) : (
                                    "Send Message"
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ContactPage
