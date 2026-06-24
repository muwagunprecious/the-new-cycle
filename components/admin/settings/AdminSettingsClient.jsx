'use client'

import { useState, useEffect } from "react"
import { ShieldCheck as ShieldCheckIcon, Globe as GlobeIcon, Key as KeyIcon, Send as SendIcon, Save as SaveIcon, RefreshCw as RefreshCwIcon, CheckCircle2 as CheckCircle2Icon, AlertCircle as AlertCircleIcon, DollarSign as DollarSignIcon, Battery as BatteryIcon, ChevronDown as ChevronDownIcon, ChevronUp as ChevronUpIcon } from "lucide-react"
import toast from "react-hot-toast"
import { getSettingsByGroup, updateSettings, fetchTermiiSenderIds, getTermiiFullStatus, testQoreIDConnection, getPricingConfig, updatePricingConfig } from "@/backend-actions/actions/settings"
import { DEFAULT_BATTERY_PRICES, BATTERY_TYPES } from "@/lib/pricing"
import Button from "@/components/Button"
import Loading from "@/components/Loading"
import { useSearchParams } from "next/navigation"

export default function AdminSettingsClient({ initialTermii, initialQoreID, initialPricing, initialTermiiStatus }) {
    const searchParams = useSearchParams()
    const tabParam = searchParams.get('tab')

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [fetchingSenders, setFetchingSenders] = useState(false)
    const [refreshingStatus, setRefreshingStatus] = useState(false)
    const [testingQoreID, setTestingQoreID] = useState(false)
    
    const [config, setConfig] = useState({
        apiKey: initialTermii?.apiKey || '',
        baseUrl: initialTermii?.baseUrl || 'https://api.ng.termii.com',
        senderId: initialTermii?.senderId || 'N-Alert'
    })

    const [qoreidConfig, setQoreidConfig] = useState({
        clientId: initialQoreID?.clientId || '',
        secretKey: initialQoreID?.secretKey || '',
        baseUrl: initialQoreID?.baseUrl || 'https://api.qoreid.com'
    })
    
    const [status, setStatus] = useState({
        balance: initialTermiiStatus?.balance || 0,
        currency: initialTermiiStatus?.currency || 'NGN',
        senders: initialTermiiStatus?.senders || [],
        lastChecked: initialTermiiStatus ? new Date().toLocaleTimeString() : null
    })

    const [activeTab, setActiveTab] = useState(tabParam || 'termii')
    const [expandedType, setExpandedType] = useState(BATTERY_TYPES[0])
    const [expandedSize, setExpandedSize] = useState(null)

    useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam)
            if (tabParam === 'pricing') {
                setExpandedType(BATTERY_TYPES[0])
            }
        }
    }, [tabParam])

    const [pricingTable, setPricingTable] = useState(initialPricing || JSON.parse(JSON.stringify(DEFAULT_BATTERY_PRICES)))
    const [savingPricing, setSavingPricing] = useState(false)

    const loadData = async () => {
        // This is now handled via props for initial load
        // But we keep it for case where we need to re-fetch manually?
        // Actually, let's keep it empty or remove if not needed.
    }

    // REMOVED useEffect for initial loadData


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
        
        let res;
        if (activeTab === 'termii') {
            const settingsList = [
                { key: 'apiKey', value: config.apiKey },
                { key: 'baseUrl', value: config.baseUrl },
                { key: 'senderId', value: config.senderId }
            ]
            res = await updateSettings(settingsList, 'termii')
        } else {
            const settingsList = [
                { key: 'clientId', value: qoreidConfig.clientId },
                { key: 'secretKey', value: qoreidConfig.secretKey },
                { key: 'baseUrl', value: qoreidConfig.baseUrl }
            ]
            res = await updateSettings(settingsList, 'qoreid')
        }

        if (res.success) {
            toast.success(`${activeTab === 'termii' ? 'Termii' : 'QoreID'} configuration saved!`)
        } else {
            toast.error(res.error || "Failed to save settings")
        }
        setSaving(false)
    }

    const handleSavePricing = async () => {
        setSavingPricing(true)
        const res = await updatePricingConfig(pricingTable)
        if (res.success) {
            toast.success("Pricing formula saved! Sellers will see the updated prices immediately.")
        } else {
            toast.error(res.error || "Failed to save pricing")
        }
        setSavingPricing(false)
    }

    const handlePriceChange = (batteryType, amps, value) => {
        setPricingTable(prev => ({
            ...prev,
            [batteryType]: {
                ...prev[batteryType],
                [amps]: value === '' ? '' : parseInt(value, 10) || 0
            }
        }))
    }

    const handleResetPricing = () => {
        setPricingTable(JSON.parse(JSON.stringify(DEFAULT_BATTERY_PRICES)))
        toast("Prices reset to system defaults (not saved yet)", { icon: '↩️' })
    }

    const handleTestQoreID = async () => {
        setTestingQoreID(true)
        const res = await testQoreIDConnection(qoreidConfig.clientId, qoreidConfig.secretKey, qoreidConfig.baseUrl)
        if (res.success) {
            toast.success(res.message)
        } else {
            toast.error(res.error)
        }
        setTestingQoreID(false)
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

    const toggleType = (type) => {
        setExpandedType(expandedType === type ? null : type)
    }

    const toggleSize = (sizeKey) => {
        setExpandedSize(expandedSize === sizeKey ? null : sizeKey)
    }

    if (loading) return <Loading />

    const activeSenders = status.senders.filter(s => s.status === 'active').map(s => s.sender_id)

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">System <span className="text-[#05DF72]">Settings</span></h1>
                    <p className="text-slate-500 mt-1">Manage global platform configurations and API gateways.</p>
                </div>
                {status.lastChecked && (
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Last Sync</p>
                        <p className="text-sm font-bold text-slate-600">{status.lastChecked}</p>
                    </div>
                )}
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-sm w-fit flex-wrap border border-slate-200">
                <button 
                    onClick={() => setActiveTab('termii')}
                    className={`px-6 py-2.5 rounded-sm text-sm font-black transition-all ${activeTab === 'termii' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Termii SMS
                </button>
                <button 
                    onClick={() => setActiveTab('qoreid')}
                    className={`px-6 py-2.5 rounded-sm text-sm font-black transition-all ${activeTab === 'qoreid' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    QoreID (Live)
                </button>
                <button 
                    onClick={() => setActiveTab('pricing')}
                    className={`px-6 py-2.5 rounded-sm text-sm font-black transition-all ${activeTab === 'pricing' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    💰 Pricing Formula
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Config Card */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">

                        {/* ── Termii Tab ── */}
                        {activeTab === 'termii' && (
                            <>
                                <div className="bg-slate-900 p-8 text-white border-b border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#05DF72]/20 rounded-sm flex items-center justify-center border border-[#05DF72]/30">
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
                                        <div className="space-y-2 col-span-full">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <KeyIcon size={12} /> Termii API Key (Live)
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Enter your TLE... key"
                                                value={config.apiKey}
                                                onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-5 py-4 font-mono text-sm outline-none focus:border-[#05DF72] transition-all"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <GlobeIcon size={12} /> Regional Base URL
                                            </label>
                                            <select
                                                value={config.baseUrl}
                                                onChange={e => setConfig({ ...config, baseUrl: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-5 py-4 text-sm font-bold outline-none focus:border-[#05DF72] appearance-none"
                                            >
                                                <option value="https://api.ng.termii.com">api.ng.termii.com (Nigeria)</option>
                                                <option value="https://v3.api.termii.com">v3.api.termii.com (Global v3)</option>
                                            </select>
                                        </div>

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
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-sm px-5 py-4 text-sm font-black text-[#05DF72] outline-none focus:border-[#05DF72] appearance-none"
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
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-sm px-5 py-4 text-sm font-black text-slate-900 outline-none focus:border-[#05DF72]"
                                                        />
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleFetchSenders}
                                                    disabled={fetchingSenders}
                                                    className="px-4 bg-slate-100 hover:bg-slate-200 rounded-sm transition-colors text-slate-600 disabled:opacity-50 border border-slate-200"
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
                                        className="w-full py-4 text-lg"
                                    >
                                        Save Configuration
                                    </Button>
                                </form>
                            </>
                        )}

                        {/* ── QoreID Tab ── */}
                        {activeTab === 'qoreid' && (
                            <>
                                <div className="bg-[#000000] p-8 text-white border-b border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-500/20 rounded-sm flex items-center justify-center border border-blue-500/30">
                                            <ShieldCheckIcon className="text-blue-500" size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold tracking-tight">QoreID Identity Configuration</h2>
                                            <p className="text-slate-400 text-sm">Manage your NIN/CAC verification credentials</p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleSave} className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <KeyIcon size={12} /> QoreID Client ID
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter your Client ID"
                                                value={qoreidConfig.clientId}
                                                onChange={e => setQoreidConfig({ ...qoreidConfig, clientId: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-5 py-4 font-mono text-sm outline-none focus:border-blue-500 transition-all"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <KeyIcon size={12} /> QoreID Secret Key
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Enter your Secret Key"
                                                value={qoreidConfig.secretKey}
                                                onChange={e => setQoreidConfig({ ...qoreidConfig, secretKey: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-5 py-4 font-mono text-sm outline-none focus:border-blue-500 transition-all"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <GlobeIcon size={12} /> API Environment (Base URL)
                                            </label>
                                            <select
                                                value={qoreidConfig.baseUrl}
                                                onChange={e => setQoreidConfig({ ...qoreidConfig, baseUrl: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-sm px-5 py-4 text-sm font-bold outline-none focus:border-blue-500 appearance-none"
                                            >
                                                <option value="https://api.qoreid.com">api.qoreid.com (Live)</option>
                                                <option value="https://sandbox.qoreid.com">sandbox.qoreid.com (Sandbox)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            type="button"
                                            onClick={handleTestQoreID}
                                            loading={testingQoreID}
                                            loadingText="Testing..."
                                            variant="secondary"
                                            className="flex-1 py-4"
                                        >
                                            Test Connection
                                        </Button>
                                        <Button
                                            type="submit"
                                            loading={saving}
                                            loadingText="Saving..."
                                            icon={SaveIcon}
                                            className="flex-[2] py-4"
                                        >
                                            Save QoreID Settings
                                        </Button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* ── Pricing Formula Tab ── */}
                        {activeTab === 'pricing' && (
                            <>
                                <div className="bg-[#fcfdfd] p-8 border-b border-slate-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#05DF72]/20 rounded-sm flex items-center justify-center border border-[#05DF72]/30">
                                            <DollarSignIcon className="text-[#05DF72]" size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold tracking-tight text-slate-900">Suggested Price Formula</h2>
                                            <p className="text-slate-500 text-sm">Set the suggested selling price per battery type and size.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 space-y-4 bg-white">
                                    {Object.entries(pricingTable).map(([batteryType, sizes]) => (
                                        <div key={batteryType} className="border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                                            {/* Accordion Header */}
                                            <button 
                                                onClick={() => toggleType(batteryType)}
                                                className={`w-full flex items-center justify-between p-5 text-left transition-all ${expandedType === batteryType ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-sm ${expandedType === batteryType ? 'bg-[#05DF72]/10 text-[#05DF72]' : 'bg-slate-100 text-slate-400'}`}>
                                                        <BatteryIcon size={20} />
                                                    </div>
                                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{batteryType}</h3>
                                                </div>
                                                {expandedType === batteryType ? <ChevronUpIcon size={20} className="text-slate-400" /> : <ChevronDownIcon size={20} className="text-slate-400" />}
                                            </button>

                                            {/* Accordion Content */}
                                            {expandedType === batteryType && (
                                                <div className="p-6 bg-white space-y-3 border-t border-slate-200">
                                                    {Object.entries(sizes).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([amps, price]) => {
                                                        const sizeKey = `${batteryType}_${amps}`
                                                        const isExpanded = expandedSize === sizeKey
                                                        
                                                        return (
                                                            <div key={amps} className="border border-slate-200 rounded-sm overflow-hidden bg-slate-50/50">
                                                                <button 
                                                                    onClick={() => toggleSize(sizeKey)}
                                                                    className={`w-full p-4 flex items-center justify-between hover:bg-slate-100 transition-colors text-left ${isExpanded ? 'bg-slate-100' : ''}`}
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="text-xs font-black text-slate-700 bg-white px-3 py-1 rounded-sm shadow-sm">{amps} Ah</span>
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#05DF72]">₦/unit</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        {!isExpanded && <span className="text-sm font-bold text-slate-900">₦{price.toLocaleString()}</span>}
                                                                        {isExpanded ? <ChevronUpIcon size={16} className="text-slate-400" /> : <ChevronDownIcon size={16} className="text-slate-400" />}
                                                                    </div>
                                                                </button>

                                                                {isExpanded && (
                                                                    <div className="p-4 bg-white border-t border-slate-200 space-y-4">
                                                                        <div className="relative">
                                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                step="500"
                                                                                value={price}
                                                                                onChange={e => handlePriceChange(batteryType, amps, e.target.value)}
                                                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-lg font-black text-slate-900 outline-none focus:border-[#05DF72] transition-all"
                                                                                placeholder="Enter unit price"
                                                                            />
                                                                        </div>
                                                                        <div className="bg-slate-50 p-3 rounded-sm flex items-center justify-between border border-slate-200">
                                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Default</span>
                                                                            <span className="text-xs font-bold text-slate-600">₦{(DEFAULT_BATTERY_PRICES[batteryType]?.[amps] || 0).toLocaleString()}</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className="pt-8 border-t border-slate-200 flex flex-col sm:row gap-4 mt-4">
                                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                                            <button
                                                type="button"
                                                onClick={handleResetPricing}
                                                className="flex-1 py-4 px-6 rounded-sm border border-slate-200 text-slate-600 text-sm font-black hover:bg-slate-50 transition-all"
                                            >
                                                ↩ Reset to Defaults
                                            </button>
                                            <Button
                                                type="button"
                                                onClick={handleSavePricing}
                                                loading={savingPricing}
                                                loadingText="Saving..."
                                                icon={SaveIcon}
                                                className="flex-[2] py-4 text-lg"
                                            >
                                                Save Pricing Formula
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-blue-50 border border-blue-200 rounded-sm">
                            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-2">
                                <AlertCircleIcon size={18} />
                                <span>Note on Sender IDs</span>
                            </div>
                            <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                If your selected Sender ID is <b>Pending</b>, Termii will reject OTP requests with a "404 ApplicationSenderId not found" error. Please ensure your ID is <b>Active</b> in the status panel.
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 border border-slate-200 rounded-sm">
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

                <div className="space-y-6">
                    <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 space-y-4">
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
                            <div className="h-1 bg-slate-100 rounded-sm overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${status.balance < 500 ? 'bg-red-500' : 'bg-[#05DF72]'}`}
                                    style={{ width: `${Math.min((status.balance / 5000) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sender ID Status</h3>
                        </div>
                        <div className="divide-y divide-slate-200 max-h-[400px] overflow-y-auto">
                            {status.senders.length > 0 ? (
                                status.senders.map((s, idx) => (
                                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{s.sender_id}</p>
                                            <p className="text-[10px] text-slate-400">{s.country}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-sm text-[10px] font-black uppercase tracking-tighter border border-slate-200 ${
                                            s.status === 'active' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 
                                            s.status === 'pending' ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-red-100 text-red-600 border-red-200'
                                        }`}>
                                            {s.status}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center space-y-2">
                                    <div className="w-10 h-10 bg-slate-100 rounded-sm flex items-center justify-center mx-auto text-slate-300 border border-slate-200">
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
