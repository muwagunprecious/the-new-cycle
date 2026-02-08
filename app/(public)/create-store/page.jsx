'use client'
import { assets, lagosLGAs } from "@/assets/assets"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { logout } from "@/lib/features/auth/authSlice"
import { createStoreApplication, getUserStoreStatus } from "@/backend/actions/auth"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { useRouter } from "next/navigation"

export default function CreateStore() {
    const router = useRouter()
    const dispatch = useDispatch()
    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [isSessionInvalid, setIsSessionInvalid] = useState(false)
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
        logo: null,
        nin: "",
        cac: "",
        bankName: "",
        accountNumber: "",
        accountName: ""
    })

    const onChangeHandler = (e) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    const fetchSellerStatus = async () => {
        if (!user?.id) return

        try {
            const result = await getUserStoreStatus(user.id)

            if (result.success) {
                if (result.exists) {
                    setAlreadySubmitted(true)
                    setStatus(result.status)
                    if (result.status === 'active' || result.status === 'approved' || result.isActive) {
                        router.push('/seller')
                        return
                    }
                } else {
                    setAlreadySubmitted(false)
                }
            } else {
                if (result.error && result.error.includes("Session invalid")) {
                    setIsSessionInvalid(true)
                }
                toast.error(result.error || "Failed to fetch status")
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
            router.push('/login?redirect=/create-store')
            return
        }

        try {
            const result = await createStoreApplication(storeInfo, user.id)
            if (!result.success) {
                if (result.error.includes("Session invalid")) {
                    setIsSessionInvalid(true)
                }
                throw new Error(result.error)
            }

            setAlreadySubmitted(true)
            setStatus('approved')
            setMessage("Store created successfully! Redirecting to your dashboard...")
            toast.success("Store created!")

            setTimeout(() => {
                router.push('/seller')
            }, 2000)

        } catch (error) {
            console.error(error)
            toast.error(error.message || "Something went wrong")
        }
    }

    const handleLogoutAndRestart = () => {
        dispatch(logout())
        router.push('/signup')
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
                            <h1 className="text-3xl text-slate-900 font-bold mb-2">Become a Seller on <span className="text-[#05DF72]">GoCycle</span></h1>
                            <p className="text-slate-500">Provide your business details below to start selling.</p>
                        </div>

                        {isSessionInvalid && (
                            <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl flex flex-col items-center gap-4 text-center">
                                <p className="text-rose-600 font-bold">Session Invalid: Your account was reset during database maintenance.</p>
                                <button type="button" onClick={handleLogoutAndRestart} className="bg-rose-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-rose-700 transition-colors">
                                    Logout & Start Fresh
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                <input required name="fullName" onChange={onChangeHandler} value={storeInfo.fullName} type="text" placeholder="Enter your full name" className="border border-slate-200 outline-none focus:border-[#05DF72] w-full p-3 rounded-xl transition-all" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700">Business Name</label>
                                <input required name="businessName" onChange={onChangeHandler} value={storeInfo.businessName} type="text" placeholder="Your business identity" className="border border-slate-200 outline-none focus:border-[#05DF72] w-full p-3 rounded-xl transition-all" />
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700">NIN (National Identification Number)</label>
                                <input name="nin" onChange={onChangeHandler} value={storeInfo.nin} type="text" placeholder="11-digit NIN" className="border border-slate-200 outline-none focus:border-[#05DF72] w-full p-3 rounded-xl transition-all" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700">CAC Number (Optional if individual)</label>
                                <input name="cac" onChange={onChangeHandler} value={storeInfo.cac} type="text" placeholder="e.g. RC1234567" className="border border-slate-200 outline-none focus:border-[#05DF72] w-full p-3 rounded-xl transition-all" />
                            </div>
                        </div>

                        {/* Bank Details Section */}
                        <div className="mt-4">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Bank Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-700">Bank Name</label>
                                    <select required name="bankName" onChange={onChangeHandler} value={storeInfo.bankName} className="border border-slate-200 outline-none focus:border-[#05DF72] w-full p-3 rounded-xl transition-all">
                                        <option value="">Select Bank</option>
                                        <option value="Access Bank">Access Bank</option>
                                        <option value="GTBank">GTBank</option>
                                        <option value="First Bank">First Bank</option>
                                        <option value="UBA">UBA</option>
                                        <option value="Zenith Bank">Zenith Bank</option>
                                        <option value="Wema Bank">Wema Bank</option>
                                        <option value="Ecobank">Ecobank</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-700">Account Number</label>
                                    <input required name="accountNumber" onChange={onChangeHandler} value={storeInfo.accountNumber} type="text" placeholder="10-digit account number" maxLength={10} className="border border-slate-200 outline-none focus:border-[#05DF72] w-full p-3 rounded-xl transition-all" />
                                </div>

                                <div className="flex flex-col md:col-span-2 gap-2">
                                    <label className="text-sm font-medium text-slate-700">Account Holder Name</label>
                                    <input required name="accountName" onChange={onChangeHandler} value={storeInfo.accountName} type="text" placeholder="Name as it appears on bank statement" className="border border-slate-200 outline-none focus:border-[#05DF72] w-full p-3 rounded-xl transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                            <input required type="checkbox" id="terms" className="w-5 h-5 accent-[#05DF72] cursor-pointer" />
                            <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">I agree to the GoCycle terms and environmental policies.</label>
                        </div>

                        <button type="submit" className="btn-primary mt-6 !py-4 text-lg">Apply for Seller Account</button>
                    </form>
                </div>
            ) : (
                <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-slate-50">
                    <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl max-w-2xl w-full text-center flex flex-col items-center gap-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[#05DF72] animate-pulse"></div>

                        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${status === 'pending' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-[#05DF72]'}`}>
                            {status === 'pending' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin-slow"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            )}
                        </div>

                        <div>
                            <span className={`status-badge ${status === 'pending' ? 'status-pending' : 'status-completed'} mb-6 uppercase tracking-[0.2em] text-[10px] font-black px-6 py-2`}>
                                Account {status === 'pending' ? 'Under Review' : 'Verified'}
                            </span>
                            <h2 className="text-4xl font-black text-slate-900 mt-6 tracking-tight">
                                {status === 'pending' ? (
                                    <>Store Application <span className="text-[#05DF72]">Pending</span></>
                                ) : (
                                    <>Welcome to <span className="text-[#05DF72]">GoCycle!</span></>
                                )}
                            </h2>
                            <p className="text-slate-500 mt-6 leading-relaxed text-lg font-medium mx-auto max-w-md">
                                {status === 'pending'
                                    ? "Setting up your store profile..."
                                    : "Successfully registered! Redirecting you to your seller dashboard where you can start listing your products."}
                            </p>
                        </div>

                        {status === 'pending' && (
                            <div className="bg-slate-50 p-8 rounded-[2.5rem] w-full text-left border border-slate-100">
                                <p className="text-slate-900 font-bold mb-4 uppercase tracking-widest text-[10px]">What happens next?</p>
                                <ul className="space-y-3 text-slate-600 font-medium">
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 bg-[#05DF72] rounded-full mt-2 shrink-0"></div>
                                        <span>We verify your identification and business details.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 bg-[#05DF72] rounded-full mt-2 shrink-0"></div>
                                        <span>This process usually takes between <span className="text-slate-900 font-bold">12-24 hours</span>.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 bg-[#05DF72] rounded-full mt-2 shrink-0"></div>
                                        <span>You'll receive an email notification once your store is active.</span>
                                    </li>
                                </ul>
                            </div>
                        )}

                        <div className="flex flex-col gap-4 w-full">
                            {status === "approved" ? (
                                <p className="text-sm text-slate-400 font-bold animate-pulse">Redirecting to your dashboard...</p>
                            ) : (
                                <button
                                    onClick={() => router.push('/')}
                                    className="text-slate-400 hover:text-slate-600 transition-colors font-bold text-sm"
                                >
                                    Back to Marketplace
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    ) : (<Loading />)
}
