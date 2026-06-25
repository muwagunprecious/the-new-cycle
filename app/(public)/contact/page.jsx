'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { assets } from '@/assets/assets'
import toast from 'react-hot-toast'
import { Loader2, CheckCircle2, Send } from 'lucide-react'

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
        <div className="min-h-screen bg-[#0f172a] text-white pt-24 pb-32 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Decorative background blurs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#05DF72]/5 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-800/10 rounded-full blur-[100px] pointer-events-none -ml-40 -mb-20"></div>

            <div className="max-w-3xl w-full px-4 md:px-8 relative z-10">
                {/* Header Section */}
                <div className="text-center space-y-6 mb-12">
                    <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 w-fit px-4 py-2 rounded-full backdrop-blur-md mx-auto">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#05DF72] animate-pulse"></div>
                        <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#05DF72]">
                            Get in Touch
                        </span>
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                        Let's build a <br />
                        <span className="bg-gradient-to-r from-[#05DF72] to-[#00f28f] bg-clip-text text-transparent">
                            greener future
                        </span>
                    </h1>
                    
                    <div className="flex flex-col items-center justify-center gap-3 mt-8">
                        <div className="flex items-center justify-center">
                            {/* Profile Images overlap */}
                            <div className="w-12 h-12 rounded-full border-4 border-[#0f172a] overflow-hidden -mr-3 relative z-30 bg-slate-800">
                                {assets.profile_pic1 && <Image src={assets.profile_pic1} alt="Expert 1" width={48} height={48} className="object-cover w-full h-full" />}
                            </div>
                            <div className="w-12 h-12 rounded-full border-4 border-[#0f172a] overflow-hidden -mr-3 relative z-20 bg-slate-800">
                                {assets.profile_pic2 && <Image src={assets.profile_pic2} alt="Expert 2" width={48} height={48} className="object-cover w-full h-full" />}
                            </div>
                            <div className="w-12 h-12 rounded-full border-4 border-[#0f172a] overflow-hidden -mr-3 relative z-10 bg-slate-800">
                                {assets.profile_pic3 && <Image src={assets.profile_pic3} alt="Expert 3" width={48} height={48} className="object-cover w-full h-full" />}
                            </div>
                            <div className="w-12 h-12 rounded-full border-4 border-[#0f172a] overflow-hidden relative z-0 bg-[#05DF72]/10 border-[#05DF72]/20 flex items-center justify-center text-[#05DF72] font-extrabold text-sm shadow-sm">
                                +3
                            </div>
                        </div>
                        <p className="text-slate-400 font-light text-base tracking-wide">Our circular economy experts are ready to assist you</p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[32px] p-8 md:p-12 shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#05DF72]/5 rounded-full blur-[60px] pointer-events-none"></div>

                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                            <div className="w-20 h-20 bg-[#05DF72]/10 text-[#05DF72] border border-[#05DF72]/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(5,223,114,0.15)] animate-bounce">
                                <CheckCircle2 size={44} className="stroke-[1.5]" />
                            </div>
                            <h3 className="text-3xl font-bold text-white tracking-tight">Message Sent!</h3>
                            <p className="text-lg text-slate-400 max-w-md font-light">Thank you for reaching out. One of our experts will get back to you shortly.</p>
                            <button 
                                onClick={() => setIsSuccess(false)} 
                                className="mt-8 px-8 py-4 bg-[#05DF72] text-[#0f172a] rounded-2xl font-bold hover:bg-white hover:text-black transition-all hover:scale-[1.02] duration-300 shadow-[0_4px_20px_rgba(5,223,114,0.25)]"
                            >
                                Send Another Message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">First Name<span className="text-[#05DF72] ml-0.5">*</span></label>
                                    <input 
                                        type="text" 
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#05DF72]/30 focus:border-[#05DF72] transition-all text-white placeholder:text-slate-600 font-light"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Last Name<span className="text-[#05DF72] ml-0.5">*</span></label>
                                    <input 
                                        type="text" 
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#05DF72]/30 focus:border-[#05DF72] transition-all text-white placeholder:text-slate-600 font-light"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Email Address<span className="text-[#05DF72] ml-0.5">*</span></label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#05DF72]/30 focus:border-[#05DF72] transition-all text-white placeholder:text-slate-600 font-light"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Organization</label>
                                    <input 
                                        type="text" 
                                        name="organization"
                                        value={formData.organization}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#05DF72]/30 focus:border-[#05DF72] transition-all text-white placeholder:text-slate-600 font-light"
                                        placeholder="Your Company (Optional)"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Phone Number<span className="text-[#05DF72] ml-0.5">*</span></label>
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#05DF72]/30 focus:border-[#05DF72] transition-all text-white placeholder:text-slate-600 font-light"
                                        placeholder="+234 XXX XXXX"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Message<span className="text-[#05DF72] ml-0.5">*</span></label>
                                <textarea 
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#05DF72]/30 focus:border-[#05DF72] transition-all text-white placeholder:text-slate-600 resize-none font-light"
                                    placeholder="How can we help you today?"
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-[#05DF72] text-[#0f172a] rounded-2xl py-5 font-bold text-lg hover:bg-white hover:text-black hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(5,223,114,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed duration-300"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="animate-spin" size={24} /> Sending...</>
                                ) : (
                                    <><Send size={20} className="stroke-[2]" /> Send Message</>
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

