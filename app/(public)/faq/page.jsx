'use client'
import React, { useState } from 'react'
import { Plus, Minus, Search, MessageSquare, HelpCircle, ArrowRight } from 'lucide-react'

const FAQPage = () => {
    const [openIndex, setOpenIndex] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')

    const faqs = [
        {
            q: "What is Gocycle?",
            a: "Gocycle is a digital marketplace that connects businesses and individuals that generate electronic waste and used batteries with verified recycling and collecting companies that can safely process and recover valuable materials."
        },
        {
            q: "Who can use Gocycle?",
            a: "Gocycle is designed for homes, individuals, businesses and organizations such as electronics companies, solar installers, telecom operators, recyclers, waste collectors, and corporate organizations with end-of-life electronics."
        },
        {
            q: "What types of materials can be traded?",
            a: "We are starting with common materials including lithium-ion batteries, lead-acid batteries, solar batteries, telecom batteries, and later on other electronic waste such as solar panels, IT equipment and consumer electronics will be added."
        },
        {
            q: "How does the marketplace work?",
            a: "Sellers list available e-waste or batteries on the platform by type, units, location and AI powered suggested pricing mechanism. Verified buyers review the listings and makes purchase. Once a deal is confirmed, payment is secured through escrow and the materials are collected and delivered using the token system issued to the seller during the process."
        },
        {
            q: "How do sellers earn money?",
            a: "Sellers earn by listing their e-waste or used batteries on the platform where buyers can purchase them at competitive market prices."
        },
        {
            q: "How does payment work?",
            a: "Payments are handled through a secure escrow system. Buyers deposit funds into escrow when a trade is confirmed, and payment is released to the seller after the materials are inspected and collected."
        },
        {
            q: "Who handles the collection and transportation?",
            a: "Gocycle coordinates pickup while the buyer collects the inventory via its own logistics infrastructure. Buyers are trained to handle electronic and hazardous materials safely."
        },
        {
            q: "Why does Gocycle verify users?",
            a: "Verification ensures that all buyers and sellers are legitimate businesses that comply with business KYC, Security and environmental requirements."
        },
        {
            q: "What happens if there is a dispute?",
            a: "Gocycle provides a dispute resolution process where transactions, documentation, and delivery records are reviewed to ensure a fair outcome."
        },
        {
            q: "How does Gocycle help the environment?",
            a: "Gocycle ensures that electronic waste and batteries are safely collected and recycled, reducing environmental pollution and supporting a circular economy."
        },
        {
            q: "How does Gocycle earn money?",
            a: "Gocycle earns money by having a 10% take rate from the sellers and buyers at 5% each on the final value of transactions."
        }
    ]

    const filteredFaqs = faqs.filter(faq =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="bg-[#0f172a] text-white min-h-screen pt-32 pb-36 relative overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#05DF72]/[0.02] rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-20 right-0 w-[500px] h-[500px] bg-[#05DF72]/[0.02] rounded-full blur-[120px] pointer-events-none" />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

            <section className="relative py-20 px-4 md:px-8 max-w-[1400px] mx-auto text-center flex flex-col items-center z-10">
                <div className="max-w-4xl space-y-6 flex flex-col items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#05DF72] animate-pulse"></div>
                        <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#05DF72]">
                            Help Center
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-light text-white tracking-tight leading-[1.05]">
                        Frequently Asked <br />
                        <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#05DF72] to-[#05DF72]/85">
                            Questions
                        </span>
                    </h1>

                    <div className="max-w-xl w-full relative mt-12 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#05DF72] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-[20px] py-4.5 pl-14 pr-6 text-base font-medium text-white focus:bg-slate-900 focus:ring-4 focus:ring-[#05DF72]/10 focus:border-[#05DF72]/30 transition-all outline-none shadow-xl placeholder:text-slate-500"
                        />
                    </div>
                </div>
            </section>

            <section className="px-4 md:px-8 max-w-[900px] mx-auto relative z-10">
                <div className="space-y-4">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, idx) => {
                            const isOpen = openIndex === idx;
                            return (
                                <div 
                                    key={idx} 
                                    className={`bg-slate-900/30 backdrop-blur-sm border transition-all duration-500 rounded-[20px] overflow-hidden ${
                                        isOpen ? 'border-[#05DF72]/30 bg-slate-900/60 shadow-[0_0_25px_rgba(5,223,114,0.02)]' : 'border-slate-800/80 hover:border-slate-700/80'
                                    }`}
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : idx)}
                                        className="w-full px-6 md:px-8 py-6.5 flex items-center justify-between text-left transition-colors"
                                    >
                                        <span className="text-lg md:text-xl font-medium text-white pr-8 leading-snug tracking-tight">
                                            {faq.q}
                                        </span>
                                        <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                                            isOpen ? 'bg-[#05DF72] text-slate-950 rotate-180 shadow-[0_0_15px_rgba(5,223,114,0.4)]' : 'bg-slate-800 text-slate-400 hover:text-white'
                                        }`}>
                                            {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                                        </div>
                                    </button>
                                    <div 
                                        className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                            isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <div className="px-6 md:px-8 pb-7 pt-2 text-slate-400 text-[15px] md:text-base leading-relaxed font-normal border-t border-slate-800/40">
                                            {faq.a}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-20 bg-slate-900/20 rounded-[24px] border border-dashed border-slate-850">
                            <HelpCircle size={36} className="mx-auto text-slate-600 mb-4" />
                            <p className="text-slate-400 font-semibold tracking-wide text-sm">
                                No matching questions found for "{searchQuery}"
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <section className="mt-28 px-4 md:px-8 max-w-[1200px] mx-auto relative z-10">
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-[32px] p-8 md:p-16 flex flex-col items-center text-center space-y-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#05DF72]/[0.02] rounded-full blur-[80px] pointer-events-none" />
                    
                    <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-[#05DF72] shadow-inner">
                        <MessageSquare size={26} />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight">Still have questions?</h2>
                        <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-xl mx-auto">
                            Our support team is on standby to help you navigate the e-waste marketplace. Get in touch for direct assistance.
                        </p>
                    </div>
                    <button className="bg-[#05DF72] hover:bg-[#05DF72]/90 text-slate-950 font-bold px-8 py-3.5 rounded-[16px] text-xs uppercase tracking-widest shadow-[0_4px_20px_rgba(5,223,114,0.2)] hover:shadow-[0_4px_25px_rgba(5,223,114,0.35)] transition-all duration-300 flex items-center gap-2 group hover:scale-[1.02]">
                        Contact Support
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>
        </div>
    )
}

export default FAQPage
