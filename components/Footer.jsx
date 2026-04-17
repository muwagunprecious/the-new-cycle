'use client'

import Link from "next/link";
import { Recycle as RecycleIcon, Leaf as LeafIcon, Mail as MailIcon, Phone as PhoneIcon, MapPin as MapPinIcon, Facebook as FacebookIcon, Instagram as InstagramIcon, Twitter as TwitterIcon, Linkedin as LinkedinIcon, ArrowUpRight as ArrowUpRightIcon, Loader2 as Loader2Icon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { subscribeNewsletter } from "@/backend/actions/newsletter";

const Footer = () => {

    const [email, setEmail] = useState("");
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Please enter your email address.");

        setIsSubscribing(true);
        try {
            const res = await subscribeNewsletter(email);
            if (res.success) {
                toast.success(res.message);
                setEmail(""); // clear input space
            } else {
                toast.error(res.message || "Failed to subscribe.");
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubscribing(false);
        }
    };
    const platformLinks = [
        { text: "Marketplace", path: '/marketplace' },
        { text: "Trade Process", path: '/trade-process' },
        { text: "Terms & Conditions", path: '/terms' },
        { text: "Sell4meByGocycle", path: '/sell4me' },
        { text: "Blog", path: '#' },
        { text: "FAQ", path: '/faq' },
    ];

    const companyLinks = [
        { text: "About Gocycle", path: '/about' },
        { text: "Sustainability Impact", path: '/sustainability' },
        { text: "Responsible sourced material Policy", path: '/sourcing-policy' },
    ];

    const socialIcons = [
        { icon: FacebookIcon, link: "#" },
        { icon: InstagramIcon, link: "#" },
        { icon: TwitterIcon, link: "#" },
        { icon: LinkedinIcon, link: "#" },
    ]

    return (
        <footer className="bg-slate-950 pt-32 pb-16 mt-32 relative overflow-hidden text-slate-400 border-t border-white/[0.08]">
            {/* Background Texture Detail */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-[100px] -mr-60 -mt-60"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/[0.02] rounded-full blur-[80px] -ml-40 -mb-40"></div>

            <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">

                    {/* 1. Brand Section */}
                    <div className="space-y-8 pr-6">
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <div className="bg-emerald-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/10 transition-transform group-hover:scale-105">
                                <RecycleIcon className="text-white fill-white" size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-white tracking-tighter leading-none">Go<span className="text-emerald-500">Cycle</span></span>
                                <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-slate-500 mt-1 leading-none">Africa’s e-waste market place</span>
                            </div>
                        </div>
                        <p className="text-[13px] font-normal leading-relaxed opacity-80">
                            Gocycle powers Africa’s circular economy through the e-waste marketplace.
                        </p>
                        <div className="space-y-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3 text-slate-500">
                                <span className="text-emerald-500 opacity-80">🌍</span> Dayspring esatate, surulere Nigeria
                            </div>
                        </div>
                    </div>

                    {/* 2. Platform Links */}
                    <div className="lg:border-l lg:border-white/[0.08] lg:pl-12 space-y-10">
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">Platform</h3>
                        <ul className="space-y-4">
                            {platformLinks.map((link, i) => (
                                <li key={i}>
                                    <Link href={link.path} className="hover:text-emerald-400 text-[13px] font-medium transition-all duration-300 flex items-center gap-2 group">
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 3. Company Links */}
                    <div className="lg:border-l lg:border-white/[0.08] lg:pl-12 space-y-10">
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">Company</h3>
                        <ul className="space-y-4">
                            {companyLinks.map((link, i) => (
                                <li key={i}>
                                    <Link href={link.path} className="hover:text-emerald-400 text-[13px] font-medium transition-all duration-300 flex items-center gap-2 group">
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 4. Contact & Socials */}
                    <div className="lg:border-l lg:border-white/[0.08] lg:pl-12 space-y-10">
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">Contact</h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 text-[13px] font-medium group cursor-pointer text-slate-400">
                                <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center border border-white/[0.05] group-hover:bg-emerald-500/10 transition-colors">
                                    <PhoneIcon size={14} className="text-slate-500 group-hover:text-emerald-400" />
                                </div>
                                <span className="group-hover:text-white transition-colors">+234 704-728-3000</span>
                            </div>
                            <div className="flex items-center gap-4 text-[13px] font-medium group cursor-pointer text-slate-400">
                                <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center border border-white/[0.05] group-hover:bg-emerald-500/10 transition-colors">
                                    <MailIcon size={14} className="text-slate-500 group-hover:text-emerald-400" />
                                </div>
                                <span className="group-hover:text-white transition-colors lowercase">Hello@Gocyce.Africa</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 pt-4">
                            {socialIcons.map((item, i) => (
                                <Link
                                    href={item.link}
                                    key={i}
                                    className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-slate-500 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 transition-all duration-300 group"
                                >
                                    <item.icon size={16} className="group-hover:scale-110 transition-transform" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* 5. Newsletter */}
                    <div className="lg:border-l lg:border-white/[0.08] lg:pl-12 space-y-10">
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">Newsletter</h3>
                        <div className="space-y-5">
                            <p className="text-[12px] font-medium leading-relaxed opacity-60">
                                Stay updated on circular economy trends and marketplace insights.
                            </p>
                            <form onSubmit={handleSubscribe} className='flex bg-white/[0.03] text-[12px] p-1.5 rounded-xl w-full border border-white/[0.08] focus-within:border-emerald-500/40 transition-all'>
                                <input 
                                    className='flex-1 bg-transparent pl-3 outline-none text-white placeholder:text-slate-500 font-medium' 
                                    type="email" 
                                    placeholder='Email address' 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubscribing}
                                    required
                                />
                                <button type="submit" disabled={isSubscribing} className='flex items-center justify-center gap-2 font-bold text-[9px] uppercase tracking-widest bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed'>
                                    {isSubscribing ? <Loader2Icon size={14} className="animate-spin" /> : "Subscribe"}
                                </button>
                            </form>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.3em]">
                        © 2026 GoCycle Limited. All Rights Reserved.
                    </p>
                    <div className="flex items-center gap-8 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        <Link href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
