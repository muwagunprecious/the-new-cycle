'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { getProductById } from "@/backend/actions/product";

export default function Product() {

    const { productId } = useParams();
    const [product, setProduct] = useState();
    const products = useSelector(state => state.product.list);

    useEffect(() => {
        const loadProduct = async () => {
            // 1. Try to find in Redux first (instant)
            const cachedProduct = products.find((p) => p.id === productId);

            if (cachedProduct) {
                setProduct(cachedProduct);
            } else {
                // 2. Fallback to server fetch
                const res = await getProductById(productId);
                if (res.success) {
                    setProduct(res.product);
                }
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

                {/* Breadcrums */}
                <div className="  text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product?.category}
                </div>

                {/* Product Details */}
                {product && (<ProductDetails product={product} />)}

                {/* Description & Reviews */}
                {product && (<ProductDescription product={product} />)}
            </div>
        </div>
    );
}