'use client'
import { useState, useEffect } from "react"
import { PackageIcon, SearchIcon, FilterIcon, ArrowRightIcon, MapPinIcon, ShieldCheckIcon, CalendarIcon, WalletIcon } from "lucide-react"
import Loading from "@/components/Loading"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"

const DUMMY_HISTORY = [
    {
        id: "ORD-7721",
        product: "Solar Power Wall 5kWh",
        total: 450000,
        status: "Completed",
        date: "2024-03-15",
        deliveryType: "Delivery",
        method: "Pay Now"
    },
    {
        id: "ORD-6612",
        product: "Lithium Ion 200Ah",
        total: 185000,
        status: "Completed",
        date: "2024-02-28",
        deliveryType: "Pickup",
        method: "Pay Now"
    },
    {
        id: "ORD-9901",
        product: "Deep Cycle Gel Battery",
        total: 95000,
        status: "Cancelled",
        date: "2024-01-20",
        deliveryType: "Delivery",
        method: "Pay on Delivery"
    }
]

export default function BuyerOrders() {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        // Load active order from localStorage + mix with dummy history
        const active = localStorage.getItem('active_order')
        let combined = [...DUMMY_HISTORY]
        if (active) {
            combined = [JSON.parse(active), ...combined]
        }
        setOrders(combined)

        setTimeout(() => setLoading(false), 800)
    }, [])

    if (loading) return <Loading />

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-100'
            case 'completed': return 'bg-green-50 text-green-600 border-green-100'
            case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100'
            default: return 'bg-slate-50 text-slate-600 border-slate-100'
        }
    }

    const router = useRouter()
    const handleNavigation = (href, message = "Loading tracking details...") => {
        dispatch(showLoader(message))
        setTimeout(() => {
            router.push(href)
        }, 500)
    }

    return (
        <div className="space-y-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 leading-tight">My <span className="text-[#05DF72]">Purchases</span></h1>
                    <p className="text-slate-400 font-bold text-sm mt-1">Track and manage your battery orders and circular history.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#05DF72] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search Order ID or Product..."
                            className="bg-white border border-slate-200 pl-12 pr-6 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 focus:border-[#05DF72] w-full md:w-80 font-medium transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/40 group hover:border-[#05DF72]/30 transition-all flex flex-col md:flex-row md:items-center gap-8">

                            {/* Icon & ID */}
                            <div className="flex items-center gap-6 md:w-1/4">
                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 ${order.status === 'Cancelled' ? 'bg-slate-50 text-slate-300' : 'bg-[#05DF72]/10 text-[#05DF72]'}`}>
                                    <PackageIcon size={28} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#05DF72] mb-1">{order.status}</p>
                                    <h3 className="text-xl font-black text-slate-900">{order.id}</h3>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 space-y-2">
                                <p className="text-sm font-bold text-slate-900">{order.product}</p>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    <span className="flex items-center gap-1.5"><CalendarIcon size={12} /> {order.date}</span>
                                    <span className="flex items-center gap-1.5"><WalletIcon size={12} /> ₦{order.total.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Details & Action */}
                            <div className="flex items-center justify-between md:justify-end gap-10 md:w-1/3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Method</p>
                                    <p className="text-xs font-black text-slate-900">{order.method} • {order.deliveryType}</p>
                                </div>

                                {order.status === 'Confirmed' ? (
                                    <button
                                        onClick={() => handleNavigation(`/buyer/track/${order.id}`)}
                                        className="btn-primary !py-4 !px-8 shadow-lg shadow-[#05DF72]/20 group-hover:scale-105 transition-all flex items-center gap-2"
                                    >
                                        Live Track <ArrowRightIcon size={16} />
                                    </button>
                                ) : (
                                    <button className="px-8 py-4 bg-slate-50 text-slate-400 font-bold text-xs rounded-xl border border-slate-100 hover:bg-slate-100 transition-all">
                                        View Details
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-slate-200">
                        <PackageIcon className="mx-auto text-slate-200 mb-6" size={64} />
                        <h3 className="text-lg font-black text-slate-900 mb-2">No orders found</h3>
                        <p className="text-sm font-bold text-slate-400 mb-8 max-w-xs mx-auto">We couldn't find any orders matching your criteria.</p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="text-[#05DF72] font-black uppercase tracking-widest text-[10px] hover:underline"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </div>

            {/* Support Area */}
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden mt-10">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="max-w-md">
                        <div className="flex items-center gap-2 text-[#05DF72] mb-4 font-black uppercase tracking-widest text-[10px]">
                            <ShieldCheckIcon size={16} /> Order Protection
                        </div>
                        <h2 className="text-3xl font-black mb-4">Secured by GoCycle</h2>
                        <p className="text-slate-400 font-medium leading-relaxed">Every purchase is protected. Funds are only released to sellers after you verify delivery with your unique security code.</p>
                    </div>
                    <button className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#05DF72] hover:text-white transition-all shadow-2xl">
                        Contact Support
                    </button>
                </div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-[#05DF72]/10 rounded-full blur-[100px] -ml-20"></div>
            </div>
        </div>
    )
}
