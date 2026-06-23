import Link from 'next/link'
import Image from 'next/image'
import { assets } from '@/assets/assets'

export const metadata = {
    title: 'Affiliate Portal | GoCycle.ng',
    description: 'Join the GoCycle affiliate program and earn commissions by referring buyers to Nigeria\'s largest e-waste marketplace.',
}

export default function AffiliateLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#05DF72]/20 selection:text-[#05DF72]">
            <nav className="bg-white border-b border-slate-200/80 px-6 py-3.5 sticky top-0 z-40 backdrop-blur-md">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                        <Image 
                            src={assets.gs_logo} 
                            alt="GoCycle" 
                            width={110} 
                            height={28} 
                            className="w-auto h-6 sm:h-7 object-contain transition-transform group-hover:scale-105 duration-500"
                        />
                        <span className="text-slate-650 text-[9px] font-semibold uppercase tracking-wider border border-slate-200 px-1.5 py-0.5 rounded-sm bg-slate-100">
                            Partners
                        </span>
                    </Link>
                    <Link href="/" className="text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-sm bg-white">
                        <span>←</span> Back to main site
                    </Link>
                </div>
            </nav>
            {children}
        </div>

    )
}
