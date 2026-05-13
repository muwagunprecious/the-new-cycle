'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { usePathname } from 'next/navigation'
import NewPurchaseModal from './NewPurchaseModal'
import toast from 'react-hot-toast'
import { markNotificationAsRead } from '@/backend-actions/actions/notification'
import { logout } from '@/lib/features/auth/authSlice'

const POLL_INTERVAL_MS = 10_000 // Poll every 10 seconds

export default function RealTimeNotifications() {
    const { user } = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const pathname = usePathname()
    const [activeNotification, setActiveNotification] = useState(null)
    const [queue, setQueue] = useState([])
    const processedIds = useRef(new Set())
    const intervalRef = useRef(null)
    const isAuthPage = pathname === '/login' || pathname === '/signup'

    const pollForNotifications = useCallback(async () => {
        if (!user?.id) return

        try {
            if (isAuthPage) return
            if (document.visibilityState !== 'visible') return

            const res = await fetch(`/api/notifications`, { cache: 'no-store' })
            
            if (res.status === 401) {
                console.warn("[Notifications] Unauthorized (401). Stopping polling.")
                clearInterval(intervalRef.current)
                return
            }

            if (!res.ok) return

            const data = await res.json()
            if (!data.success || !data.notifications?.length) return

            const incoming = data.notifications.filter(n => !processedIds.current.has(n.id))
            if (incoming.length === 0) return

            const newPopups = []

            for (const n of incoming) {
                processedIds.current.add(n.id)
                
                if (n.type === 'ORDER' && n.message.includes('BUYER:') && n.message.includes('ORDER:')) {
                    const fields = parseNotificationMessage(n.message)
                    newPopups.push({
                        id: n.id,
                        type: 'ORDER',
                        orderId: fields.ORDER || n.id,
                        buyerName: fields.BUYER || 'A buyer',
                        buyerPhone: fields.PHONE || 'N/A',
                        amount: parseInt(fields.AMOUNT, 10) || 0,
                        productName: fields.PROD || 'Battery Product',
                        collectionDate: fields.DATE || 'Scheduled',
                        verificationCode: fields.CODE || '',
                        quantity: fields.QTY || '1',
                        rawMessage: n.message,
                    })

                    toast.success(n.title || 'New purchase received!', {
                        duration: 6000,
                        icon: '🛍️',
                    })
                } else if (n.type === 'RESCHEDULE' || n.title.toLowerCase().includes('reschedule')) {
                    // Show reschedule popup
                    newPopups.push({
                        id: n.id,
                        type: 'RESCHEDULE',
                        orderId: n.message.match(/GCY-[A-Z0-9]+/)?.[0] || n.id,
                        buyerName: n.message.split(' ')[0] || 'User',
                        rawMessage: n.message,
                        title: n.title
                    })
                    toast.success(n.title || 'Reschedule Request', {
                        duration: 6000,
                        icon: '📅',
                    })
                } else {
                    // Standard notifications are marked read instantly
                    markNotificationAsRead(n.id).catch(() => {})
                }
            }

            if (newPopups.length > 0) {
                setQueue(prev => [...prev, ...newPopups])
            }
        } catch (err) {
            console.error("Polling error:", err)
        }
    }, [user?.id])

    useEffect(() => {
        if (!user?.id || isAuthPage) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            return
        }
        pollForNotifications()
        intervalRef.current = setInterval(pollForNotifications, POLL_INTERVAL_MS)
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [user?.id, pollForNotifications, isAuthPage])

    useEffect(() => {
        if (!activeNotification && queue.length > 0) {
            setActiveNotification(queue[0])
            setQueue(prev => prev.slice(1))
        }
    }, [queue, activeNotification])

    const handleHide = () => {
        setActiveNotification(null)
    }

    const handleDismiss = async () => {
        if (activeNotification?.id) {
            await markNotificationAsRead(activeNotification.id)
        }
        setActiveNotification(null)
    }

    if (!activeNotification) return null

    return (
        <NewPurchaseModal
            key={activeNotification.id}
            notification={activeNotification}
            userRole={user?.role}
            onClose={handleHide}
            onDismiss={handleDismiss}
        />
    )
}

function parseNotificationMessage(message = '') {
    const result = {}
    if (message.includes('|') && message.includes(':')) {
        message.split('|').forEach(part => {
            const colonIdx = part.indexOf(':')
            if (colonIdx === -1) return
            const key = part.slice(0, colonIdx).trim()
            const val = part.slice(colonIdx + 1).trim()
            result[key] = val
        })
    }
    return result
}
