'use client'

const Loading = ({ message, size = '11', color = 'green-600', fullPage = true }) => {
    return (
        <div className={`flex flex-col items-center justify-center ${fullPage ? 'h-[60vh] w-full' : ''}`} suppressHydrationWarning>
            <div
                className={`animate-spin rounded-full border-3 border-gray-200 border-t-${color}`}
                style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
            ></div>
            {message && (
                <p className="mt-4 text-gray-600 font-medium animate-pulse">
                    {message}
                </p>
            )}
        </div>
    )
}

export default Loading