'use client'

import React from 'react'
import { 
    Home, Info, Battery, Zap, MapPin, 
    Handshake, GraduationCap, LayoutDashboard, 
    ArrowRight, CheckCircle2, Clock, Construction,
    Globe, Phone, ShieldCheck
} from 'lucide-react'
import Link from 'next/link'

const sitemapData = [
    {
        title: "Main Website",
        icon: Globe,
        pages: [
            { name: "Home Landing", href: "/", status: "Complete", icon: Home },
            { name: "How It Works", href: "/trade-process", status: "In Progress", icon: Zap },
            { name: "Drop-off Locations", href: "/marketplace", status: "In Progress", icon: MapPin },
            { name: "About Us", href: "/about", status: "Planned", icon: Info },
            { name: "Sustainability & Edu", href: "/sustainability", status: "Planned", icon: GraduationCap },
        ]
    },
    {
        title: "Services",
        icon: Battery,
        pages: [
            { name: "Individual Collection", href: "/sell4me", status: "In Progress", icon: Zap },
            { name: "Corporate Solutions", href: "/pricing", status: "Planned", icon: ShieldCheck },
            { name: "Bulk Pickup Requests", href: "/signup?role=SELLER", status: "Complete", icon: ArrowRight },
        ]
    },
    {
        title: "Partnerships",
        icon: Handshake,
        pages: [
            { name: "For Businesses", href: "/create-store", status: "In Progress", icon: ShieldCheck },
            { name: "Government Agencies", href: "#", status: "Planned", icon: MapPin },
            { name: "Logistics Partners", href: "#", status: "Planned", icon: Zap },
        ]
    },
    {
        title: "Admin Dashboard",
        icon: LayoutDashboard,
        pages: [
            { name: "Overview Summary", href: "/admin", status: "Complete", icon: LayoutDashboard },
            { name: "Pending Sellers", href: "/admin/approve", status: "Complete", icon: ShieldCheck },
            { name: "User Management", href: "/admin/users", status: "Complete", icon: ShieldCheck },
            { name: "Disputes & Audits", href: "/admin/disputes", status: "Complete", icon: ShieldCheck },
            { name: "Inventory (Pending)", href: "/admin/pending-products", status: "Complete", icon: Battery },
            { name: "Admin Settings", href: "/admin/settings", status: "Complete", icon: ShieldCheck },
        ]
    },
    {
        title: "Support & Legal",
        icon: Phone,
        pages: [
            { name: "Contact Us", href: "#", status: "Planned", icon: Phone },
            { name: "FAQs", href: "/faq", status: "In Progress", icon: Info },
            { name: "Privacy Policy", href: "#", status: "Planned", icon: ShieldCheck },
            { name: "Terms of Service", href: "/terms", status: "In Progress", icon: ShieldCheck },
        ]
    }
]

const StatusBadge = ({ status }) => {
    switch (status) {
        case "Complete":
            return <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider"><CheckCircle2 size={10} /> Complete</span>
        case "In Progress":
            return <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider"><Clock size={10} /> In Progress</span>
        case "Planned":
            return <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full uppercase tracking-wider"><Construction size={10} /> Planned</span>
        default:
            return null
    }
}

const SitemapPage = () => {
    return (
        <div className="p-6 max-w-6xl">
            <div className="mb-10">
                <div className='inline-flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm mb-4'>
                    <div className='w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse'></div>
                    Development Roadmap
                </div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Visual <span className="text-emerald-500">Sitemap</span></h1>
                <p className="text-slate-500 mt-2 max-w-2xl">
                    Navigate through the GoCycle.ng platform architecture. Use this as a guide to track implementation progress and access hidden routes.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sitemapData.map((section, sIndex) => (
                    <div key={sIndex} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                <section.icon size={20} />
                            </div>
                            <h2 className="font-black text-slate-900 uppercase tracking-wider text-sm">{section.title}</h2>
                        </div>
                        <div className="p-4 space-y-2">
                            {section.pages.map((page, pIndex) => (
                                <Link 
                                    href={page.href} 
                                    key={pIndex}
                                    className={`flex items-center justify-between p-3 rounded-2xl transition-all group ${page.href === '#' ? 'cursor-not-allowed opacity-60' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-emerald-500 transition-colors">
                                            <page.icon size={16} />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-950 transition-colors">{page.name}</span>
                                    </div>
                                    <StatusBadge status={page.status} />
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-8 bg-slate-950 rounded-[40px] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h3 className="text-2xl font-bold mb-2 tracking-tight uppercase">Need a new section?</h3>
                        <p className="text-slate-400 max-w-md font-medium uppercase text-xs tracking-widest leading-loose">
                            Our architecture is designed for scalability. Contact the development team to add new recycling modules or logistics features.
                        </p>
                    </div>
                    <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-500/20 active:scale-95 whitespace-nowrap">
                        Request Feature
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SitemapPage
