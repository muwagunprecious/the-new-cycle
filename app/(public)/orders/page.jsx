'use client'
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrdersRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.push('/buyer');
    }, [router]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center">
            <p className="text-slate-500">Redirecting to Dashboard...</p>
        </div>
    )
}