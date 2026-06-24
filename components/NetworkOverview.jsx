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
            <div className="bg-slate-50 border border-slate-200/80 rounded-sm p-8 md:p-12 relative overflow-hidden shadow-sm max-w-4xl mx-auto">
                
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-12 text-center text-slate-900">Our Verified Network</h2>
                    </motion.div>
                    
                    <div className="relative max-w-3xl mx-auto pl-4 md:pl-0">
                        {/* The continuous vertical line (background track) */}
                        <div className="absolute left-6 md:left-1/2 top-4 bottom-24 w-1 bg-slate-200 md:-translate-x-1/2 rounded-full"></div>
                        
                        {/* The animated fill line following scroll */}
                        <motion.div 
                            style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
                            className="absolute left-6 md:left-1/2 top-4 bottom-24 w-1 bg-[#05DF72] md:-translate-x-1/2 rounded-full z-0"
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
                                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 bg-[#05DF72] rounded-sm z-10 shadow-sm border border-[#05DF72]/20"></div>

                                {/* Content Card - Flat */}
                                <div className={`ml-12 md:ml-0 md:w-[45%] ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                                    <div className="bg-white border border-slate-200 shadow-sm hover:border-[#05DF72]/40 hover:shadow-md transition-all duration-500 p-6 rounded-sm group">
                                        <div className={`w-10 h-10 rounded-sm bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200/80 mb-4 group-hover:scale-105 transition-transform duration-550 ${index % 2 === 0 ? '' : 'md:ml-auto'}`}>
                                            <step.icon size={20} />
                                        </div>
                                        <h3 className="text-base font-bold tracking-tight mb-1 text-slate-900">{step.title}</h3>
                                        <p className="text-slate-500 text-xs md:text-sm">{step.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Final CTA Node */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative flex items-center justify-center mt-16"
                        >
                            {/* Final Node on Line */}
                            <div className="absolute left-6 md:left-1/2 -translate-x-1/2 -top-8 w-3 h-3 bg-slate-800 rounded-sm z-10 hidden md:block"></div>

                            {/* CTA Glass Box */}
                            <div className="bg-[#0c101b] border border-slate-800 p-8 md:p-10 rounded-sm text-center shadow-lg relative z-10 w-full md:w-5/6 mx-auto ml-12 md:ml-auto overflow-hidden">
                                <h3 className="text-lg md:text-xl font-bold mb-2 tracking-tight text-white">Got busy? We can sell it for you!</h3>
                                <p className="text-slate-400 text-xs md:text-sm mb-6 max-w-sm mx-auto">Let our experts handle the heavy lifting while you get the best value for your e-waste directly to your wallet.</p>
                                <Link href="/sell4me" className="inline-flex items-center justify-center w-full sm:w-auto gap-2 bg-[#05DF72] hover:bg-[#04c865] active:bg-[#03b058] text-slate-950 px-6 py-3 rounded-sm font-bold text-xs uppercase tracking-wider transition-colors shadow-sm">
                                    USE SELL4ME SERVICE <ArrowRight size={14} />
                                </Link>
                            </div>
                        </motion.div>

                    </div>
                </div>

            </div>
        </section>
    )
}
