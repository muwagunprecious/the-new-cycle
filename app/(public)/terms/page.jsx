'use client'
import React from 'react'
import { FileText, ShieldCheck, Scale, AlertTriangle, Coins, Truck, Globe, ChevronRight } from 'lucide-react'

const TermsPage = () => {
    const sections = [
        {
            id: "scope",
            icon: Globe,
            title: "I. Scope of the Marketplace Ecosystem",
            content: "Gocycle operates a specialized digital infrastructure designed to facilitate the identification, valuation, and trade of end-of-life (EOL) batteries and electronic waste across Africa. Gocycle acts as an intermediary platform provider. Unless specifically engaged via the 'Sell4me' premium service, Gocycle does not take physical possession, title, or legal ownership of the materials traded. The Platform’s primary functions include participant verification, AI-driven price discovery, secure escrow facilitation, and digital chain-of-custody tracking."
        },
        {
            id: "compliance",
            icon: ShieldCheck,
            title: "II. Registration, Onboarding, and Compliance",
            subsections: [
                {
                    title: "2.1 The Verification Mandate",
                    text: "To ensure the safety and legality of the e-waste value chain, all Merchants must undergo a mandatory Know Your Customer (KYC) and Know Your Business (KYB) validation process. Merchants agree to provide accurate, current, and complete information, including but not limited to: Corporate Registration (CAC) and valid government identification for principal promoters."
                },
                {
                    title: "2.2 Materials handling for market participants",
                    text: "The Merchant acknowledges that handling hazardous electronic waste is a regulated activity. Buyers and Collectors warrant that they possess all necessary environmental permits and operating approvals by Federal, state and local Government agencies."
                }
            ]
        },
        {
            id: "standards",
            icon: Scale,
            title: "III. Listing Standards and Material Representation",
            subsections: [
                {
                    title: "3.1 Seller Obligations",
                    text: "The Seller is solely responsible for the accuracy of their material listings. When creating a listing, the Seller must specify the waste category (e.g., Car and truck battery, Inverter Battery etc ), total units, and the physical condition of the materials. The Seller warrants that the materials are free from undisclosed disputes or questionable ownership and that they have the legal right to transfer ownership via trading."
                },
                {
                    title: "3.2 AI-Powered Price Discovery",
                    text: "Gocycle leverages proprietary AI algorithms to suggest pricing based on real-time market data, commodity index fluctuations, and regional demand. While these suggestions are provided to guide the Seller’s strategy, they do not constitute a guaranteed sale price. The final 'Transaction Value' is established only when a seller enters own pricing value and payment funds are made into Escrow account."
                }
            ]
        },
        {
            id: "finance",
            icon: Coins,
            title: "IV. Financial Governance and the Escrow Model",
            subsections: [
                {
                    title: "4.1 The Secure Escrow Process",
                    text: "To eliminate payment default and fraud, Gocycle employs a 'Payment-Before-Collection' escrow model. Upon the mutual confirmation of a trade, the Buyer is required to deposit the full Transaction Value into a secure Gocycle Escrow account. Once the funds are verified, the inventory enters a 'Trade Locked' status."
                },
                {
                    title: "4.2 The Gocycle 'Take Rate' and Fees",
                    text: "In consideration for providing the marketplace infrastructure, Gocycle shall charge a service fee (the 'Take Rate') totaling 10% of the final Transaction Value. This fee is split equally: 5% Seller Fee: Deducted from the final payout to the Seller. 5% Buyer Fee: Added to the purchase price from the Buyer during checkout."
                }
            ]
        },
        {
            id: "logistics",
            icon: Truck,
            title: "V. Logistics, Title Transfer, and Dispute Resolution",
            subsections: [
                {
                    title: "5.1 The proof of collection",
                    text: "The transfer of ownership occurs through a secure digital 'Token System.' Upon arrival at the Seller’s location, the Buyer must inspect the materials. Once satisfied, the Seller provides a unique Transaction Token to the Buyer."
                },
                {
                    title: "5.2 Dispute Resolution Protocol",
                    text: "If a Buyer finds that the materials significantly deviate from the description, they must not accept the Token. A dispute may be raised within the App. Gocycle’s mediation team will review the 'Smart Transaction Record' to determine a fair resolution."
                }
            ]
        },
        {
            id: "liability",
            icon: AlertTriangle,
            title: "VII. Environmental Liability and Indemnification",
            content: "The Merchant agrees to indemnify, defend, and hold harmless Gocycle and its affiliates from any claims, damages, or regulatory fines arising from the Merchant’s handling of materials. This includes, but is not limited to, environmental spills during transit, improper storage of hazardous waste, or non-compliance with the Basel Convention."
        }
    ]

    return (
        <div className="bg-[#0f172a] text-slate-100 min-h-screen pt-28 pb-32 relative selection:bg-[#05DF72]/30 selection:text-white">
            {/* Background Decor */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#05DF72]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

            <section className="relative py-24 px-4 md:px-8 max-w-[1400px] mx-auto border-b border-slate-800/60">
                <div className="max-w-4xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#05DF72] animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#05DF72]">
                            Governance & Trust
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
                        Merchant Service <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#05DF72] via-emerald-400 to-[#05DF72]">
                            Agreement
                        </span>
                    </h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pt-2">
                        Version 2.0 | Effective March 2026
                    </p>
                </div>
            </section>

            <section className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                    {/* Sidebar Nav */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-3 max-lg:hidden">
                        <div className="p-6 rounded-[24px] bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Table of Contents</p>
                            <nav className="space-y-1">
                                {sections.map(section => (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        className="group flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 transition-all"
                                    >
                                        <span className="truncate">{section.title.split('.')[0]} Section</span>
                                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 text-[#05DF72] transition-all" />
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-8 space-y-16">
                        <div className="max-w-3xl">
                            <p className="text-lg md:text-xl leading-relaxed text-slate-400 font-light border-l-2 border-[#05DF72] pl-6 italic">
                                This Merchant Service Agreement (the "Agreement") is a legally binding contract between Gocycle Limited ("Gocycle"), a company providing a digital marketplace for the circular economy, and the Merchant (the "User," "Seller," or "Buyer") who registers an account on the Gocycle Platform.
                            </p>
                        </div>

                        {sections.map((section) => (
                            <div key={section.id} id={section.id} className="space-y-6 pt-10 border-t border-slate-800/80 scroll-mt-28">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-[#05DF72] shrink-0">
                                        <section.icon size={22} />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{section.title}</h2>
                                </div>

                                <div className="space-y-6 mt-4">
                                    {section.content && (
                                        <p className="text-slate-400 leading-relaxed text-base font-light">
                                            {section.content}
                                        </p>
                                    )}

                                    {section.subsections && (
                                        <div className="grid grid-cols-1 gap-4">
                                            {section.subsections.map((sub, i) => (
                                                <div key={i} className="group p-6 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/80 hover:border-[#05DF72]/20 rounded-2xl transition-all duration-300">
                                                    <h3 className="text-[#05DF72] font-bold text-xs uppercase tracking-wider mb-2">
                                                        {sub.title}
                                                    </h3>
                                                    <p className="text-slate-400 leading-relaxed text-sm font-light group-hover:text-slate-300 transition-colors">
                                                        {sub.text}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="relative bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent border border-red-500/20 p-8 md:p-12 rounded-[28px] space-y-4 shadow-2xl overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[40px]" />
                            <div className="flex items-center gap-3 text-red-400">
                                <AlertTriangle size={24} />
                                <h3 className="font-bold uppercase tracking-wider text-sm">Anti-Circumvention Protocol</h3>
                            </div>
                            <p className="text-slate-400 leading-relaxed text-sm font-light">
                                Any Merchant found using the platform to identify trading partners and subsequently completing the transaction "offline" to avoid service fees will face immediate permanent suspension and may be liable for liquidated damages under this agreement.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default TermsPage

