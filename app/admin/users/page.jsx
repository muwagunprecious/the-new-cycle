'use client'
import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { toggleUserStatus } from "@/lib/features/auth/authSlice"
import toast from "react-hot-toast"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"
import { useEffect } from "react"
import { getAllUsers, banUser } from "@/backend/actions/admin"
import Loading from "@/components/Loading"

export default function UserManagement() {
    const dispatch = useDispatch()
    const [dbUsers, setDbUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await getAllUsers()
            if (res.success) {
                setDbUsers(res.data)
            }
            setLoading(false)
        }
        fetchUsers()
    }, [])

    const filteredUsers = dbUsers.filter(user =>
        (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )

    const handleToggleStatus = async (userId, name) => {
        const user = dbUsers.find(u => u.id === userId)
        const isBanning = user.status === 'active' || !user.status

        dispatch(showLoader(isBanning ? `Banning ${name}...` : `Restoring ${name}...`))

        const res = await banUser(userId, isBanning)
        dispatch(hideLoader())

        if (res.success) {
            setDbUsers(prev => prev.map(u => u.id === userId ? { ...u, status: isBanning ? 'banned' : 'active' } : u))
            toast.success(`${name} has been ${isBanning ? 'banned' : 'restored'}`)
        } else {
            toast.error(res.error || "Failed to update status")
        }
    }

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-2 text-[#05DF72] mb-2 font-black uppercase tracking-widest text-[10px]">
                        <ShieldCheckIcon size={16} /> Platform Governance
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 leading-tight">User <span className="text-[#05DF72]">Database</span></h1>
                    <p className="text-slate-400 font-bold text-sm mt-1">Control access and visibility across all platform roles.</p>
                </div>
                <div className="relative group">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#05DF72] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email or whatsapp..."
                        className="pl-12 pr-6 py-4 bg-white border-none rounded-[2rem] shadow-xl shadow-slate-200/50 outline-none w-full md:w-80 font-medium text-sm focus:ring-2 focus:ring-[#05DF72]/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] first:rounded-tl-[3rem]">User Identity</th>
                                <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px]">Role</th>
                                <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px]">Contact (Admin View)</th>
                                <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px]">Security Status</th>
                                <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] last:rounded-tr-[3rem] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-[#05DF72] border border-slate-200">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{user.name}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: {user.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${user.role === 'ADMIN' ? 'bg-slate-900 text-white border-slate-900' :
                                            user.role === 'SELLER' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                user.role === 'DELIVERY' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-slate-50 text-slate-600 border-slate-100'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                                                <MailIcon size={12} className="text-[#05DF72]" /> {user.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                                                <PhoneIcon size={12} className="text-[#05DF72]" /> {user.whatsapp}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${(user.status === 'active' || !user.status) ? 'bg-[#05DF72] animate-pulse' : 'bg-rose-500'}`}></div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${(user.status === 'active' || !user.status) ? 'text-[#05DF72]' : 'text-rose-500'}`}>
                                                {user.status || 'active'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            disabled={user.role === 'ADMIN'}
                                            onClick={() => handleToggleStatus(user.id, user.name)}
                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${(user.status === 'active' || !user.status)
                                                ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white'
                                                : 'bg-[#05DF72]/10 text-[#05DF72] hover:bg-[#05DF72] hover:text-white'
                                                } disabled:opacity-30 disabled:cursor-not-allowed`}
                                        >
                                            {(user.status === 'active' || !user.status) ? <><BanIcon size={14} /> Ban Access</> : <><CheckCircleIcon size={14} /> Restore</>}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <SearchIcon className="text-slate-200" size={32} />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No users found in database</p>
                    </div>
                )}
            </div>
        </div>
    )
}
