'use client'
import React from 'react'
import toast from 'react-hot-toast';

export default function Banner() {

    const [isOpen, setIsOpen] = React.useState(true);

    const handleClaim = () => {
        setIsOpen(false);
        toast.success('Coupon copied to clipboard!');
        navigator.clipboard.writeText('NEW20');
    };

    return isOpen && (
        <div className="w-full px-6 py-2 font-black text-[10px] uppercase tracking-[0.2em] text-white text-center bg-slate-900 border-b border-white/10 relative z-[70]">
            <div className='flex items-center justify-between max-w-7xl mx-auto'>
                <div className="flex items-center gap-3">
                    <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[8px]">PROMO</span>
                    <p className="hidden sm:block">New Merchant? Get <span className="text-emerald-400">0% Commission</span> on your first 5 sales!</p>
                    <p className="sm:hidden text-emerald-400">0% Merchant Commission</p>
                </div>
                <div className="flex items-center space-x-6">
                    <button onClick={handleClaim} type="button" className="text-slate-900 bg-emerald-400 px-5 py-1.5 rounded-lg hover:bg-emerald-300 transition-colors max-sm:hidden shadow-lg shadow-emerald-400/20">Claim Offer</button>
                    <button onClick={() => setIsOpen(false)} type="button" className="text-white/40 hover:text-white transition-colors">
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};