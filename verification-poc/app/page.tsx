"use client";

import { useState } from "react";

export default function NINVerificationPage() {
    const [nin, setNin] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleVerify = async (e: React.FormEvent) => {
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
            setResult({ success: false, message: "Network error occurred." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-black text-slate-900 mb-2 underline decoration-[#05DF72] decoration-4 underline-offset-4">
                        NIN <span className="text-[#05DF72]">Verification</span>
                    </h1>
                    <p className="text-slate-500 text-sm">QoreID Identity Verification Lab</p>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                            National Identity Number (NIN)
                        </label>
                        <input
                            type="text"
                            maxLength={11}
                            required
                            className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-[#05DF72] outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                            placeholder="12345678901"
                            value={nin}
                            onChange={(e) => setNin(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-[#05DF72] outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                placeholder="John"
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-[#05DF72] outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                placeholder="Doe"
                                value={lastname}
                                onChange={(e) => setLastname(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Verify Identity"}
                    </button>
                </form>

                {result && (
                    <div className={`mt-8 p-6 rounded-2xl border ${result.success ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}`}>
                        <h3 className={`text-xs font-black uppercase tracking-widest mb-2 ${result.success ? "text-emerald-600" : "text-rose-600"}`}>
                            Result: {result.success ? "Verified" : "Failed"}
                        </h3>
                        {result.success ? (
                            <div className="text-slate-700 font-bold">
                                <p>First Name: {result.firstname}</p>
                                <p>Last Name: {result.lastname}</p>
                            </div>
                        ) : (
                            <p className="text-rose-600 font-bold text-sm">{result.message}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
