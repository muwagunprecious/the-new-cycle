'use client'
import React, { useState } from 'react'
import { Plus, Minus, Search, MessageSquare } from 'lucide-react'

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
        <div className="bg-white min-h-screen pt-24 pb-32">
            <section className="relative py-24 px-4 md:px-8 max-w-[1400px] mx-auto text-center flex flex-col items-center">
                <div className="max-w-4xl space-y-8 flex flex-col items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#00D166]"></div>
                        <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#00D166]">
                            Help Center
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-medium text-slate-900 tracking-[-0.02em] leading-[1.1]">
                        Frequently Asked <br /><span className="text-[#00D166]">Questions</span>
                    </h1>

                    <div className="max-w-xl w-full relative mt-12 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00D166] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#F4F6F8] border border-slate-200 rounded-[24px] py-5 pl-14 pr-6 text-base font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-[#00D166]/10 focus:border-[#00D166]/40 transition-all outline-none shadow-sm placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </section>

            <section className="px-4 md:px-8 max-w-[1000px] mx-auto">
                <div className="space-y-4">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 shadow-sm rounded-[24px] overflow-hidden transition-all duration-300 hover:border-slate-300">
                                <button
                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                    className="w-full px-6 md:px-10 py-8 flex items-center justify-between text-left transition-colors"
                                >
                                    <span className="text-xl md:text-2xl font-medium text-slate-900 pr-8 leading-snug tracking-tight">{faq.q}</span>
                                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${openIndex === idx ? 'bg-[#00D166] text-white' : 'bg-[#F4F6F8] text-slate-400'}`}>
                                        {openIndex === idx ? <Minus size={18} /> : <Plus size={18} />}
                                    </div>
                                </button>
                                <div className={`px-6 md:px-10 transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-96 pb-10 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <p className="text-slate-600 text-lg leading-relaxed font-medium">
                                        {faq.a}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-24 bg-[#F4F6F8] rounded-[32px] border border-dashed border-slate-300">
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No questions found matching "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="mt-24 px-4 md:px-8 max-w-[1400px] mx-auto">
                <div className="bg-[#00D166] rounded-[40px] p-10 md:p-20 flex flex-col items-center text-center space-y-10 relative overflow-hidden">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm mb-2">
                        <MessageSquare size={32} />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-medium text-white tracking-[-0.02em]">Still have questions?</h2>
                        <p className="text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                            Our support team is here to help you navigate the e-waste marketplace. Connect with us for personalized guidance.
                        </p>
                    </div>
                    <button className="bg-white text-[#00D166] px-10 py-5 rounded-[20px] text-sm font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-transform active:scale-95">
                        Contact Support
                    </button>
                </div>
            </section>
        </div>
    )
}

export default FAQPage
