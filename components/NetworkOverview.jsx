'use client'
import { useRef } from 'react';
import { Building2, Car, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion, useScroll } from 'framer-motion';

export default function NetworkOverview() {
    const steps = [
        {
            icon: Building2,
            title: "Home and Business",
            desc: "Individual households and corporate offices."
        },
        {
            icon: Car,
            title: "EV Fleet Operator",
            desc: "E-Bikes, E-Taxis, and commercial fleet operators."
        },
        {
            icon: Trash2,
            title: "Scrap Yard / Aggregator",
            desc: "Local collectors and scrap material aggregators."
        }
    ];

    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    return (
        <section ref={containerRef} className="py-20 max-container overflow-hidden">
            <div className="bg-[#00D166]/[0.04] backdrop-blur-3xl border border-[#00D166]/20 rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden shadow-2xl shadow-[#00D166]/5 max-w-4xl mx-auto">
                
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-[#00D166]/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-[20rem] h-[20rem] bg-[#00D166]/10 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-16 text-center text-slate-900">Our Verified Network</h2>
                    </motion.div>
                    
                    <div className="relative max-w-3xl mx-auto pl-4 md:pl-0">
                        {/* The continuous vertical line (background track) */}
                        <div className="absolute left-6 md:left-1/2 top-4 bottom-24 w-1 bg-[#00D166]/10 md:-translate-x-1/2 rounded-full"></div>
                        
                        {/* The animated fill line following scroll */}
                        <motion.div 
                            style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
                            className="absolute left-6 md:left-1/2 top-4 bottom-24 w-1 bg-[#00D166] md:-translate-x-1/2 rounded-full z-0"
                        ></motion.div>

                        {steps.map((step, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`relative flex items-center mb-12 md:justify-between w-full ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                            >
                                {/* Center Node */}
                                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-[#00D166] rounded-full shadow-[0_0_0_6px_rgba(0,209,102,0.15)] z-10"></div>

                                {/* Content Card - Glassmorphism */}
                                <div className={`ml-12 md:ml-0 md:w-[45%] ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                                    <div className="bg-white/70 backdrop-blur-xl border border-white shadow-xl hover:bg-white hover:shadow-2xl transition-all duration-500 p-6 rounded-[1.5rem] group">
                                        <div className={`w-12 h-12 rounded-xl bg-slate-50 text-[#00D166] flex items-center justify-center shadow-sm mb-4 border border-slate-100 group-hover:scale-110 transition-transform duration-500 ${index % 2 === 0 ? '' : 'md:ml-auto'}`}>
                                            <step.icon size={22} />
                                        </div>
                                        <h3 className="text-lg md:text-xl font-bold tracking-tight mb-1 text-slate-900">{step.title}</h3>
                                        <p className="text-slate-500 text-sm font-medium">{step.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Final CTA Node */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative flex items-center justify-center mt-20"
                        >
                            {/* Final Node on Line */}
                            <div className="absolute left-6 md:left-1/2 -translate-x-1/2 -top-10 w-4 h-4 bg-slate-900 rounded-full shadow-[0_0_0_6px_rgba(15,23,42,0.1)] z-10 hidden md:block"></div>

                            {/* CTA Glass Box */}
                            <div className="bg-slate-950 border border-slate-800 p-8 md:p-10 rounded-[2rem] text-center shadow-2xl relative z-10 w-full md:w-5/6 mx-auto ml-12 md:ml-auto overflow-hidden group">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-[#00D166]/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-[#00D166]/20 transition-colors duration-700"></div>
                                
                                <h3 className="text-xl md:text-2xl font-black mb-3 tracking-tight text-white">Got busy? We can sell it for you!</h3>
                                <p className="text-slate-400 text-sm mb-8 font-medium max-w-sm mx-auto">Let our experts handle the heavy lifting while you get the best value for your e-waste directly to your wallet.</p>
                                <Link href="/sell4me" className="inline-flex items-center justify-center w-full sm:w-auto gap-2 bg-[#00D166] text-white px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#00D166]/20 hover:bg-[#00A350] hover:-translate-y-0.5 transition-all duration-300">
                                    USE SELL4ME SERVICE <ArrowRight size={16} />
                                </Link>
                            </div>
                        </motion.div>

                    </div>
                </div>

            </div>
        </section>
    )
}
