'use client'
import { useEffect, useState, useCallback } from "react"
import { Mail as MailIcon, RefreshCw as RefreshCwIcon, CheckCircle as CheckCircleIcon, Calendar as CalendarIcon } from "lucide-react"
import { getNewsletterSubscribers } from "@/backend-actions/actions/admin"

function Spinner({ size = 16, className = "" }) {
    return <RefreshCwIcon size={size} className={`animate-spin ${className}`} />
}

export default function AdminNewsletterPage() {
    const [subscribers, setSubscribers] = useState([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [errorMsg, setErrorMsg] = useState(null)

    const fetchSubscribers = useCallback(async () => {
        setLoading(true)
        setErrorMsg(null)
        try {
            const res = await getNewsletterSubscribers(1, 100)
            if (res.success) {
                setSubscribers(res.data.subscribers || [])
                setTotal(res.data.pagination?.total || 0)
            } else {
                setErrorMsg(res.error || "Failed to fetch subscribers")
            }
        } catch (e) {
            console.error("Failed to load subscribers", e)
            setErrorMsg(e.message || "Unknown error")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchSubscribers() }, [fetchSubscribers])

    return (
        <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Marketing & Audience</p>
                    <h1 className="text-3xl font-black text-slate-900">
                        Newsletter <span className="text-[#05DF72]">Subscribers</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        View and manage your mailing list subscribers.
                    </p>
                </div>
                <button
                    onClick={fetchSubscribers}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm"
                >
                    <RefreshCwIcon size={15} className={loading ? "animate-spin" : ""} />
                    Refresh List
                </button>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white max-w-sm relative overflow-hidden shadow-xl shadow-slate-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#05DF72]/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#05DF72]/10 border border-[#05DF72]/20 flex items-center justify-center shrink-0">
                        <MailIcon size={24} className="text-[#05DF72]" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Subscribers</p>
                        <h3 className="text-3xl font-black">{total}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <MailIcon size={18} className="text-[#05DF72]" /> Active Mailing List
                    </h2>
                    {loading && <Spinner size={14} className="text-slate-400" />}
                </div>

                {loading ? (
                    <div className="py-16 text-center text-slate-400 text-sm font-medium flex flex-col items-center gap-2">
                        <Spinner size={24} className="text-[#05DF72]" />
                        Loading list...
                    </div>
                ) : errorMsg ? (
                    <div className="py-20 text-center">
                        <p className="text-xl font-black text-red-500">Error Loading Subscribers</p>
                        <p className="text-slate-500 font-medium mt-2">{errorMsg}</p>
                    </div>
                ) : subscribers.length === 0 ? (
                    <div className="py-20 text-center">
                        <MailIcon size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-xl font-black text-slate-800">No subscribers yet</p>
                        <p className="text-slate-400 font-medium mt-2">People who sign up for your newsletter will appear here.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="p-6 pl-8">Email Address</th>
                                <th className="p-6">Status</th>
                                <th className="p-6">Subscribed On</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {subscribers.map((sub) => (
                                <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-6 pl-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                <MailIcon size={14} className="text-slate-400" />
                                            </div>
                                            <span className="font-bold text-slate-900">{sub.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                                            sub.status === 'active' 
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                : 'bg-slate-50 text-slate-500 border-slate-200'
                                        }`}>
                                            {sub.status === 'active' && <CheckCircleIcon size={10} />}
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-slate-500 text-sm font-medium flex items-center gap-2">
                                        <CalendarIcon size={14} className="text-slate-400" />
                                        {new Date(sub.createdAt).toLocaleDateString('en-NG', { 
                                            year: 'numeric', month: 'short', day: 'numeric', 
                                            hour: '2-digit', minute: '2-digit' 
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
