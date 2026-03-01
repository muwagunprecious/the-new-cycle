'use client'
import { ArrowRight, InfoIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const ProductDescription = ({ product }) => {

    const [selectedTab, setSelectedTab] = useState('Description')

    return (
        <div className="my-12 text-sm text-slate-600">

            {/* Content */}
            <div className="mt-8">
                <div className="space-y-4 max-w-xl animate-in fade-in duration-300">
                    <p className="leading-relaxed">{product.description}</p>
                    {product.comments && (
                        <div className="flex items-start gap-2 p-4 bg-amber-50 rounded-xl text-amber-800 text-xs text-slate-400 font-medium">
                            <InfoIcon size={16} className="mt-0.5 shrink-0" />
                            <div>
                                <span className="font-black uppercase tracking-widest block mb-1">Seller Notes:</span>
                                {product.comments}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductDescription