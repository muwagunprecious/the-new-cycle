'use client'
import React, { useState } from 'react'
import { Plus, Minus, Search } from 'lucide-react'

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
        <div className="bg-slate-950 min-h-screen text-slate-300 pb-24">
            <section className="relative py-32 px-6 lg:px-10 overflow-hidden text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] -mt-40"></div>
                <div className="max-w-4xl mx-auto relative z-10 space-y-6">
                    <h3 className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em]">Help Center</h3>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
                        Frequently Asked <br /><span className="text-emerald-500">Questions</span>
                    </h1>

                    <div className="max-w-md mx-auto relative mt-12">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:ring-2 focus:ring-emerald-500/50 transition-all outline-none"
                        />
                    </div>
                </div>
            </section>

            <section className="px-6 lg:px-10">
                <div className="max-w-3xl mx-auto space-y-4">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden transition-all duration-300">
                                <button
                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                    className="w-full px-8 py-8 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                                >
                                    <span className="text-lg font-black text-white uppercase tracking-tight">{faq.q}</span>
                                    {openIndex === idx ? <Minus className="text-emerald-500" /> : <Plus className="text-slate-500" />}
                                </button>
                                <div className={`px-8 transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <p className="text-slate-400 font-medium leading-relaxed">
                                        {faq.a}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-white/10">
                            <p className="text-slate-500 font-bold">No questions found matching "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="mt-32 px-6 lg:px-10">
                <div className="max-w-7xl mx-auto bg-emerald-600 rounded-[3rem] p-12 md:p-20 flex flex-col items-center text-center space-y-8">
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Still have questions?</h2>
                    <p className="text-emerald-50 font-medium max-w-xl">
                        Our support team is here to help you navigate the e-waste marketplace. Connect with us for personalized guidance.
                    </p>
                    <button className="px-10 py-5 bg-white text-emerald-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-50 transition-all shadow-xl active:scale-95">
                        Contact Support
                    </button>
                </div>
            </section>
        </div>
    )
}

export default FAQPage
