import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function DashboardsShowcase() {
    return (
        <section className="py-20 max-container space-y-12 overflow-hidden">
            
            {/* Seller Card */}
            <div className="group/card bg-white hover:bg-[#05DF72] hover:border-[#05DF72] transition-all duration-500 rounded-sm p-8 md:p-14 relative overflow-hidden flex flex-col-reverse md:flex-row items-center gap-12 shadow-sm border border-slate-200">
                
                {/* Content Left */}
                <div className="flex-1 space-y-6 z-10 md:max-w-2xl flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 bg-[#05DF72]/10 border border-[#05DF72]/20 text-[#05DF72] group-hover/card:bg-slate-950 group-hover/card:text-white group-hover/card:border-transparent rounded-sm px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase w-fit transition-all duration-500">
                        <span>Start Selling</span>
                    </div>
                    
                    <h2 className="text-2xl md:text-4xl font-bold text-slate-900 group-hover/card:text-slate-950 leading-[1.2] tracking-tight transition-colors duration-500">
                        List batteries in three easy steps from automobile, Home & Business, Power, Inverters | EVs etc.
                    </h2>
                    
                    <p className="text-sm md:text-base text-slate-500 group-hover/card:text-slate-900 font-normal leading-relaxed max-w-lg transition-colors duration-500">
                        Trade with vetted buyers, use our dynamic pricing engine and get paid, securely.
                    </p>
                    
                    <div className="pt-2">
                        <Link href="/signup" className="group border border-slate-200 bg-white text-slate-800 group-hover/card:bg-slate-950 group-hover/card:text-white group-hover/card:border-transparent px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-500 inline-flex items-center gap-2 w-fit">
                            Get Started <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Image Right */}
                <div className="flex-1 w-full relative h-[220px] md:h-[420px] pointer-events-none">
                    <img 
                        src="/images/seller-dashboard-mockup.png" 
                        alt="Go-cycle Seller Dashboard" 
                        className="absolute right-0 md:-right-6 top-1/2 -translate-y-1/2 w-[120%] max-w-none md:w-[130%] object-contain drop-shadow-md transition-transform duration-1000 origin-right group-hover/card:scale-[1.02]"
                    />
                </div>
            </div>

            {/* Buyer Card */}
            <div className="group/card bg-white hover:bg-[#05DF72] hover:border-[#05DF72] transition-all duration-500 rounded-sm p-8 md:p-14 relative overflow-hidden flex flex-col-reverse md:flex-row items-center gap-12 shadow-sm border border-slate-200">
                
                {/* Content Left */}
                <div className="flex-1 space-y-6 z-10 md:max-w-2xl flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 bg-[#05DF72]/10 border border-[#05DF72]/20 text-[#05DF72] group-hover/card:bg-slate-950 group-hover/card:text-white group-hover/card:border-transparent rounded-sm px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase w-fit transition-all duration-500">
                        <span>Start Buying</span>
                    </div>
                    
                    <h2 className="text-2xl md:text-4xl font-bold text-slate-900 group-hover/card:text-slate-950 leading-[1.2] tracking-tight transition-colors duration-500">
                        Sign up and get vetted to become a verified buyer on our platform and access diverse batteries by types, chemistry, volume and location.
                    </h2>
                    
                    <div className="pt-2">
                        <Link href="/signup" className="group border border-slate-200 bg-white text-slate-800 group-hover/card:bg-slate-950 group-hover/card:text-white group-hover/card:border-transparent px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-500 inline-flex items-center gap-2 w-fit">
                            Become a Buyer <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Image Right */}
                <div className="flex-1 w-full relative h-[220px] md:h-[420px] pointer-events-none">
                    <img 
                        src="/images/buyer-dashboard-mockup.png" 
                        alt="Go-cycle Buyer Dashboard" 
                        className="absolute right-0 md:-right-6 top-1/2 -translate-y-1/2 w-[120%] max-w-none md:w-[130%] object-contain drop-shadow-md transition-transform duration-1000 origin-right group-hover/card:scale-[1.02]"
                    />
                </div>
            </div>

        </section>
    );
}
