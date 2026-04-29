'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useSelector } from 'react-redux'

/**
 * Silently tracks:
 * 1. Active user heartbeats (every 30s)
 * 2. Page load times (using Performance API)
 */
export default function PerformanceTracker() {
    const pathname = usePathname()
    const { user } = useSelector(state => state.auth)
    const sessionIdRef = useRef(null)
    const pageStartRef = useRef(Date.now())

    // Generate or reuse a session ID
    useEffect(() => {
        if (!sessionIdRef.current) {
            const stored = sessionStorage.getItem('gc_session_id')
            if (stored) {
                sessionIdRef.current = stored
            } else {
                const newId = `s_${Math.random().toString(36).substr(2, 12)}_${Date.now()}`
                sessionStorage.setItem('gc_session_id', newId)
                sessionIdRef.current = newId
            }
        }
    }, [])

    // Track page load time when route changes
    useEffect(() => {
        const start = pageStartRef.current
        const sendMetric = () => {
            const duration = Date.now() - start
            // Use sendBeacon for non-blocking
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/diagnostics/metrics', JSON.stringify({ page: pathname, duration }))
            } else {
                fetch('/api/diagnostics/metrics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ page: pathname, duration }),
                    keepalive: true
                }).catch(() => {})
            }
        }

        // Use requestIdleCallback so it doesn't impact performance
        if (typeof window !== 'undefined') {
            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(sendMetric, { timeout: 2000 })
            } else {
                setTimeout(sendMetric, 500)
            }
        }

        pageStartRef.current = Date.now()
    }, [pathname])

    // Heartbeat every 30 seconds
    useEffect(() => {
        const sendHeartbeat = () => {
            const sessionId = sessionIdRef.current
            if (!sessionId) return
            const payload = JSON.stringify({
                sessionId,
                page: pathname,
                role: user?.role || 'visitor'
            })
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/diagnostics/heartbeat', payload)
            } else {
                fetch('/api/diagnostics/heartbeat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                    keepalive: true
                }).catch(() => {})
            }
        }

        sendHeartbeat() // Fire immediately on mount
        const interval = setInterval(sendHeartbeat, 30000) // Every 30s
        return () => clearInterval(interval)
    }, [pathname, user?.role])

    return null // This component renders nothing
}
