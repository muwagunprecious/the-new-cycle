'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

export default function PaymentCallbackContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const status = searchParams.get('status')
    const txRef = searchParams.get('tx_ref')
    const transactionId = searchParams.get('transaction_id')

    const [state, setState] = useState('verifying') // verifying | success | failed
    const [message, setMessage] = useState('Verifying your payment...')

    useEffect(() => {
        const verify = async () => {
            if (status === 'cancelled' || status === 'failed') {
                setState('failed')
                setMessage('Payment was cancelled or failed. No charge was made.')
                return
            }

            if (!txRef || !transactionId) {
                setState('failed')
                setMessage('Missing payment details. Please contact support.')
                return
            }

            try {
                const res = await fetch('/api/flutterwave/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transaction_id: transactionId, tx_ref: txRef })
                })

                const data = await res.json()

                if (data.success) {
                    setState('success')
                    setMessage('Payment confirmed! Redirecting to your dashboard...')
                    try {
                        const bought = JSON.parse(localStorage.getItem('gocycle_bought_products') || '[]')
                        localStorage.setItem('gocycle_bought_products', JSON.stringify(bought))
                    } catch (e) {}
                    setTimeout(() => router.push('/buyer'), 2500)
                } else {
                    setState('failed')
                    setMessage(data.message || 'Payment verification failed. Contact support if you were charged.')
                }
            } catch (err) {
                console.error('[Callback] Verify error:', err)
                setState('failed')
                setMessage('Could not verify payment. Contact support if you were charged.')
            }
        }

        verify()
    }, [status, txRef, transactionId, router])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-10 max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    {state === 'verifying' && (
                        <div className="p-5 bg-emerald-50 rounded-full">
                            <Loader size={40} className="text-emerald-500 animate-spin" />
                        </div>
                    )}
                    {state === 'success' && (
                        <div className="p-5 bg-emerald-50 rounded-full">
                            <CheckCircle size={40} className="text-emerald-500" />
                        </div>
                    )}
                    {state === 'failed' && (
                        <div className="p-5 bg-red-50 rounded-full">
                            <XCircle size={40} className="text-red-500" />
                        </div>
                    )}
                </div>

                <div>
                    <h1 className="text-2xl font-black text-slate-900">
                        {state === 'verifying' && 'Processing Payment'}
                        {state === 'success' && 'Payment Successful!'}
                        {state === 'failed' && 'Payment Failed'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">{message}</p>
                </div>

                {txRef && (
                    <div className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Transaction Reference</p>
                        <p className="text-xs font-mono text-slate-700 mt-0.5">{txRef}</p>
                    </div>
                )}

                {state === 'failed' && (
                    <div className="space-y-3 pt-2">
                        <button
                            onClick={() => router.push('/buyer')}
                            className="w-full py-3 rounded-2xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition"
                        >
                            Go to Dashboard
                        </button>
                        <button
                            onClick={() => router.back()}
                            className="w-full py-3 rounded-2xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
