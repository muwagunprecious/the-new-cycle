import { Suspense } from 'react'
import { Loader } from 'lucide-react'
import PaymentCallbackContent from '@/components/PaymentCallbackClient'

export const dynamic = 'force-dynamic'

export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-10 max-w-md w-full text-center space-y-6 animate-pulse">
                    <div className="flex justify-center">
                        <div className="p-5 bg-emerald-50 rounded-full">
                            <Loader size={40} className="text-emerald-500 animate-spin" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Loading Payment Details</h1>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">Please wait...</p>
                    </div>
                </div>
            </div>
        }>
            <PaymentCallbackContent />
        </Suspense>
    )
}
