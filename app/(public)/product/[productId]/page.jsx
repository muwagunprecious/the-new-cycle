'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getProductById } from "@/backend/actions/product";

// Skeleton shimmer component
function ProductSkeleton() {
    return (
        <div className="flex max-lg:flex-col gap-16 p-6 max-w-7xl mx-auto animate-pulse">
            {/* Left: image area */}
            <div className="flex gap-6 flex-1">
                <div className="flex flex-col gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-20 h-20 bg-slate-200 rounded-2xl" />
                    ))}
                </div>
                <div className="flex-1 bg-slate-100 rounded-[3rem] min-h-[500px]" />
            </div>

            {/* Right: info area */}
            <div className="flex-1 lg:max-w-xl space-y-8">
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="h-7 w-32 bg-slate-200 rounded-full" />
                        <div className="h-7 w-28 bg-slate-200 rounded-full" />
                    </div>
                    <div className="h-12 bg-slate-200 rounded-2xl w-4/5" />
                    <div className="h-5 bg-slate-100 rounded-xl w-full" />
                    <div className="h-5 bg-slate-100 rounded-xl w-3/4" />
                </div>
                <div className="h-10 w-40 bg-slate-200 rounded-xl" />
                <div className="grid grid-cols-2 gap-4 p-8 bg-slate-50 rounded-[2.5rem]">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 w-20 bg-slate-200 rounded" />
                            <div className="h-5 w-28 bg-slate-200 rounded" />
                        </div>
                    ))}
                </div>
                <div className="space-y-3">
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                    <div className="flex gap-3">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="h-14 w-40 bg-slate-200 rounded-2xl" />
                        ))}
                    </div>
                </div>
                <div className="h-16 bg-slate-200 rounded-[2rem] w-full" />
                <div className="h-16 bg-emerald-100 rounded-[2rem] w-full" />
            </div>
        </div>
    )
}

export default function Product() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const products = useSelector(state => state.product.list);

    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            // 1. Try to find in Redux first (instant)
            const cachedProduct = products?.find((p) => p.id === productId);

            if (cachedProduct) {
                setProduct(cachedProduct);
                setLoading(false);
            } else {
                // 2. Fallback to server fetch
                const res = await getProductById(productId);
                if (res.success) {
                    const { success, message, error, ...productData } = res;
                    setProduct(productData);
                }
                setLoading(false);
            }
        }

        if (productId) {
            loadProduct()
        }

        scrollTo(0, 0)
    }, [productId, products]);

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrumb */}
                <div className="text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {loading ? <span className="inline-block w-20 h-4 bg-slate-200 rounded animate-pulse align-middle" /> : product?.category}
                </div>

                {/* Loading skeleton */}
                {loading && <ProductSkeleton />}

                {/* Product Details */}
                {!loading && product && <ProductDetails product={product} />}

                {/* Not found */}
                {!loading && !product && (
                    <div className="text-center py-32 space-y-4">
                        <p className="text-slate-400 font-bold text-lg">Product not found.</p>
                        <a href="/" className="text-emerald-500 font-black text-sm underline">Back to marketplace</a>
                    </div>
                )}

                {/* Description & Tabs */}
                {!loading && product && <ProductDescription product={product} />}
            </div>
        </div>
    );
}