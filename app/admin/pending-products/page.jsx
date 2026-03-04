'use client'
import { useState, useEffect } from "react"
import { Search as SearchIcon, ShoppingBag as ShoppingBagIcon, CheckCircle as CheckCircleIcon, XCircle as XCircleIcon, Trash2 as Trash2Icon, ExternalLink as ExternalLinkIcon, Battery as BatteryIcon } from "lucide-react"
import { lagosLGAs } from "@/assets/assets"
import toast from "react-hot-toast"
import { getPendingAdminProducts, adminDeleteProduct, adminApproveProduct, adminRejectProduct } from "@/backend/actions/product"

export default function AdminPendingProducts() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        setLoading(true)
        const res = await getPendingAdminProducts()
        if (res.success) {
            setProducts(res.products)
        } else {
            toast.error(res.error || "Failed to load products")
        }
        setLoading(false)
    }

    const handleApprove = async (id) => {
        const res = await adminApproveProduct(id)
        if (res.success) {
            toast.success("Product approved successfully")
            fetchProducts()
        } else {
            toast.error(res.error || "Failed to approve product")
        }
    }

    const handleReject = async (id) => {
        const reason = prompt("Enter rejection reason (optional):", "Listing does not meet guidelines.")
        if (reason !== null) {
            const res = await adminRejectProduct(id, reason)
            if (res.success) {
                toast.success("Product rejected")
                fetchProducts()
            } else {
                toast.error(res.error || "Failed to reject product")
            }
        }
    }

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this listing? This action is permanent.")) {
            const res = await adminDeleteProduct(id)
            if (res.success) {
                toast.success("Product deleted successfully")
                fetchProducts()
            } else {
                toast.error(res.error || "Failed to delete product")
            }
        }
    }

    const getImageUrl = (image) => {
        if (!image) return '/placeholder-battery.jpg'
        if (typeof image === 'string') {
            if (image === '[object Object]' || image === '') return '/placeholder-battery.jpg'
            return image
        }
        if (typeof image === 'object' && image.src) return image.src
        return '/placeholder-battery.jpg'
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.store?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Pending <span className="text-[#05DF72]">Inventory</span></h1>
                <p className="text-slate-500 mt-1">Review new battery listings from sellers awaiting approval.</p>
            </div>

            <div className="card bg-white">
                <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by product name, category or seller..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-5">Product Info</th>
                                <th className="px-8 py-5">Seller</th>
                                <th className="px-8 py-5">Price / Stock</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="size-10 border-4 border-[#05DF72]/20 border-t-[#05DF72] rounded-full animate-spin"></div>
                                            <p className="text-sm font-medium text-slate-500">Loading inventory...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-medium">
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="group hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100 group-hover:border-[#05DF72]/20 transition-all overflow-hidden relative">
                                                    <img
                                                        src={getImageUrl(product.images?.[0])}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = '/placeholder-battery.jpg' }}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-bold text-slate-900 group-hover:text-[#05DF72] transition-colors line-clamp-1">{product.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{product.category || product.batteryType}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-700">{product.store?.name}</span>
                                                <span className="text-xs text-slate-400">{product.store?.user?.name || product.store?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 italic">₦{product.price.toLocaleString()}</span>
                                                <span className="text-[10px] font-bold text-[#05DF72] uppercase">{product.unitsAvailable} unit{product.unitsAvailable !== 1 ? 's' : ''}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`status-badge ${product.status === 'approved' ? 'status-completed' : product.status === 'rejected' ? 'status-cancelled' : 'status-pending'}`}>
                                                {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2">
                                                {product.status === 'pending' && (
                                                    <button onClick={() => handleApprove(product.id)} className="p-2.5 bg-green-50 text-[#05DF72] rounded-xl hover:bg-[#05DF72] hover:text-white transition-all shadow-sm" title="Approve Product">
                                                        <CheckCircleIcon size={18} />
                                                    </button>
                                                )}
                                                {product.status === 'pending' && (
                                                    <button onClick={() => handleReject(product.id)} className="p-2.5 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-sm" title="Reject Product">
                                                        <XCircleIcon size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => window.open(`/product/${product.id}`, '_blank')}
                                                    className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-200 hover:text-slate-700 transition-all shadow-sm"
                                                    title="View Preview"
                                                >
                                                    <ExternalLinkIcon size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(product.id)} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="Delete">
                                                    <Trash2Icon size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
