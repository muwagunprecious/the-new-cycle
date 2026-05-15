import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function DashboardsShowcase() {
    return (
        <section className="py-24 max-container space-y-16 overflow-hidden">
            
            {/* Seller Card */}
            <div className="group/card bg-[#F4FBF7] hover:bg-[#00D166] transition-colors duration-700 rounded-[2.5rem] md:rounded-[3rem] px-8 py-12 md:p-16 relative overflow-hidden flex flex-col-reverse md:flex-row items-center gap-12 shadow-sm border border-[#00D166]/10 hover:shadow-2xl hover:shadow-[#00D166]/20">
                
                {/* Content Left */}
                <div className="flex-1 space-y-8 z-10 md:max-w-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-[#00D166] group-hover/card:bg-white transition-colors duration-700"></div>
                        <span className="text-[#00D166] group-hover/card:text-white transition-colors duration-700 font-bold tracking-widest text-sm uppercase">START SELLING</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-medium text-slate-800 group-hover/card:text-white transition-colors duration-700 leading-[1.2] tracking-tight">
                        List batteries in three easy steps from automobile, Home & Business, Power, Inverters | EVs etc.
                    </h2>
                    
                    <p className="text-lg md:text-xl text-slate-600 group-hover/card:text-white/90 transition-colors duration-700 font-normal leading-relaxed max-w-lg">
                        Trade with vetted buyers, use our dynamic pricing engine and get paid, securely.
                    </p>
                    
                    <div className="pt-6">
                        <Link href="/signup" className="group inline-flex items-center justify-between gap-6 bg-white text-slate-900 pl-8 pr-3 py-3 rounded-full font-bold text-lg shadow-xl shadow-[#00D166]/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                            Sign up 
                            <div className="w-12 h-12 rounded-full bg-[#00D166]/10 text-[#00D166] flex items-center justify-center group-hover:bg-[#00D166] group-hover:text-white transition-colors duration-500 shadow-inner">
                                <ArrowRight size={20} />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Image Right */}
                <div className="flex-1 w-full relative h-[250px] md:h-[500px] pointer-events-none">
                    <img 
                        src="/images/seller-dashboard-mockup.png" 
                        alt="Go-cycle Seller Dashboard" 
                        className="absolute right-0 md:-right-10 top-1/2 -translate-y-1/2 w-[130%] max-w-none md:w-[140%] object-contain drop-shadow-2xl transition-transform duration-1000 origin-right group-hover/card:scale-105"
                    />
                </div>
            </div>

            {/* Buyer Card */}
            <div className="group/card bg-[#F4FBF7] hover:bg-[#00D166] transition-colors duration-700 rounded-[2.5rem] md:rounded-[3rem] px-8 py-12 md:p-16 relative overflow-hidden flex flex-col-reverse md:flex-row items-center gap-12 shadow-sm border border-[#00D166]/10 hover:shadow-2xl hover:shadow-[#00D166]/20">
                
                {/* Content Left */}
                <div className="flex-1 space-y-8 z-10 md:max-w-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-[#00D166] group-hover/card:bg-white transition-colors duration-700"></div>
                        <span className="text-[#00D166] group-hover/card:text-white transition-colors duration-700 font-bold tracking-widest text-sm uppercase">START BUYING</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-slate-800 group-hover/card:text-white transition-colors duration-700 leading-[1.2] tracking-tight">
                        Sign up and get vetted to become a verified buyer on our platform and access diverse batteries by types, chemistry, volume and location.
                    </h2>
                    
                    <div className="pt-6">
                        <Link href="/signup" className="group inline-flex items-center justify-between gap-6 bg-white text-slate-900 pl-8 pr-3 py-3 rounded-full font-bold text-lg shadow-xl shadow-[#00D166]/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                            Sign up 
                            <div className="w-12 h-12 rounded-full bg-[#00D166]/10 text-[#00D166] flex items-center justify-center group-hover:bg-[#00D166] group-hover:text-white transition-colors duration-500 shadow-inner">
                                <ArrowRight size={20} />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Image Right */}
                <div className="flex-1 w-full relative h-[250px] md:h-[500px] pointer-events-none">
                    <img 
                        src="/images/buyer-dashboard-mockup.png" 
                        alt="Go-cycle Buyer Dashboard" 
                        className="absolute right-0 md:-right-10 top-1/2 -translate-y-1/2 w-[130%] max-w-none md:w-[140%] object-contain drop-shadow-2xl transition-transform duration-1000 origin-right group-hover/card:scale-105"
                    />
                </div>
            </div>

        </section>
    )
}
