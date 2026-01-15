'use client'
import { assets, lagosLGAs } from "@/assets/assets"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { createStoreApplication, getUserStoreStatus } from "@/backend/actions/auth"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { useRouter } from "next/navigation"

export default function CreateStore() {
    const router = useRouter()
    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const { user, isLoggedIn } = useSelector((state) => state.auth)

    const [storeInfo, setStoreInfo] = useState({
        businessName: "",
        fullName: "",
        email: "",
        phone: "",
        state: "Lagos",
        lga: "",
        address: "",
        batteryTypes: "",
        logo: null
    })

    const onChangeHandler = (e) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    const fetchSellerStatus = async () => {
        if (!user?.id) return

        try {
            const result = await getUserStoreStatus(user.id)

            if (result.success && result.exists) {
                setAlreadySubmitted(true)
                setStatus(result.status)
                setMessage(result.status === 'pending'
                    ? "Your application is currently pending approval. We'll notify you once it's reviewed."
                    : "Your account is approved! Redirecting...")

                if (result.status === 'active' || result.status === 'approved') { // Handle both just in case
                    setTimeout(() => router.push('/seller'), 3000)
                }
            } else {
                setAlreadySubmitted(false)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        if (!isLoggedIn || !user) {
            toast.error("You must be logged in to apply.")
            router.push('/login')
            return
        }

        try {
            const result = await createStoreApplication(storeInfo, user.id)
            if (!result.success) {
                throw new Error(result.error)
            }

            setAlreadySubmitted(true)
            setStatus('pending')
            setMessage("Application submitted successfully! Your account is currently pending approval.")
            toast.success("Application submitted!")

        } catch (error) {
            console.error(error)
            toast.error(error.message || "Something went wrong")
        }
    }

    useEffect(() => {
        if (user) {
            fetchSellerStatus()
        } else {
            setLoading(false) // Stop loading if no user, form will eventually enforce login on submit
        }
    }, [user])

    return !loading ? (
        <div className="bg-[#f9fafb] min-h-screen">
            {!alreadySubmitted ? (
                <div className="max-w-4xl mx-auto px-6 py-16">
                    <form onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Submitting application...", success: "Submitted!", error: "Failed to submit" })} className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
                        {/* Title */}
                        <div className="mb-6">
                            <h1 className="text-3xl text-slate-900 font-bold mb-2">Sell on <span className="text-[#05DF72]">GoCycle</span></h1>
                            <p className="text-slate-500">Join our circular-economy marketplace. Submit your vendor details below.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                <input required name="fullName" onChange={onChangeHandler} value={storeInfo.fullName} type="text" placeholder="Enter your full name" className="border border-slate-200 outline-none focus:border-[#05DF72] w-full p-3 rounded-xl transition-all" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700">Business / Vendor Name</label>
                                <input required name="businessName" onChange={onChangeHandler} value={storeInfo.businessName} type="text" placeholder="Enter business name" className="border border-slate-200 outline-none focus:border-[#05DF72] w-full p-3 rounded-xl transition-all" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <input required name="email" onChange={onChangeHandler} value={storeInfo.email} type="email" placeholder="email@example.com" className="border border-slate-200 outline-none focus:border-[#05DF72] w-full p-3 rounded-xl transition-all" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                <input required name="phone" onChange={onChangeHandler} value={storeInfo.phone} type="text" placeholder="+234 ..." className="border border-slate-200 outline-none focus:border-[#05DF72] w-full p-3 rounded-xl transition-all" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700">State</label>
                                <input disabled name="state" value={storeInfo.state} type="text" className="bg-slate-50 border border-slate-200 w-full p-3 rounded-xl text-slate-400 cursor-not-allowed" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700">Local Government Area (Lagos)</label>
                                <select required name="lga" onChange={onChangeHandler} value={storeInfo.lga} className="border border-slate-200 outline-none focus:border-[#05DF72] w-full p-3 rounded-xl transition-all">
                                    <option value="">Select LGA</option>
                                    {lagosLGAs.map(lga => <option key={lga} value={lga}>{lga}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700">Business Address</label>
                            <textarea required name="address" onChange={onChangeHandler} value={storeInfo.address} rows={3} placeholder="Full business address" className="border border-slate-200 outline-none focus:border-[#05DF72] w-full p-3 rounded-xl transition-all resize-none" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700">Type of Batteries Sold</label>
                            <input required name="batteryTypes" onChange={onChangeHandler} value={storeInfo.batteryTypes} type="text" placeholder="e.g. Car, Inverter, Lithium, UPS" className="border border-slate-200 outline-none focus:border-[#05DF72] w-full p-3 rounded-xl transition-all" />
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                            <input required type="checkbox" id="terms" className="w-5 h-5 accent-[#05DF72] cursor-pointer" />
                            <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">I agree to the GoCycle terms and environmental policies.</label>
                        </div>

                        <button type="submit" className="btn-primary mt-6 !py-4 text-lg">Apply for Seller Account</button>
                    </form>
                </div>
            ) : (
                <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xl max-w-xl w-full text-center flex flex-col items-center gap-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${status === 'pending' ? 'bg-orange-100 text-orange-500' : 'bg-green-100 text-green-500'}`}>
                            {status === 'pending' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            )}
                        </div>
                        <div>
                            <span className={`status-badge ${status === 'pending' ? 'status-pending' : 'status-completed'} mb-4 uppercase tracking-wider`}>
                                Account {status}
                            </span>
                            <h2 className="text-2xl font-bold text-slate-900 mt-4">{status === 'pending' ? 'Application Received' : 'Welcome to GoCycle!'}</h2>
                            <p className="text-slate-500 mt-4 leading-relaxed">{message}</p>
                        </div>
                        {status === "approved" && <p className="text-sm text-slate-400">Redirecting to your dashboard...</p>}
                    </div>
                </div>
            )}
        </div>
    ) : (<Loading />)
}
