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
    // For now, just send the name to a placeholder endpoint or log it.
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
    <div className="mt-8 p-6 border rounded-lg bg-gray-50 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Verify Bank Account (Admin)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="accountNumber">
            Account Number
          </label>
          <input
            id="accountNumber"
            type="text"
            required
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="e.g., 8144065785"
          />
        </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="firstname">
              First Name
            </label>
            <input
              id="firstname"
              type="text"
              required
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="lastname">
              Last Name
            </label>
            <input
              id="lastname"
              type="text"
              required
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., Doe"
            />
          </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="bankCode">
            Bank / Mobile Wallet
          </label>
          <select
            id="bankCode"
            required
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            className="w-full px-3 py-2 border rounded"
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
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Verifying…' : 'Verify Account'}
        </button>
      </form>

      {error && (
        <div className="mt-4 text-red-600 font-medium">Error: {error}</div>
      )}

      {result && result.success && (
        <div className="mt-4 p-4 bg-green-100 border rounded">
          <p className="font-medium">Success! Account Name:</p>
          <p>{result.accountName}</p>
        </div>
      )}

      {result && !result.success && (result.downtime || (result.message && result.message.toLowerCase().includes('downtime'))) && (
        <div className="mt-4 p-4 bg-yellow-100 border rounded">
          <p className="font-medium">{result.message}</p>
          <div className="mt-2">
            <label className="block text-sm font-medium mb-1" htmlFor="manualFullName">Full Name (for manual verification)</label>
            <input id="manualFullName" type="text" required value={manualFullName} onChange={(e) => setManualFullName(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="e.g., John Doe"/>
            <button onClick={handleManualSubmit} className="mt-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Submit for Manual Review</button>
          </div>
        </div>
      )}

      {result && !result.success && !result.downtime && !(result.message && result.message.toLowerCase().includes('downtime')) && (
        <div className="mt-4 p-4 bg-yellow-100 border rounded">
          <p className="font-medium">Verification failed:</p>
          <p>{result.message}</p>
        </div>
      )}
    </div>
  );
}
