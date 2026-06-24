'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Twitter, Linkedin, Facebook, ArrowUpRight, Phone, Loader2 } from 'lucide-react'
import toast from "react-hot-toast"
import { subscribeNewsletter } from "@/backend-actions/actions/newsletter"
import { assets } from "../assets/assets"

const Footer = () => {
    const currentYear = new Date().getFullYear()
    const [email, setEmail] = useState("")
    const [isSubscribing, setIsSubscribing] = useState(false)
    const partners = []

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
        <footer className="relative bg-slate-950 border-t border-slate-800 pt-20 pb-12 overflow-hidden">
            {/* Visual Accents */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#05DF72]/[0.02] rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#05DF72]/[0.01] rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-container relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-20">
                    
                    {/* Brand & Mission */}
                    <div className="lg:col-span-5 space-y-8">
                        <Link href="/" className="flex items-center gap-3 group w-fit">
                            <div className="bg-[#0c101b] border border-slate-800 p-2 rounded-sm shadow-md transition-transform group-hover:scale-[1.02] duration-500">
                                <Image 
                                    src={assets.gs_logo} 
                                    alt="GoCycle" 
                                    width={140} 
                                    height={40} 
                                    className="w-auto h-10 object-contain invert brightness-200"
                                />
                            </div>
                        </Link>
                        
                        <p className="text-base text-slate-400 font-medium leading-relaxed max-w-md">
                            Gocycle powers Africa’s circular economy through the e-waste marketplace.
                        </p>

                        <div className="flex flex-col gap-4">
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-[#05DF72] uppercase tracking-wider">Official Member of</p>
                                <div className="text-sm font-semibold text-white">
                                    Recyclers Association of Nigeria
                                </div>
                            </div>
                            
                            <div className="space-y-3 pt-3 border-t border-slate-800">
                                <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
                                    <span className="text-sm">🌍</span> Dayspring estate, surulere Nigeria
                                </div>
                                <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
                                    <Phone size={14} className="text-[#05DF72]" /> +234 704-728-3000
                                </div>
                                <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
                                    <Mail size={14} className="text-[#05DF72]" /> Hello@Gocyce.Africa
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            {[
                                { Icon: Twitter, url: 'https://x.com/usegocycle' },
                                { Icon: Linkedin, url: 'https://linkedin.com/company/usegocycle' },
                                { Icon: Facebook, url: 'https://facebook.com/usegocycle' }
                            ].map(({ Icon, url }, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-sm bg-[#0c101b] border border-slate-800 flex items-center justify-center text-slate-400 hover:border-[#05DF72] hover:text-[#05DF72] transition-colors duration-300">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-bold text-[#05DF72] uppercase tracking-wider">Platform</h4>
                            <ul className="space-y-4 text-sm">
                                <li><Link href="/shop" className="text-slate-400 hover:text-white font-medium transition-colors flex items-center gap-1.5 group">Marketplace <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
                                <li><Link href="/trade-process" className="text-slate-400 hover:text-white font-medium transition-colors">Trade Process</Link></li>
                                <li><Link href="/terms" className="text-slate-400 hover:text-white font-medium transition-colors">Terms & Conditions</Link></li>
                                <li><Link href="/sell4me" className="text-slate-400 hover:text-white font-medium transition-colors">Sell4meByGocycle</Link></li>
                                <li><Link href="/blog" className="text-slate-400 hover:text-white font-medium transition-colors">Blog</Link></li>
                                <li><Link href="/faq" className="text-slate-400 hover:text-white font-medium transition-colors">FAQ</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] font-bold text-[#05DF72] uppercase tracking-wider">Company</h4>
                            <ul className="space-y-4 text-sm">
                                <li><Link href="/about" className="text-slate-400 hover:text-white font-medium transition-colors">About Gocycle</Link></li>
                                <li><Link href="/sustainability" className="text-slate-400 hover:text-white font-medium transition-colors">Sustainability Impact</Link></li>
                                <li><Link href="/sourcing-policy" className="text-slate-400 hover:text-white font-medium transition-colors leading-relaxed block pr-4">Responsible sourced material Policy</Link></li>
                                <li><Link href="/contact" className="text-slate-400 hover:text-white font-medium transition-colors">Contact</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-6 col-span-2 md:col-span-1">
                            <h4 className="text-[10px] font-bold text-[#05DF72] uppercase tracking-wider">Newsletter</h4>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">Stay ahead with the latest circular economy trends.</p>
                            <form onSubmit={handleSubscribe} className="relative group space-y-3">
                                <div className="relative">
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter email"
                                        className="w-full bg-[#0c101b] border border-slate-800 rounded-sm py-3 pl-10 pr-4 text-xs font-semibold text-white focus:outline-none focus:border-[#05DF72] transition-all placeholder:text-slate-600"
                                    />
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#05DF72] transition-colors" size={14} />
                                </div>
                                <button type="submit" disabled={isSubscribing} className="w-full bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] text-slate-950 font-bold uppercase tracking-wider py-3 rounded-sm text-xs transition-colors shadow-sm flex items-center justify-center gap-2">
                                    {isSubscribing ? <Loader2 size={14} className="animate-spin" /> : "Subscribe Now"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Strategic Partners */}
                {partners.length > 0 && (
                    <div className="py-12 border-t border-slate-800 mb-10">
                        <div className="flex flex-col items-center space-y-8">
                            <p className="text-[10px] font-bold text-[#05DF72] uppercase tracking-wider">Our Strategic Partners</p>
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
                <div className="text-center md:text-left text-xs text-slate-500 mb-4">
                  This website is currently in <strong>beta testing</strong>. Any bugs should be reported <a href="/contact" className="underline hover:text-[#05DF72] transition-colors">here</a>.
                </div>
                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs text-slate-500 font-medium">
                        &copy; {currentYear} Go-cycle Africa. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8">
                        <Link href="/privacy" className="text-[9px] font-bold text-slate-500 hover:text-white uppercase tracking-wider transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="text-[9px] font-bold text-slate-500 hover:text-white uppercase tracking-wider transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
