'use client'

export const Skeleton = ({ className = "" }) => {
    return (
        <div className={`animate-pulse bg-gray-200 rounded-md ${className}`}></div>
    )
}

export const ProductCardSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl mt-2" />
            </div>
        </div>
    )
}

export default Skeleton
