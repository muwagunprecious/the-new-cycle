'use client'

import { useState, useEffect } from "react"
import { ShieldCheck as ShieldCheckIcon, Globe as GlobeIcon, Key as KeyIcon, Send as SendIcon, Save as SaveIcon, RefreshCw as RefreshCwIcon, CheckCircle2 as CheckCircle2Icon, AlertCircle as AlertCircleIcon } from "lucide-react"
import toast from "react-hot-toast"
import { getSettingsByGroup, updateSettings, fetchTermiiSenderIds, getTermiiFullStatus } from "@/backend/actions/settings"
import Button from "@/components/Button"
import Loading from "@/components/Loading"

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [fetchingSenders, setFetchingSenders] = useState(false)
    const [refreshingStatus, setRefreshingStatus] = useState(false)
    
    const [config, setConfig] = useState({
        apiKey: '',
        baseUrl: 'https://api.ng.termii.com',
        senderId: 'N-Alert'
    })
    
    const [status, setStatus] = useState({
        balance: 0,
        currency: 'NGN',
        senders: [],
        lastChecked: null
    })

    const loadData = async () => {
        const settingsRes = await getSettingsByGroup('termii')
        let currentConfig = config
        
        if (settingsRes.success && Object.keys(settingsRes.data).length > 0) {
            currentConfig = { ...config, ...settingsRes.data }
            setConfig(currentConfig)
        }
        
        if (currentConfig.apiKey) {
            const statusRes = await getTermiiFullStatus(currentConfig.apiKey, currentConfig.baseUrl)
            if (statusRes.success) {
                setStatus({
                    balance: statusRes.balance,
                    currency: statusRes.currency,
                    senders: statusRes.senders,
                    lastChecked: new Date().toLocaleTimeString()
                })
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleRefreshStatus = async () => {
        setRefreshingStatus(true)
        const res = await getTermiiFullStatus(config.apiKey, config.baseUrl)
        if (res.success) {
            setStatus({
                balance: res.balance,
                currency: res.currency,
                senders: res.senders,
                lastChecked: new Date().toLocaleTimeString()
            })
            toast.success("Termii status refreshed")
        } else {
            toast.error(res.error || "Failed to refresh status")
        }
        setRefreshingStatus(false)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        const settingsList = [
            { key: 'apiKey', value: config.apiKey },
            { key: 'baseUrl', value: config.baseUrl },
            { key: 'senderId', value: config.senderId }
        ]
        
        const res = await updateSettings(settingsList, 'termii')
        if (res.success) {
            toast.success("Termii configuration saved!")
        } else {
            toast.error(res.error || "Failed to save settings")
        }
        setSaving(false)
    }

    const handleFetchSenders = async () => {
        if (!config.apiKey) {
            toast.error("Please enter your API Key first")
            return
        }
        
        setFetchingSenders(true)
        const res = await fetchTermiiSenderIds(config.apiKey, config.baseUrl)
        if (res.success) {
            setStatus(prev => ({ ...prev, senders: res.allSenders }))
            if (res.senders.length > 0 && !res.senders.includes(config.senderId)) {
                setConfig(prev => ({ ...prev, senderId: res.senders[0] }))
            }
            toast.success(`Found ${res.allSenders.length} sender IDs`)
        } else {
            toast.error(res.error || "Failed to fetch sender IDs")
        }
        setFetchingSenders(false)
    }

    if (loading) return <Loading />

    // Simplified list for the dropdown (only active ones)
    const activeSenders = status.senders.filter(s => s.status === 'active').map(s => s.sender_id)

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">System <span className="text-[#05DF72]">Settings</span></h1>
                    <p className="text-slate-500 mt-1">Manage global platform configurations and SMS gateway.</p>
                </div>
                {status.lastChecked && (
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Last Sync</p>
                        <p className="text-sm font-bold text-slate-600">{status.lastChecked}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Termii SMS Config Card */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                        <div className="bg-slate-900 p-8 text-white">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#05DF72]/20 rounded-2xl flex items-center justify-center border border-[#05DF72]/30">
                                    <SendIcon className="text-[#05DF72]" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight">Termii SMS Configuration</h2>
                                    <p className="text-slate-400 text-sm">Update your API credentials and sender preferences</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* API Key */}
                                <div className="space-y-2 col-span-full">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <KeyIcon size={12} /> Termii API Key (Live)
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Enter your TLE... key"
                                        value={config.apiKey}
                                        onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-mono text-sm outline-none focus:ring-2 focus:ring-[#05DF72]/20 focus:border-[#05DF72] transition-all"
                                        required
                                    />
                                </div>

                                {/* Base URL */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <GlobeIcon size={12} /> Regional Base URL
                                    </label>
                                    <select
                                        value={config.baseUrl}
                                        onChange={e => setConfig({ ...config, baseUrl: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#05DF72]/20 focus:border-[#05DF72] appearance-none"
                                    >
                                        <option value="https://api.ng.termii.com">api.ng.termii.com (Nigeria)</option>
                                        <option value="https://v3.api.termii.com">v3.api.termii.com (Global v3)</option>
                                    </select>
                                </div>

                                {/* Sender ID */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <RefreshCwIcon size={12} /> Sender ID
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            {activeSenders.length > 0 ? (
                                                <select
                                                    value={config.senderId}
                                                    onChange={e => setConfig({ ...config, senderId: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black text-[#05DF72] outline-none focus:ring-2 focus:ring-[#05DF72]/20 focus:border-[#05DF72] appearance-none"
                                                >
                                                    {activeSenders.map(id => (
                                                        <option key={id} value={id}>{id}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    placeholder="e.g. N-Alert"
                                                    value={config.senderId}
                                                    onChange={e => setConfig({ ...config, senderId: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-[#05DF72]/20 focus:border-[#05DF72]"
                                                />
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleFetchSenders}
                                            disabled={fetchingSenders}
                                            className="px-4 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors text-slate-600 disabled:opacity-50"
                                            title="Sync Sender IDs"
                                        >
                                            <RefreshCwIcon className={fetchingSenders ? "animate-spin" : ""} size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                loading={saving}
                                loadingText="Saving..."
                                icon={SaveIcon}
                                className="w-full shadow-lg shadow-[#05DF72]/20 py-4 text-lg"
                            >
                                Save Configuration
                            </Button>
                        </form>
                    </div>

                    {/* Proactive Help */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl">
                            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-2">
                                <AlertCircleIcon size={18} />
                                <span>Note on Sender IDs</span>
                            </div>
                            <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                If your selected Sender ID is <b>Pending</b>, Termii will reject OTP requests with a "404 ApplicationSenderId not found" error. Please ensure your ID is <b>Active</b> in the status panel.
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                            <div className="flex items-center gap-2 text-slate-600 font-bold text-sm mb-2">
                                <ShieldCheckIcon size={18} />
                                <span>Security</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                Your API key is stored securely. Changes take effect immediately for all user verification flows.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Dashboard Sidebar */}
                <div className="space-y-6">
                    {/* Wallet Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Balance</h3>
                            <button 
                                onClick={handleRefreshStatus} 
                                disabled={refreshingStatus}
                                className="text-slate-400 hover:text-[#05DF72] transition-colors"
                            >
                                <RefreshCwIcon size={14} className={refreshingStatus ? "animate-spin" : ""} />
                            </button>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-400">{status.currency}</span>
                            <span className="text-4xl font-black text-slate-900">{status.balance.toLocaleString()}</span>
                        </div>
                        <div className="pt-2">
                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${status.balance < 500 ? 'bg-red-500' : 'bg-[#05DF72]'}`}
                                    style={{ width: `${Math.min((status.balance / 5000) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Sender ID Status List */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-50">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sender ID Status</h3>
                        </div>
                        <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                            {status.senders.length > 0 ? (
                                status.senders.map((s, idx) => (
                                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{s.sender_id}</p>
                                            <p className="text-[10px] text-slate-400">{s.country}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                                            s.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 
                                            s.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                            {s.status}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center space-y-2">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                        <AlertCircleIcon size={20} />
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium tracking-tight">No Sender IDs found. Check your Termii dashboard.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
