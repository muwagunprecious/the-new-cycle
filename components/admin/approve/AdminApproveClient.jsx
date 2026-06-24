'use client'
import StoreInfo from "@/components/admin/StoreInfo"
import { getPendingSellers, approveSeller, rejectSeller } from "@/backend-actions/actions/admin"
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminApproveClient({ initialStores }) {
    const [stores, setStores] = useState(initialStores || [])
    const [loading, setLoading] = useState(false)

    const fetchStores = async () => {
        try {
            const result = await getPendingSellers()
            if (result.success) {
                setStores(result.data)
            } else {
                toast.error(result.error)
            }
        } catch (e) {
            toast.error("Failed to load requests")
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async ({ storeId, status, reason }) => {
        try {
            let result;
            if (status === 'approved') {
                result = await approveSeller(storeId)
            } else {
                result = await rejectSeller(storeId, reason)
            }

            if (result.success) {
                toast.success(`Store ${status}`)
                fetchStores() // Refresh list
            } else {
                toast.error(result.error)
            }
        } catch (e) {
            toast.error("Action failed")
        }
    }

    return !loading ? (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl font-bold text-slate-900">Approve <span className="text-[#05DF72]">Stores</span></h1>
            <p className="text-slate-500 text-xs mt-1">Pending seller store applications.</p>

            {stores.length ? (
                <div className="flex flex-col gap-4 mt-6">
                    {stores.map((store) => (
                        <div key={store.id} className="bg-white border border-slate-200 rounded-sm shadow-sm p-6 flex max-md:flex-col gap-6 md:items-end max-w-4xl" >
                            {/* Store Info */}
                            <StoreInfo store={store} />

                            {/* Actions */}
                            <div className="flex gap-2 pt-2 flex-wrap shrink-0">
                                <button 
                                    onClick={() => toast.promise(handleApprove({ storeId: store.id, status: 'approved' }), { loading: "approving" })} 
                                    className="px-4 py-2 bg-[#05DF72] hover:bg-[#04c764] text-slate-900 font-bold text-xs uppercase tracking-wider rounded-sm transition-colors" 
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => {
                                        const reason = prompt("Enter rejection reason:");
                                        if (reason !== null) {
                                            toast.promise(handleApprove({ storeId: store.id, status: 'rejected', reason }), { loading: 'rejecting' })
                                        }
                                    }}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 border border-slate-700 text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}

                </div>) : (
                <div className="flex items-center justify-center h-80">
                    <h1 className="text-3xl text-slate-400 font-bold">No Applications Pending</h1>
                </div>
            )}
        </div>
    ) : <Loading />
}
