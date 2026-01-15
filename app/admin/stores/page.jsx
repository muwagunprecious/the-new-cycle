'use client'
import { useState, useEffect } from "react"
import { CheckCircleIcon, XCircleIcon, StoreIcon, SearchIcon, FilterIcon } from "lucide-react"
import Loading from "@/components/Loading"
import toast from "react-hot-toast"
import { getPendingSellers as getPendingStores, approveSeller as approveStore, rejectSeller as rejectStore } from "@/backend/actions/admin"

export default function AdminStores() {
    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)

    const loadStores = async () => {
        const result = await getPendingStores()
        if (result.success) {
            setStores(result.data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        loadStores()
    }, [])

    const handleApprove = async (storeId) => {
        if (!confirm("Approve this store application?")) return
        const result = await approveStore(storeId)
        if (result.success) {
            toast.success("Store approved successfully")
            setStores(stores.filter(s => s.id !== storeId))
        } else {
            toast.error("Failed to approve store")
        }
    }

    const handleReject = async (storeId) => {
        if (!confirm("Reject this store application?")) return
        const result = await rejectStore(storeId)
        if (result.success) {
            toast.success("Store rejected")
            setStores(stores.filter(s => s.id !== storeId))
        } else {
            toast.error("Failed to reject store")
        }
    }

    if (loading) return <Loading />

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Manage <span className="text-[#05DF72]">Stores</span></h1>
                    <p className="text-slate-400 font-bold text-sm">Review and approve vendor applications</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <StoreIcon className="text-[#05DF72]" />
                        Pending Applications <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{stores.length}</span>
                    </h2>
                </div>

                {stores.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        No pending applications
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {stores.map(store => (
                            <div key={store.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400">
                                        {store.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{store.name}</h3>
                                        <p className="text-xs text-slate-500">{store.email}</p>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-[10px] bg-amber-50 text-amber-600 px-2 rounded-full font-bold uppercase tracking-wide">
                                                {store.status}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {new Date(store.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleReject(store.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                                        <XCircleIcon size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleApprove(store.id)}
                                        className="flex items-center gap-2 bg-[#05DF72] text-slate-900 px-4 py-2 rounded-xl font-bold hover:bg-[#04c764] transition-colors shadow-lg shadow-[#05DF72]/20">
                                        <CheckCircleIcon size={18} /> Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}