"use client";

import { useState } from "react";
import { ShieldCheck, User, Search, AlertCircle } from "lucide-react";

export default function QoreIDDemo() {
    const [nin, setNin] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch("/api/verify-nin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nin, firstname, lastname }),
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({ success: false, message: "Check your internet connection." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
            <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100">
                {/* Header Header */}
                <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#05DF72]/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-[#05DF72]/20 rounded-2xl">
                            <ShieldCheck className="text-[#05DF72]" size={32} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                        Qore<span className="text-[#05DF72]">ID</span> Lab
                    </h1>
                    <p className="text-slate-400 font-medium text-sm">Identity Verification Sandbox</p>
                </div>

                <div className="p-10 space-y-8">
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">
                                Security Credentials
                            </label>
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#05DF72] transition-colors" size={20} />
                                <input
                                    type="text"
                                    maxLength={11}
                                    required
                                    placeholder="Enter 11-digit NIN"
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#05DF72]/20 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                                    value={nin}
                                    onChange={(e) => setNin(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 block ml-1">
                                    Legal First Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Olamilekan"
                                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#05DF72]/20 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                                    value={firstname}
                                    onChange={(e) => setFirstname(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 block ml-1">
                                    Legal Last Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Adebayo"
                                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#05DF72]/20 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                                    value={lastname}
                                    onChange={(e) => setLastname(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-[#05DF72] text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#04C966] active:scale-[0.98] transition-all shadow-xl shadow-[#05DF72]/20 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
                                    Verifying Identity...
                                </>
                            ) : (
                                "Run Verification Check"
                            )}
                        </button>
                    </form>

                    {/* Results Display */}
                    {result && (
                        <div className={`rounded-3xl p-8 border animate-in fade-in slide-in-from-bottom-4 duration-500 ${result.success ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100"
                            }`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${result.success ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                                    {result.success ? <ShieldCheck size={24} /> : <AlertCircle size={24} />}
                                </div>
                                <div>
                                    <h3 className={`text-sm font-black uppercase tracking-widest mb-1 ${result.success ? "text-emerald-700" : "text-rose-700"}`}>
                                        Verification {result.success ? "Passed" : "Failed"}
                                    </h3>
                                    {result.success ? (
                                        <div className="space-y-1">
                                            <p className="text-slate-600 text-sm font-medium">Names verified from NIMC registry:</p>
                                            <p className="text-slate-900 font-bold text-lg">
                                                {result.firstname} {result.lastname}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-rose-600 font-bold text-sm leading-relaxed">
                                            {result.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Guidelines */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Test Guidelines</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-xs text-slate-600 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#05DF72] mt-1.5"></div>
                                Ensure your <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">QOREID_TEST_KEY</code> is correctly set in Vercel or .env.local.
                            </li>
                            <li className="flex items-start gap-3 text-xs text-slate-600 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#05DF72] mt-1.5"></div>
                                Input names must match exactly as registered on the NIN for a successful verification.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
