'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { BatteryCharging, Mail, Twitter, Linkedin, Facebook, ArrowUpRight, Phone, Loader2, MapPin, Globe } from 'lucide-react'
import toast from "react-hot-toast"
import { subscribeNewsletter } from "@/backend-actions/actions/newsletter"
import { getPartners } from "@/backend-actions/actions/partners"

const Footer = () => {
    const currentYear = new Date().getFullYear()
    const [email, setEmail] = useState("")
    const [isSubscribing, setIsSubscribing] = useState(false)
    const [partners, setPartners] = useState([])

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await getPartners()
                if (res.success) setPartners(res.data)
            } catch (error) {
                console.error("Failed to fetch partners:", error)
            }
        }
        fetchPartners()
    }, [])

    const handleSubscribe = async (e) => {
        e.preventDefault()
        if (!email) return toast.error("Please enter your email.")
        setIsSubscribing(true)
        try {
            const res = await subscribeNewsletter(email)
            if (res.success) {
                toast.success(res.message)
                setEmail("")
            } else {
                toast.error(res.message || "Subscription failed.")
            }
        } catch (error) {
            toast.error("Something went wrong.")
        } finally {
            setIsSubscribing(false)
        }
    }

    return (
        <footer className="relative bg-slate-950 border-t border-white/5 pt-32 pb-12 overflow-hidden">
            {/* Visual Accents */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00D166]/[0.03] rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00D166]/[0.02] rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-container relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-24">
                    
                    {/* Brand & Mission */}
                    <div className="lg:col-span-5 space-y-12">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="bg-[#00D166] p-2.5 rounded-2xl shadow-lg shadow-[#00D166]/20 transition-transform group-hover:scale-110 duration-500">
                                <BatteryCharging className="text-white" size={24} />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-white">Go<span className="text-[#00D166]">Cycle</span></span>
                        </Link>
                        
                        <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-md">
                            Gocycle powers Africa’s circular economy through the e-waste marketplace.
                        </p>

                        <div className="flex flex-col gap-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-[#00D166] uppercase tracking-[0.3em]">Official Member of</p>
                                <div className="text-sm font-bold text-slate-200">
                                    Recyclers Association of Nigeria
                                </div>
                            </div>
                            
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-200">
                                    <span className="text-lg">🌍</span> Dayspring estate, surulere Nigeria
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-200">
                                    <Phone size={16} className="text-[#00D166]" /> +234 704-728-3000
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-200">
                                    <Mail size={16} className="text-[#00D166]" /> Hello@Gocyce.Africa
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            {[Twitter, Linkedin, Facebook].map((Icon, i) => (
                                <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-[#00D166] hover:text-white hover:shadow-lg hover:shadow-[#00D166]/20 transition-all duration-500">
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black text-[#00D166] uppercase tracking-[0.3em]">Platform</h4>
                            <ul className="space-y-5">
                                <li><Link href="/shop" className="text-slate-400 hover:text-white font-bold transition-colors flex items-center gap-2 group">Marketplace <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
                                <li><Link href="/trade-process" className="text-slate-400 hover:text-white font-bold transition-colors">Trade Process</Link></li>
                                <li><Link href="/terms" className="text-slate-400 hover:text-white font-bold transition-colors">Terms & Conditions</Link></li>
                                <li><Link href="/sell4me" className="text-slate-400 hover:text-white font-bold transition-colors">Sell4meByGocycle</Link></li>
                                <li><Link href="/blog" className="text-slate-400 hover:text-white font-bold transition-colors">Blog</Link></li>
                                <li><Link href="/faq" className="text-slate-400 hover:text-white font-bold transition-colors">FAQ</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black text-[#00D166] uppercase tracking-[0.3em]">Company</h4>
                            <ul className="space-y-5">
                                <li><Link href="/about" className="text-slate-400 hover:text-white font-bold transition-colors">About Gocycle</Link></li>
                                <li><Link href="/sustainability" className="text-slate-400 hover:text-white font-bold transition-colors">Sustainability Impact</Link></li>
                                <li><Link href="/sourcing-policy" className="text-slate-400 hover:text-white font-bold transition-colors leading-relaxed block pr-4">Responsible sourced material Policy</Link></li>
                                <li><Link href="/contact" className="text-slate-400 hover:text-white font-bold transition-colors">Contact</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-8 col-span-2 md:col-span-1">
                            <h4 className="text-[10px] font-black text-[#00D166] uppercase tracking-[0.3em]">Newsletter</h4>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">Stay ahead with the latest circular economy trends.</p>
                            <form onSubmit={handleSubscribe} className="relative group space-y-4">
                                <div className="relative">
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter email"
                                        className="w-full bg-white/5 border border-white/10 rounded-[20px] py-4 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#00D166]/20 focus:border-[#00D166]/50 transition-all placeholder:text-slate-600"
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00D166] transition-colors" size={18} />
                                </div>
                                <button type="submit" disabled={isSubscribing} className="w-full btn-premium !py-4 flex items-center justify-center gap-2">
                                    {isSubscribing ? <Loader2 size={16} className="animate-spin" /> : "Subscribe Now"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Strategic Partners */}
                {partners.length > 0 && (
                    <div className="py-20 border-t border-white/5 mb-12">
                        <div className="flex flex-col items-center space-y-12">
                            <p className="text-[10px] font-black text-[#00D166] uppercase tracking-[0.4em]">Our Strategic Partners</p>
                            <div className="flex flex-wrap items-center justify-center gap-16 md:gap-24 opacity-50 hover:opacity-100 transition-opacity duration-1000">
                                {partners.map((partner) => (
                                    <img 
                                        key={partner.id} 
                                        src={partner.logo} 
                                        alt={partner.name} 
                                        className="h-8 md:h-10 w-auto object-contain grayscale hover:grayscale-0 brightness-0 invert hover:brightness-100 hover:invert-0 transition-all duration-500 cursor-pointer" 
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                    <p className="text-sm text-slate-500 font-medium">
                        &copy; {currentYear} Go-cycle Africa. All rights reserved.
                    </p>
                    <div className="flex items-center gap-10">
                        <Link href="/privacy" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer

