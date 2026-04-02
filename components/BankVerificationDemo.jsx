'use client'
import { useState, useEffect } from "react"
import { ShieldCheck, Search, Building2, CreditCard, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

export default function BankVerificationDemo() {
    const [banks, setBanks] = useState({})
    const [loading, setLoading] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [formData, setFormData] = useState({
        bankName: '',
        accountNumber: '',
        firstName: '',
        lastName: ''
    })
    const [result, setResult] = useState(null)

    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const res = await fetch('/api/verify-bank')
                const data = await res.json()
                if (data.banks) setBanks(data.banks)
            } catch (error) {
                console.error("Failed to fetch banks:", error)
            }
        }
        fetchBanks()
    }, [])

    const handleVerify = async (e) => {
        e.preventDefault()
        if (!formData.bankName || formData.accountNumber.length !== 10) {
            toast.error("Please select a bank and enter a 10-digit account number")
            return
        }

        setVerifying(true)
        setResult(null)
        
        try {
            const bankCode = banks[formData.bankName]
            const res = await fetch('/api/verify-bank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    accountNumber: formData.accountNumber, 
                    bankCode,
                    firstname: formData.firstName || 'N/A',
                    lastname: formData.lastName || 'N/A'
                })
            })

            const data = await res.json()
            if (data.success) {
                setResult({ success: true, name: data.accountName })
                toast.success("Account name retrieved successfully!")
            } else {
                setResult({ success: false, message: data.message || "Account not found" })
                toast.error(data.message || "Verification failed")
            }
        } catch (error) {
            console.error("Verification error:", error)
            toast.error("An error occurred during verification")
        } finally {
            setVerifying(false)
        }
    }

    return (
        <section className="py-24 bg-slate-50 overflow-hidden relative">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-[#05DF72]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Text Content */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#05DF72]/10 rounded-full text-[#05DF72] text-xs font-black uppercase tracking-widest">
                            <ShieldCheck size={16} />
                            Trusted Identity System
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1]">
                            Try Our <span className="text-[#05DF72]">Instant</span> Bank Verification
                        </h2>
                        <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
                            Experience the speed and security of our NUBAN lookup system. We use state-of-the-art QoreID integration to verify payout identities in real-time.
                        </p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-slate-900 font-bold">
                                <div className="w-6 h-6 bg-[#05DF72] rounded-full flex items-center justify-center text-white text-xs">1</div>
                                <span>Select any Nigerian Bank</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-900 font-bold">
                                <div className="w-6 h-6 bg-[#05DF72] rounded-full flex items-center justify-center text-white text-xs">2</div>
                                <span>Provide the Account Holder's Name</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-900 font-bold">
                                <div className="w-6 h-6 bg-[#05DF72] rounded-full flex items-center justify-center text-white text-xs">3</div>
                                <span>Enter the 10-digit Account Number</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-900 font-bold">
                                <div className="w-6 h-6 bg-[#05DF72] rounded-full flex items-center justify-center text-white text-xs">3</div>
                                <span>Get the verified account name instantly</span>
                            </div>
                        </div>
                    </div>

                    {/* Demo Form Card */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#05DF72]/20 to-blue-500/20 blur-2xl rounded-[3rem] opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl relative z-10">
                            <form onSubmit={handleVerify} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <Building2 size={12} className="text-[#05DF72]" />
                                        Select Bank
                                    </label>
                                    <select
                                        value={formData.bankName}
                                        onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                                        className="w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-bold text-slate-800 transition-all appearance-none"
                                        required
                                    >
                                        <option value="">Choose Bank</option>
                                        {Object.keys(banks).sort().map(bank => (
                                            <option key={bank} value={bank}>{bank}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">First Name</label>
                                        <input
                                            type="text"
                                            placeholder="Identity Name"
                                            value={formData.firstName}
                                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-bold text-slate-800 transition-all placeholder:text-slate-300 text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Name</label>
                                        <input
                                            type="text"
                                            placeholder="Identity Surname"
                                            value={formData.lastName}
                                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-bold text-slate-800 transition-all placeholder:text-slate-300 text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <CreditCard size={12} className="text-[#05DF72]" />
                                        Account Number
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={10}
                                        placeholder="1234567890"
                                        value={formData.accountNumber}
                                        onChange={e => setFormData({ ...formData, accountNumber: e.target.value.replace(/[^0-9]/g, '') })}
                                        className="w-full p-4 md:p-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-bold text-slate-800 transition-all placeholder:text-slate-300"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={verifying}
                                    className="w-full bg-[#05DF72] text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#04c764] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#05DF72]/30 active:scale-[0.98]"
                                >
                                    {verifying ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Verify Now
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Result Area */}
                            <div className={`mt-10 overflow-hidden transition-all duration-500 max-h-0 ${result ? 'max-h-64 opacity-100' : 'opacity-0'}`}>
                                {result?.success ? (
                                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="w-12 h-12 bg-[#05DF72] rounded-full flex items-center justify-center text-white shrink-0">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#05DF72] mb-1">Account Verified</p>
                                            <h4 className="text-xl font-black text-slate-900 uppercase">{result.name}</h4>
                                        </div>
                                    </div>
                                ) : result && (
                                    <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white shrink-0">
                                            <AlertCircle size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Verification Failed</p>
                                            <h4 className="text-xl font-black text-slate-900 uppercase">{result.message}</h4>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
