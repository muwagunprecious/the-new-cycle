'use client';
import React, { useState } from 'react';

// VerifyAccountClient – admin UI to verify a bank account number using the existing verify-bank API.
// It does **not** modify any environment variables.

export default function VerifyAccountClient() {
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [manualFullName, setManualFullName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/verify-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, bankCode, firstname, lastname })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Verification failed');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  // Handle manual name submission when provider is down
  const handleManualSubmit = async () => {
    if (!manualFullName) {
      setError('Please enter your full name for manual verification');
      return;
    }
    try {
      const res = await fetch('/api/manual-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: manualFullName, accountNumber, bankCode })
      });
      const data = await res.json();
      setResult({ ...data, downtime: true });
    } catch (e) {
      setError('Failed to submit manual verification request');
    }
  };

  // Simple list of supported mobile wallet bank codes (as defined in verify-bank route)
  const bankOptions = [
    { name: 'OPay Digital Bank', code: '100004' },
    { name: 'Palmpay', code: '100033' },
    { name: 'Moniepoint MFB', code: '50515' },
    { name: 'Kuda Bank', code: '090267' }
  ];

  return (
    <div className="mt-8 p-6 border border-slate-200 rounded-sm bg-slate-50 shadow-sm max-w-xl">
      <h2 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Verify Bank Account (Admin)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1" htmlFor="accountNumber">
            Account Number
          </label>
          <input
            id="accountNumber"
            type="text"
            required
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 bg-white focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20 outline-none text-sm rounded-sm font-mono"
            placeholder="e.g., 8144065785"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1" htmlFor="firstname">
            First Name
          </label>
          <input
            id="firstname"
            type="text"
            required
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 bg-white focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20 outline-none text-sm rounded-sm"
            placeholder="e.g., John"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1" htmlFor="lastname">
            Last Name
          </label>
          <input
            id="lastname"
            type="text"
            required
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 bg-white focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20 outline-none text-sm rounded-sm"
            placeholder="e.g., Doe"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1" htmlFor="bankCode">
            Bank / Mobile Wallet
          </label>
          <select
            id="bankCode"
            required
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 bg-white focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20 outline-none text-sm rounded-sm font-semibold"
          >
            <option value="">Select a wallet</option>
            {bankOptions.map((b) => (
              <option key={b.code} value={b.code}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-colors"
        >
          {loading ? 'Verifying…' : 'Verify Account'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 font-bold text-xs rounded-sm">
          Error: {error}
        </div>
      )}

      {result && result.success && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-sm text-sm">
          <p className="font-bold">Success! Account Name:</p>
          <p className="font-semibold text-slate-900 mt-1">{result.accountName}</p>
        </div>
      )}

      {result && !result.success && (result.downtime || (result.message && result.message.toLowerCase().includes('downtime'))) && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-250 text-amber-800 rounded-sm text-sm space-y-2">
          <p className="font-bold">{result.message}</p>
          <div className="mt-2 space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1" htmlFor="manualFullName">Full Name (for manual verification)</label>
            <input 
              id="manualFullName" 
              type="text" 
              required 
              value={manualFullName} 
              onChange={(e) => setManualFullName(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-200 bg-white focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72]/20 outline-none text-sm rounded-sm" 
              placeholder="e.g., John Doe"
            />
            <button 
              onClick={handleManualSubmit} 
              className="w-full py-2 bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-slate-700 transition-colors"
            >
              Submit for Manual Review
            </button>
          </div>
        </div>
      )}

      {result && !result.success && !result.downtime && !(result.message && result.message.toLowerCase().includes('downtime')) && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-250 text-amber-800 rounded-sm text-sm">
          <p className="font-bold">Verification failed:</p>
          <p className="mt-1">{result.message}</p>
        </div>
      )}
    </div>
  );
}
