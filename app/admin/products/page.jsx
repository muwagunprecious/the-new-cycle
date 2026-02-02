'use client'
import { useState } from "react"
import { SearchIcon, ShoppingBagIcon, CheckCircleIcon, XCircleIcon, Trash2Icon, ExternalLinkIcon, BatteryIcon } from "lucide-react"
import { productDummyData } from "@/assets/assets"
import toast from "react-hot-toast"

export default function AdminProducts() {
    const [products, setProducts] = useState(productDummyData.map(p => ({
        ...p,
        status: p.id === 'prod_3' ? 'Pending' : 'Approved'
    })))

    const approveProduct = (id) => {
        setProducts(products.map(p => p.id === id ? { ...p, status: 'Approved' } : p))
        toast.success("Product approved for marketplace")
    }

    const deleteProduct = (id) => {
        if (confirm("Are you sure you want to delete this listing?")) {
            setProducts(products.filter(p => p.id !== id))
            toast.success("Product deleted")
        }
    }

    const getImageUrl = (image) => {
        if (!image) return null
        if (typeof image === 'string') return image
        if (typeof image === 'object' && image.src) return image.src
        return null
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Inventory <span className="text-[#05DF72]">Moderation</span></h1>
                <p className="text-slate-500 mt-1">Approve or reject battery listings from sellers.</p>
            </div>

            <div className="card bg-white">
                <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by product name, category or seller..."
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
                            {products.map((product) => (
                                <tr key={product.id} className="group hover:bg-slate-50/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100 group-hover:border-[#05DF72]/20 transition-all overflow-hidden relative">
                                                {getImageUrl(product.images?.[0]) ? (
                                                    <img src={getImageUrl(product.images[0])} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <BatteryIcon size={24} />
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-slate-900 group-hover:text-[#05DF72] transition-colors line-clamp-1">{product.name}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{product.category}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-700">{product.store?.name}</span>
                                            <span className="text-xs text-slate-400">{product.store?.user?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 italic">₦{product.price.toLocaleString()}</span>
                                            <span className="text-[10px] font-bold text-[#05DF72] uppercase">In Stock</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`status-badge ${product.status === 'Approved' ? 'status-completed' : 'status-pending'}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-2">
                                            {product.status === 'Pending' && (
                                                <button onClick={() => approveProduct(product.id)} className="p-2.5 bg-green-50 text-[#05DF72] rounded-xl hover:bg-[#05DF72] hover:text-white transition-all shadow-sm" title="Approve">
                                                    <CheckCircleIcon size={18} />
                                                </button>
                                            )}
                                            <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-200 hover:text-slate-700 transition-all shadow-sm" title="View Detail">
                                                <ExternalLinkIcon size={18} />
                                            </button>
                                            <button onClick={() => deleteProduct(product.id)} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="Delete">
                                                <Trash2Icon size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
