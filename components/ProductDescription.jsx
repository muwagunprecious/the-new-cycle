'use client'
import { ArrowRight, InfoIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const ProductDescription = ({ product }) => {

    const [selectedTab, setSelectedTab] = useState('Description')

    return (
        <div className="my-12 text-sm text-slate-600">

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                {['Description', 'Seller Info'].map((tab, index) => (
                    <button
                        className={`${tab === selectedTab ? 'border-b-2 border-[#05DF72] text-[#05DF72] font-bold' : 'text-slate-400 font-medium'} px-4 py-2 transition-all`}
                        key={index}
                        onClick={() => setSelectedTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Description */}
            {selectedTab === "Description" && (
                <div className="space-y-4 max-w-xl animate-in fade-in duration-300">
                    <p className="leading-relaxed">{product.description}</p>
                    {product.comments && (
                        <div className="flex items-start gap-2 p-4 bg-amber-50 rounded-xl text-amber-800 text-xs">
                            <InfoIcon size={16} className="mt-0.5 shrink-0" />
                            <div>
                                <span className="font-bold block mb-1">Seller Notes:</span>
                                {product.comments}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Seller Info (Replaces Reviews) */}
            {selectedTab === "Seller Info" && product.store && (
                <div className="flex flex-col gap-4 mt-6 animate-in fade-in duration-300">
                    <div className="flex items-center gap-4">
                        <Image src={product.store.logo || '/placeholder-store.jpg'} alt="" className="size-16 rounded-full border border-slate-200" width={100} height={100} />
                        <div>
                            <p className="font-bold text-slate-900 text-lg">{product.store.name}</p>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Verified Vendor</p>
                        </div>
                    </div>

                    <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2 text-slate-600">
                            <span className="font-bold w-20">Location:</span>
                            <span>{product.store.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <span className="font-bold w-20">Contact:</span>
                            <span>{product.store.contact}</span>
                        </div>
                    </div>

                    <Link href={`/shop/${product.store.username}`} className="mt-4 inline-flex items-center gap-2 text-[#05DF72] font-bold hover:underline">
                        Visit Store Page <ArrowRight size={16} />
                    </Link>
                </div>
            )}
        </div>
    )
}

export default ProductDescription