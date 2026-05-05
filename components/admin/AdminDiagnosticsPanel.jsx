    'use client'

import { useEffect, useState, useCallback } from 'react'
import {
    Activity as ActivityIcon,
    Users as UsersIcon,
    Zap as ZapIcon,
    AlertTriangle as AlertTriangleIcon,
    Clock as ClockIcon,
    Globe as GlobeIcon,
    RefreshCw as RefreshCwIcon,
    TrendingUp as TrendingUpIcon,
    Server as ServerIcon,
    Wifi as WifiIcon,
} from 'lucide-react'

const statusColor = (ms) => {
    if (ms === null || ms === undefined) return 'text-slate-400'
    if (ms < 800) return 'text-emerald-500'
    if (ms < 2000) return 'text-amber-500'
    return 'text-red-500'
}

const statusBg = (ms) => {
    if (ms === null || ms === undefined) return 'bg-slate-100'
    if (ms < 800) return 'bg-emerald-50'
    if (ms < 2000) return 'bg-amber-50'
    return 'bg-red-50'
}

const speedLabel = (ms) => {
    if (ms === null || ms === undefined) return 'No Data'
    if (ms < 800) return 'Fast'
    if (ms < 2000) return 'Moderate'
    return 'Slow'
}

const formatTime = (ts) => {
    if (!ts) return '-'
    const d = new Date(ts)
    return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const formatMs = (ms) => {
    if (ms === null || ms === undefined) return '—'
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
    return `${ms}ms`
}

export default function AdminDiagnosticsPanel() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [lastRefresh, setLastRefresh] = useState(null)
    const [autoRefresh, setAutoRefresh] = useState(true)

    const fetchDiagnostics = useCallback(async () => {
        try {
            setError(null)
            const res = await fetch('/api/admin/diagnostics', { cache: 'no-store' })
            if (!res.ok) throw new Error('Network response was not ok')
            const json = await res.json()
            if (json.success) {
                setData(json.data)
                setLastRefresh(new Date())
            } else {
                throw new Error(json.error || 'Failed to fetch diagnostics')
            }
        } catch (err) {
            console.error('Diagnostics Fetch Error:', err)
            setError(err.message || 'Network Error')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDiagnostics()
    }, [fetchDiagnostics])

    useEffect(() => {
        if (!autoRefresh) return
        const interval = setInterval(fetchDiagnostics, 15000) // Auto-refresh every 15s
        return () => clearInterval(interval)
    }, [autoRefresh, fetchDiagnostics])

    if (loading && !data) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
            </div>
        )
    }

    if (error && !data) {
        return (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
                    <WifiIcon size={32} />
                </div>
                <h3 className="text-xl font-black text-red-900">Network Error</h3>
                <p className="text-red-700 mt-2 max-w-sm mx-auto">
                    We couldn't connect to the diagnostics server. Please check your internet connection or try again.
                </p>
                <button 
                    onClick={fetchDiagnostics}
                    className="mt-6 flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
                >
                    <RefreshCwIcon size={18} className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Retrying...' : 'Retry Connection'}
                </button>
            </div>
        )
    }

    const activeUsers = data?.activeUsers ?? 0
    const avgLoad = data?.avgPageLoadMs
    const avgApi = data?.avgApiResponseMs
    const pageStats = data?.pageStats || []
    const slowPages = data?.slowPages || []
    const recentErrors = data?.recentErrors || []
    const activeSessions = data?.activeSessions || []
    const serverTime = data?.serverTime

    const overallHealth = (avgLoad === null || avgLoad < 1500) && recentErrors.length === 0 ? 'healthy' : recentErrors.length > 3 ? 'critical' : 'warning'

    return (
        <div className="space-y-6">
            {/* Header Row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${overallHealth === 'healthy' ? 'bg-emerald-500 animate-pulse' : overallHealth === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                    <span className="text-sm font-bold text-slate-600">
                        System {overallHealth === 'healthy' ? 'Healthy' : overallHealth === 'critical' ? 'Degraded' : 'Warning'}
                        {serverTime && <span className="text-slate-400 font-normal ml-2">· Server: {new Date(serverTime).toLocaleTimeString()}</span>}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {lastRefresh && (
                        <span className="text-xs text-slate-400">Updated {lastRefresh.toLocaleTimeString()}</span>
                    )}
                    <button
                        onClick={() => setAutoRefresh(a => !a)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${autoRefresh ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                    >
                        {autoRefresh ? '● Live' : '○ Paused'}
                    </button>
                    <button
                        onClick={fetchDiagnostics}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                        title="Refresh now"
                    >
                        <RefreshCwIcon size={14} />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Active Users */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <UsersIcon size={18} className="text-blue-600" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{activeUsers}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Active users right now</p>
                </div>

                {/* Avg Page Load */}
                <div className={`border rounded-2xl p-5 shadow-sm ${statusBg(avgLoad)}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <ClockIcon size={18} className={statusColor(avgLoad)} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${statusColor(avgLoad)}`}>{speedLabel(avgLoad)}</span>
                    </div>
                    <p className={`text-3xl font-black ${statusColor(avgLoad)}`}>{formatMs(avgLoad)}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Avg. page load time</p>
                </div>

                {/* Avg API Response */}
                <div className={`border rounded-2xl p-5 shadow-sm ${statusBg(avgApi)}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <ZapIcon size={18} className={statusColor(avgApi)} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${statusColor(avgApi)}`}>{speedLabel(avgApi)}</span>
                    </div>
                    <p className={`text-3xl font-black ${statusColor(avgApi)}`}>{formatMs(avgApi)}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Avg. API response</p>
                </div>

                {/* Errors */}
                <div className={`border rounded-2xl p-5 shadow-sm ${recentErrors.length > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <AlertTriangleIcon size={18} className={recentErrors.length > 0 ? 'text-red-500' : 'text-slate-400'} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${recentErrors.length > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                            {recentErrors.length > 0 ? 'Issues' : 'Clean'}
                        </span>
                    </div>
                    <p className={`text-3xl font-black ${recentErrors.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>{recentErrors.length}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Recent errors logged</p>
                </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Who's Online Now */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <WifiIcon size={16} className="text-emerald-500" />
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Who's Online Now</h3>
                        <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{activeSessions.length} active</span>
                    </div>
                    {activeSessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                            <GlobeIcon size={32} className="opacity-20 mb-2" />
                            <p className="text-xs font-bold">No active sessions detected</p>
                            <p className="text-[10px] text-slate-300 mt-1">Sessions appear after users visit the site</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                            {activeSessions.slice(0, 15).map((s, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-xs font-bold text-slate-700 truncate max-w-[140px]">{s.page || '/'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${s.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : s.role === 'SELLER' ? 'bg-blue-100 text-blue-600' : s.role === 'USER' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {s.role}
                                        </span>
                                        <span className="text-[9px] text-slate-400">{formatTime(s.lastSeen)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Slowest Pages */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUpIcon size={16} className="text-amber-500" />
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Page Load Breakdown</h3>
                    </div>
                    {pageStats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                            <ActivityIcon size={32} className="opacity-20 mb-2" />
                            <p className="text-xs font-bold">No page data yet</p>
                            <p className="text-[10px] text-slate-300 mt-1">Data appears as users navigate the site</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pageStats.map((p, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{p.page}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-400">{p.visits} visits</span>
                                            <span className={`text-xs font-black ${statusColor(p.avgMs)}`}>{formatMs(p.avgMs)}</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${p.avgMs < 800 ? 'bg-emerald-400' : p.avgMs < 2000 ? 'bg-amber-400' : 'bg-red-400'}`}
                                            style={{ width: `${Math.min(100, (p.avgMs / 4000) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Slow Page Events */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <ClockIcon size={16} className="text-red-400" />
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Slow Load Events (&gt;2s)</h3>
                        <span className="ml-auto text-[10px] font-bold bg-red-50 text-red-500 px-2 py-1 rounded-lg">{slowPages.length} events</span>
                    </div>
                    {slowPages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                            <ZapIcon size={28} className="text-emerald-300 mb-2" />
                            <p className="text-xs font-bold text-emerald-600">No slow pages detected!</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {slowPages.map((e, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-2 bg-red-50 rounded-xl border border-red-100">
                                    <span className="text-xs font-bold text-slate-700 truncate max-w-[180px]">{e.page}</span>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="text-xs font-black text-red-600">{formatMs(e.duration)}</span>
                                        <span className="text-[9px] text-slate-400">{formatTime(e.timestamp)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Error Log */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <ServerIcon size={16} className="text-slate-500" />
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Recent Errors</h3>
                        <span className={`ml-auto text-[10px] font-bold px-2 py-1 rounded-lg ${recentErrors.length > 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                            {recentErrors.length} logged
                        </span>
                    </div>
                    {recentErrors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                            <ActivityIcon size={28} className="text-emerald-300 mb-2" />
                            <p className="text-xs font-bold text-emerald-600">No errors recorded</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {recentErrors.map((e, i) => (
                                <div key={i} className="px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-red-500">{e.route || 'Unknown Route'}</span>
                                        <span className="text-[9px] text-slate-400">{formatTime(e.timestamp)}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 font-medium truncate">{e.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
