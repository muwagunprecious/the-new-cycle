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

    const baseStyles = "relative flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden shadow-sm"

    const variants = {
        primary: "bg-green-600 text-white hover:bg-green-700 active:scale-95",
        secondary: "bg-gray-900 text-white hover:bg-black active:scale-95",
        outline: "border-2 border-green-600 text-green-600 hover:bg-green-50 active:scale-95",
        ghost: "text-gray-600 hover:bg-gray-100 active:scale-95",
        danger: "bg-red-500 text-white hover:bg-red-600 active:scale-95"
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
