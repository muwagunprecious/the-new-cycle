'use client'

const ProductDescription = ({ product }) => {
    return (
        <div className="my-12">
            {/* Tab Bar */}
            <div className="flex items-center gap-6 sm:gap-12 border-b border-slate-200 overflow-x-auto no-scrollbar mb-8">
                <div className="pb-3 px-3 font-bold text-xs uppercase tracking-wider transition-colors border-b-2 -mb-[2px] border-[#05DF72] text-[#05DF72] relative whitespace-nowrap">
                    Specifications
                </div>
            </div>

            {/* Specifications Content */}
            <div className="mt-8 min-h-[160px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-6 sm:p-8 rounded-sm border border-slate-200/80 shadow-sm">
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Model capacity</span>
                        <p className="font-semibold text-slate-900 text-sm">{product.amps} Ah</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Battery Technology</span>
                        <p className="font-semibold text-slate-900 text-sm">{product.batteryType}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Condition</span>
                        <p className="font-semibold text-amber-600 text-sm">{product.condition}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">GoCycle Verified</span>
                        <p className="font-semibold text-emerald-600 text-sm">Yes</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDescription
