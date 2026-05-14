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
        <div className="bg-white min-h-screen pt-24 pb-32">
            <section className="relative py-24 px-4 md:px-8 max-w-[1400px] mx-auto border-b border-slate-100">
                <div className="max-w-4xl space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#00D166]"></div>
                        <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#00D166]">
                            Governance
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-medium text-slate-900 tracking-[-0.02em] leading-[1.1]">
                        Merchant Service <br /><span className="text-[#00D166]">Agreement</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest pt-4">
                        Version 2.0 | Effective March 2026
                    </p>
                </div>
            </section>

            <section className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                    {/* Sidebar Nav */}
                    <div className="lg:col-span-3 lg:sticky lg:top-32 h-fit space-y-2 max-lg:hidden">
                        {sections.map(section => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className="block px-6 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest border border-transparent hover:bg-[#F4F6F8] transition-all text-slate-500 hover:text-[#00D166]"
                            >
                                {section.title.split('.')[0]} Section
                            </a>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-9 space-y-20">
                        <div className="max-w-3xl">
                            <p className="text-xl leading-relaxed text-slate-600 font-medium italic">
                                This Merchant Service Agreement (the "Agreement") is a legally binding contract between Gocycle Limited ("Gocycle"), a company providing a digital marketplace for the circular economy, and the Merchant (the "User," "Seller," or "Buyer") who registers an account on the Gocycle Platform.
                            </p>
                        </div>

                        {sections.map((section) => (
                            <div key={section.id} id={section.id} className="space-y-8 pt-8 border-t border-slate-100">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-[#F4F6F8] rounded-2xl flex items-center justify-center text-[#00D166] shrink-0 border border-slate-100">
                                        <section.icon size={28} />
                                    </div>
                                    <h2 className="text-3xl font-medium text-slate-900 tracking-[-0.01em]">{section.title}</h2>
                                </div>

                                <div className="pl-0 md:pl-20 space-y-8">
                                    {section.content && (
                                        <p className="text-slate-600 leading-relaxed text-lg font-medium">
                                            {section.content}
                                        </p>
                                    )}

                                    {section.subsections && section.subsections.map((sub, i) => (
                                        <div key={i} className="space-y-3 bg-[#F4F6F8] p-8 rounded-[32px]">
                                            <h3 className="text-[#00D166] font-bold text-sm uppercase tracking-widest">
                                                {sub.title}
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed font-medium">
                                                {sub.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="bg-[#00D166] p-10 md:p-16 rounded-[40px] space-y-6 shadow-lg mt-12">
                            <div className="flex items-center gap-4 text-white">
                                <AlertTriangle size={28} />
                                <h3 className="font-bold uppercase tracking-widest text-lg">Anti-Circumvention</h3>
                            </div>
                            <p className="text-white/90 leading-relaxed text-xl font-medium">
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
