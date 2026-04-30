'use client'
// Admin User Management - Platform Governance
import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { toggleUserStatus } from "@/lib/features/auth/authSlice"
import toast from "react-hot-toast"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"
import { useSearchParams } from "next/navigation"
import { getAllUsers, banUser, approveBuyer, createAdminAccount } from "@/backend-actions/actions/admin"
import Loading from "@/components/Loading"
import { ShieldCheck as ShieldCheckIcon, Search as SearchIcon, Mail as MailIcon, Phone as PhoneIcon, Ban as BanIcon, CheckCircle as CheckCircleIcon, AlertCircle as AlertCircleIcon, Check as CheckIcon } from "lucide-react"

export default function AdminUsersClient({ initialUsers }) {
    const dispatch = useDispatch()
    const [dbUsers, setDbUsers] = useState(initialUsers || [])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddAdminOpen, setIsAddAdminOpen] = useState(false)
    const [adminForm, setAdminForm] = useState({ name: '', email: '', phone: '', password: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const searchParams = useSearchParams()

    // Auto-open Create Admin modal if navigated from sidebar
    useEffect(() => {
        if (searchParams.get('action') === 'create-admin') {
            setIsAddAdminOpen(true)
        }
    }, [searchParams])

    // Users are passed as props!

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

    const handleApprove = async (userId, name) => {
        if (!confirm(`Are you sure you want to approve ${name}'s account?`)) return

        dispatch(showLoader(`Approving ${name}...`))
        const res = await approveBuyer(userId)
        dispatch(hideLoader())

        if (res.success) {
            setDbUsers(prev => prev.map(u => u.id === userId ? { ...u, accountStatus: 'approved' } : u))
            toast.success(`${name} has been approved successfully!`)
        } else {
            toast.error(res.error || "Failed to approve account")
        }
    }

    const handleCreateAdmin = async (e) => {
        e.preventDefault()
        if (!adminForm.name || !adminForm.email || !adminForm.phone || !adminForm.password) {
            toast.error("Please fill in all fields")
            return
        }

        setIsSubmitting(true)
        dispatch(showLoader("Creating Admin Account..."))
        
        const res = await createAdminAccount(adminForm)
        
        dispatch(hideLoader())
        setIsSubmitting(false)

        if (res.success) {
            toast.success("Admin account created successfully")
            setDbUsers(prev => [res.data.user, ...prev])
            setIsAddAdminOpen(false)
            setAdminForm({ name: '', email: '', phone: '', password: '' })
        } else {
            toast.error(res.error || "Failed to create admin account")
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
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group w-full sm:w-auto">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#05DF72] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email or whatsapp..."
                            className="pl-12 pr-6 py-4 bg-white border-none rounded-[2rem] shadow-xl shadow-slate-200/50 outline-none w-full md:w-80 font-medium text-sm focus:ring-2 focus:ring-[#05DF72]/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setIsAddAdminOpen(true)}
                        className="px-6 py-4 bg-[#05DF72] hover:bg-[#04c966] text-white rounded-[2rem] font-bold text-sm shadow-xl shadow-[#05DF72]/30 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        <ShieldCheckIcon size={18} /> Create Admin
                    </button>
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
                                <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px]">Verification</th>
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
                                        {user.accountStatus === 'approved' ? (
                                            <span className="flex items-center gap-1 text-[#05DF72] text-[10px] font-black uppercase tracking-widest">
                                                <CheckCircleIcon size={14} /> Verified
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                                                <AlertCircleIcon size={14} /> Pending
                                            </span>
                                        )}
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
                                        <div className="flex justify-end gap-2">
                                            {user.accountStatus !== 'approved' && user.role !== 'ADMIN' && (
                                                <button
                                                    onClick={() => handleApprove(user.id, user.name)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <CheckIcon size={14} /> Approve
                                                </button>
                                            )}
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
                                        </div>
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

            {/* Create Admin Modal */}
            {isAddAdminOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#05DF72]/10 text-[#05DF72] flex items-center justify-center">
                                    <ShieldCheckIcon size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Create Admin</h3>
                                    <p className="text-xs text-slate-400 font-medium">Add a new administrator account</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsAddAdminOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
                            >
                                <BanIcon size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateAdmin} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72] transition-all text-sm font-medium"
                                    placeholder="e.g. John Doe"
                                    value={adminForm.name}
                                    onChange={(e) => setAdminForm({...adminForm, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                                <input 
                                    type="email" 
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72] transition-all text-sm font-medium"
                                    placeholder="admin@example.com"
                                    value={adminForm.email}
                                    onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Phone Number</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72] transition-all text-sm font-medium"
                                    placeholder="+234..."
                                    value={adminForm.phone}
                                    onChange={(e) => setAdminForm({...adminForm, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
                                <input 
                                    type="password" 
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72] transition-all text-sm font-medium"
                                    placeholder="••••••••"
                                    value={adminForm.password}
                                    onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                                />
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsAddAdminOpen(false)}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-[#05DF72] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
