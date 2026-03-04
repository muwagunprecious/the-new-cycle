'use client'
import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { getUserProfile, changePassword } from "@/backend/actions/auth"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"
import toast from "react-hot-toast"
import { User as UserIcon, Lock as LockIcon, Save as SaveIcon, Mail as MailIcon, Phone as PhoneIcon } from "lucide-react"

export default function BuyerProfile() {
    const { user: authUser } = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState(null)
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    useEffect(() => {
        if (authUser?.id) {
            fetchProfile()
        }
    }, [authUser])

    const fetchProfile = async () => {
        setLoading(true)
        const res = await getUserProfile(authUser.id)
        if (res.success) {
            setProfile(res.data)
        }
        setLoading(false)
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("New passwords do not match")
        }

        if (passwordData.newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters long")
        }

        dispatch(showLoader("Updating Password..."))
        const res = await changePassword(authUser.id, passwordData.currentPassword, passwordData.newPassword)
        dispatch(hideLoader())

        if (res.success) {
            toast.success("Password updated successfully!")
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })
        } else {
            toast.error(res.error || "Failed to update password")
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-[#05DF72] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Profile <span className="text-[#05DF72]">Settings</span></h1>
                <p className="text-slate-500 mt-1">Manage your personal information and security.</p>
            </div>

            {/* Profile Info Card */}
            <div className="card bg-white p-8">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                    <div className="w-12 h-12 bg-[#05DF72]/10 rounded-2xl flex items-center justify-center text-[#05DF72]">
                        <UserIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                        <p className="text-sm text-slate-500">Your account details across the GoCycle platform.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <UserIcon size={12} /> Full Name
                        </label>
                        <p className="text-slate-700 font-semibold">{profile?.fullName || profile?.name || 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <MailIcon size={12} /> Email Address
                        </label>
                        <p className="text-slate-700 font-semibold">{profile?.email || 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <PhoneIcon size={12} /> Phone Number
                        </label>
                        <p className="text-slate-700 font-semibold">{profile?.phone || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Change Password Card */}
            <div className="card bg-white p-8">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                    <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                        <LockIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Security Settings</h2>
                        <p className="text-sm text-slate-500">Update your account password to stay secure.</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Password *</label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                placeholder="Enter current password"
                                required
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/20 font-medium text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password *</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                placeholder="Min. 6 characters"
                                required
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm New Password *</label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                placeholder="Repeat new password"
                                required
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2">
                            <SaveIcon size={18} />
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
