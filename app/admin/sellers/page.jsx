'use client'
import { getVerifiedSellers, updateSellerWallet } from "@/backend/actions/admin"
import StoreInfo from "@/components/admin/StoreInfo"
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { WalletIcon, PlusIcon, MinusIcon, SearchIcon } from "lucide-react"

export default function AdminSellers() {
    const [sellers, setSellers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const fetchSellers = async () => {
        try {
            const result = await getVerifiedSellers()
            if (result.success) {
                setSellers(result.data)
            } else {
                toast.error(result.error)
            }
        } catch (e) {
            toast.error("Failed to load sellers")
        } finally {
            setLoading(false)
        }
    }

    const handleWalletUpdate = async (storeId, type) => {
        const amountStr = prompt(`Enter amount to ${type === 'CREDIT' ? 'add to' : 'remove from'} wallet:`);
        if (amountStr === null) return;

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Invalid amount");
            return;
        }

        try {
            const result = await updateSellerWallet(storeId, amount, type);
            if (result.success) {
                toast.success(`Wallet updated. New balance: ₦${result.newBalance.toLocaleString()}`);
                fetchSellers();
            } else {
                toast.error(result.error);
            }
        } catch (e) {
            toast.error("Wallet update failed");
        }
    }

    useEffect(() => {
        fetchSellers()
    }, [])

    const filteredSellers = sellers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return !loading ? (
        <div className="text-slate-500 mb-28">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Verified <span className="text-[#05DF72]">Sellers</span></h1>

                <div className="relative max-w-md w-full">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search sellers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#05DF72] transition-all font-medium text-slate-700"
                    />
                </div>
            </div>

            {filteredSellers.length ? (
                <div className="grid grid-cols-1 gap-6">
                    {filteredSellers.map((store) => (
                        <div key={store.id} className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center" >
                            {/* Store Info */}
                            <div className="flex-1 w-full">
                                <StoreInfo store={store} />
                            </div>

                            {/* Wallet & Actions */}
                            <div className="lg:w-64 w-full bg-slate-50 rounded-[2rem] p-6 border border-slate-100 flex flex-col gap-4">
                                <div className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-widest text-[10px] mb-2">
                                    <WalletIcon size={14} className="text-[#05DF72]" /> Seller Wallet
                                </div>

                                <div className="mb-4">
                                    <p className="text-2xl font-black text-slate-900">₦{(store.walletBalance || 0).toLocaleString()}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Current Balance</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleWalletUpdate(store.id, 'CREDIT')}
                                        className="flex items-center justify-center gap-2 py-3 bg-[#05DF72] text-white rounded-xl hover:bg-[#04c966] transition-colors shadow-lg shadow-[#05DF72]/20"
                                    >
                                        <PlusIcon size={16} />
                                        <span className="text-xs font-bold uppercase">Credit</span>
                                    </button>
                                    <button
                                        onClick={() => handleWalletUpdate(store.id, 'DEBIT')}
                                        className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                                    >
                                        <MinusIcon size={16} />
                                        <span className="text-xs font-bold uppercase">Debit</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-80 bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <SearchIcon size={48} className="text-slate-200 mb-4" />
                    <h1 className="text-xl text-slate-400 font-bold uppercase tracking-widest">No matching sellers found</h1>
                    <p className="text-sm text-slate-400 mt-2">Try a different search term or check back later.</p>
                </div>
            )}
        </div>
    ) : <Loading />
}
