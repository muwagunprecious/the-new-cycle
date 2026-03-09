'use client'
import React from 'react'
import { FileText, ShieldCheck, Scale, AlertTriangle, Coins, Truck, Globe } from 'lucide-react'

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
        <div className="bg-slate-950 min-h-screen text-slate-300 pb-24 font-medium">
            <section className="relative py-32 px-6 lg:px-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -mr-40 -mt-20"></div>
                <div className="max-w-7xl mx-auto relative z-10 space-y-6">
                    <div className="flex items-center gap-4 text-emerald-500">
                        <FileText size={24} />
                        <h3 className="font-black text-[10px] uppercase tracking-[0.4em]">Governance</h3>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                        Merchant Service <br /><span className="text-emerald-500">Agreement</span>
                    </h1>
                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest pt-4">
                        Version 2.0 | Effective March 2026
                    </p>
                </div>
            </section>

            <section className="px-6 lg:px-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Sidebar Nav */}
                    <div className="lg:col-span-3 lg:sticky lg:top-24 h-fit space-y-2 max-lg:hidden">
                        {sections.map(section => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className="block px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-emerald-500/20 hover:bg-white/5 transition-all text-slate-500 hover:text-emerald-400"
                            >
                                {section.title.split('.')[0]} Section
                            </a>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-9 space-y-20">
                        <div className="prose prose-invert max-w-none">
                            <p className="text-lg leading-relaxed text-slate-400 italic">
                                This Merchant Service Agreement (the "Agreement") is a legally binding contract between Gocycle Limited ("Gocycle"), a company providing a digital marketplace for the circular economy, and the Merchant (the "User," "Seller," or "Buyer") who registers an account on the Gocycle Platform.
                            </p>
                        </div>

                        {sections.map((section) => (
                            <div key={section.id} id={section.id} className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-emerald-500 border border-white/10 shrink-0">
                                        <section.icon size={24} />
                                    </div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">{section.title}</h2>
                                </div>

                                <div className="pl-18 space-y-6">
                                    {section.content && (
                                        <p className="text-slate-400 leading-relaxed text-lg">
                                            {section.content}
                                        </p>
                                    )}

                                    {section.subsections && section.subsections.map((sub, i) => (
                                        <div key={i} className="space-y-4">
                                            <h3 className="text-emerald-500 font-black text-xs uppercase tracking-widest">
                                                {sub.title}
                                            </h3>
                                            <p className="text-slate-400 leading-relaxed">
                                                {sub.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-12 rounded-[2.5rem] space-y-6">
                            <div className="flex items-center gap-4 text-emerald-500">
                                <AlertTriangle size={24} />
                                <h3 className="font-black uppercase tracking-widest text-sm">Anti-Circumvention</h3>
                            </div>
                            <p className="text-slate-300 leading-relaxed">
                                Any Merchant found using the platform to identify trading partners and subsequently completing the transaction "offline" to avoid service fees will face immediate permanent suspension and may be liable for liquidated damages.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default TermsPage
