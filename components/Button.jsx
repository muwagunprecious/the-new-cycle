'use client'

import React from 'react'

const Button = ({
    children,
    onClick,
    loading = false,
    loadingText = "Loading...",
    disabled = false,
    variant = "primary", // primary, secondary, outline, ghost
    className = "",
    type = "button"
}) => {

    const baseStyles = "relative flex items-center justify-center gap-2 px-8 py-4 font-black rounded-2xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden uppercase tracking-wider text-xs active:scale-95"

    const variants = {
        primary: "bg-[#05DF72] text-white hover:bg-[#04b35c] shadow-xl shadow-[#05DF72]/20",
        secondary: "bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-900/10",
        outline: "border-2 border-slate-200 text-slate-900 hover:border-[#05DF72] hover:text-[#05DF72] bg-white",
        ghost: "text-slate-600 hover:bg-slate-100",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-500/20"
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            aria-busy={loading}
        >
            {loading ? (
                <>
                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-medium">{loadingText}</span>
                </>
            ) : (
                children
            )}
        </button>
    )
}

export default Button
