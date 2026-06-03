"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { 
  CheckCircle as CheckCircleIcon, 
  XCircle as XCircleIcon, 
  Search as SearchIcon, 
  RefreshCw as RefreshCwIcon, 
  AlertCircle as AlertCircleIcon,
  Store as StoreIcon,
  User as UserIcon,
  CreditCard as CreditCardIcon,
  Calendar as CalendarIcon
} from "lucide-react";
import VerifyAccountClient from "@/components/admin/VerifyAccountClient";

export default function ManualVerificationPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'pending', 'approved', 'rejected'
  const [testingId, setTestingId] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Bank name resolver mapping
  const bankNames = {
    "100004": "OPay Digital Bank",
    "100033": "Palmpay",
    "50515": "Moniepoint MFB",
    "090267": "Kuda Bank"
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/manual-verification");
      const data = await res.json();
      if (data.success) {
        setRecords(data.data || []);
      } else {
        toast.error(data.message || "Failed to load verifications");
      }
    } catch (e) {
      toast.error("Error loading verification requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    const loadingToast = toast.loading(`Updating status to ${status}...`);
    try {
      const res = await fetch("/api/manual-verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      toast.dismiss(loadingToast);
      if (data.success) {
        toast.success(`Request successfully ${status}!`);
        fetchRecords();
      } else {
        toast.error(data.message || "Failed to update request status");
      }
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error("An error occurred");
    }
  };

  const handleTestResolution = async (record) => {
    setTestingId(record.id);
    setTestResult(null);
    try {
      const res = await fetch("/api/verify-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber: record.accountNumber,
          bankCode: record.bankCode,
          firstname: (record.fullName || "").split(" ")[0] || "N/A",
          lastname: (record.fullName || "").split(" ").slice(1).join(" ") || "N/A"
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          resolvedName: data.accountName,
          message: "Downtime resolved! Account verified successfully."
        });
        toast.success("Downtime resolved! Valid account found.");
      } else {
        setTestResult({
          success: false,
          message: data.message || "Downtime persists or lookup failed."
        });
        toast.error(data.message || "Lookup still failing.");
      }
    } catch (e) {
      setTestResult({
        success: false,
        message: "Network error trying to verify account."
      });
      toast.error("Failed to execute live lookup");
    } finally {
      setTestingId(null);
    }
  };

  // Filtered lists
  const filteredRecords = records.filter(r => {
    const bankName = bankNames[r.bankCode] || r.bankCode || "";
    const fullName = r.fullName || "";
    const accountNumber = r.accountNumber || "";
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      fullName.toLowerCase().includes(term) ||
      accountNumber.includes(searchTerm) ||
      (r.storeName && r.storeName.toLowerCase().includes(term)) ||
      bankName.toLowerCase().includes(term);

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && r.status === activeTab;
  });

  // Stats
  const totalCount = records.length;
  const pendingCount = records.filter(r => r.status === "pending").length;
  const approvedCount = records.filter(r => r.status === "approved").length;
  const rejectedCount = records.filter(r => r.status === "rejected").length;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Manual <span className="text-[#05DF72]">Verifications</span>
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Review, auto-verify, and approve/reject manually inputted seller bank details submitted during provider downtime.
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
            <CreditCardIcon size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Submissions</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <AlertCircleIcon size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending Action</p>
            <h3 className="text-2xl font-black text-amber-600 mt-0.5">{pendingCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <CheckCircleIcon size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Approved Accounts</p>
            <h3 className="text-2xl font-black text-green-600 mt-0.5">{approvedCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <XCircleIcon size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rejected Accounts</p>
            <h3 className="text-2xl font-black text-rose-600 mt-0.5">{rejectedCount}</h3>
          </div>
        </div>
      </div>

      {/* Dynamic Content Layout */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Controls Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Tab Segmentation */}
          <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100 shrink-0">
            {["all", "pending", "approved", "rejected"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === tab 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative w-full max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by store, name, bank, or account number..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-[#05DF72] focus:ring-2 focus:ring-[#05DF72]/10 transition-all text-xs font-medium"
            />
          </div>
        </div>

        {/* Live Test Results Modal/Banner */}
        {testResult && (
          <div className={`p-4 border-b ${testResult.success ? "bg-green-50 border-green-200 text-green-700" : "bg-rose-50 border-rose-200 text-rose-700"} flex items-center justify-between text-xs font-bold transition-all animate-in fade-in duration-300`}>
            <div className="flex items-center gap-2">
              {testResult.success ? <CheckCircleIcon size={16} /> : <AlertCircleIcon size={16} />}
              <span>
                {testResult.success 
                  ? `[Resolved Name]: "${testResult.resolvedName}" — ${testResult.message}` 
                  : `[Lookup Failure]: ${testResult.message}`}
              </span>
            </div>
            <button onClick={() => setTestResult(null)} className="px-3 py-1 hover:bg-black/5 rounded-lg">Dismiss</button>
          </div>
        )}

        {/* List Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <RefreshCwIcon size={32} className="animate-spin text-[#05DF72]" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading manual requests...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <AlertCircleIcon size={36} className="text-slate-300" />
              <p className="text-sm font-bold">No matching manual verifications found</p>
              <p className="text-xs">Any manually inputted seller bank submissions will be listed here.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-4">Store Name</th>
                  <th className="px-6 py-4">Bank & Account</th>
                  <th className="px-6 py-4">Provided Full Name</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    {/* Store Name & Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <StoreIcon size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{record.storeName}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{record.storeEmail}</span>
                        </div>
                      </div>
                    </td>

                    {/* Bank Details */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{bankNames[record.bankCode] || record.bankCode || "Unknown Bank"}</span>
                        <span className="text-xs text-slate-500 tracking-wider font-mono font-semibold">{record.accountNumber}</span>
                      </div>
                    </td>

                    {/* Provided Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserIcon size={14} className="text-slate-400" />
                        <span className="font-semibold text-slate-800">
                          {record.fullName || <span className="text-slate-400 italic text-xs">Not provided</span>}
                        </span>
                      </div>
                    </td>

                    {/* Submitted Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <CalendarIcon size={14} className="text-slate-400" />
                        <span>{new Date(record.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        record.status === "approved" 
                          ? "bg-green-50 text-green-600 border border-green-100" 
                          : record.status === "rejected" 
                          ? "bg-rose-50 text-rose-600 border border-rose-100" 
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {record.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {record.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleTestResolution(record)}
                              disabled={testingId === record.id}
                              title="Query live verify-bank service to see if downtime has resolved"
                              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50 shrink-0"
                            >
                              <RefreshCwIcon size={16} className={testingId === record.id ? "animate-spin" : ""} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(record.id, "approved")}
                              className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(record.id, "rejected")}
                              className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {record.status !== "pending" && (
                          <span className="text-xs text-slate-400 font-medium italic">Handled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Auxiliary Verify Lookup client utility */}
      <div className="border-t border-slate-100 pt-8 mt-4">
        <VerifyAccountClient />
      </div>
    </div>
  );
}
