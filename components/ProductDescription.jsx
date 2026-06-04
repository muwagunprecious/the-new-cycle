'use client'

const ProductDescription = ({ product }) => {
    return (
        <div className="my-16">
            {/* Tab Bar */}
            <div className="flex items-center gap-6 sm:gap-12 border-b border-slate-100 overflow-x-auto no-scrollbar">
                <div className="pb-4 sm:pb-6 text-[10px] sm:text-sm font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] relative whitespace-nowrap text-slate-900 border-b-2 border-emerald-500">
                    Specifications
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
            </div>

            {/* Specifications Content */}
            <div className="mt-12 min-h-[200px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 bg-slate-50 p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100">
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Model capacity</span>
                        <p className="font-black text-slate-900">{product.amps} Ah</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Battery Technology</span>
                        <p className="font-black text-slate-900">{product.batteryType}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Current Condition</span>
                        <p className="font-black text-slate-900 text-amber-600">{product.condition}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">GoCycle Verified</span>
                        <p className="font-black text-emerald-600">Yes</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDescription
