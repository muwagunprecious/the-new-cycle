'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import NewPurchaseModal from './NewPurchaseModal'
import toast from 'react-hot-toast'
import { markNotificationAsRead } from '@/backend-actions/actions/notification'

const POLL_INTERVAL_MS = 20_000 // Poll every 20 seconds

export default function RealTimeNotifications() {
    const { user } = useSelector(state => state.auth)
    const [activeNotification, setActiveNotification] = useState(null)
    const [queue, setQueue] = useState([])
    const processedIds = useRef(new Set())
    const intervalRef = useRef(null)

    const pollForNotifications = useCallback(async () => {
        if (!user?.id || user.role !== 'SELLER') return

        try {
            if (document.visibilityState !== 'visible') return

            const res = await fetch(`/api/notifications`, { cache: 'no-store' })
            if (!res.ok) return

            const data = await res.json()
            if (!data.success || !data.notifications?.length) return

            const incoming = data.notifications.filter(n => !processedIds.current.has(n.id))
            if (incoming.length === 0) return

            const newPopups = []

            for (const n of incoming) {
                processedIds.current.add(n.id)
                
                if (n.message.includes('BUYER:') && n.message.includes('ORDER:')) {
                    const fields = parseNotificationMessage(n.message)
                    newPopups.push({
                        id: n.id,
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
                } else if (n.title.toLowerCase().includes('reschedule') || n.message.toLowerCase().includes('reschedule')) {
                    // Show reschedule popup
                    newPopups.push({
                        id: n.id,
                        orderId: n.message.match(/GCY-[A-Z0-9]+/)?.[0] || n.id,
                        buyerName: n.message.split(' ')[0] || 'Buyer',
                        type: 'RESCHEDULE',
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
    }, [user?.id, user?.role])

    useEffect(() => {
        if (!user?.id || user.role !== 'SELLER') {
            clearInterval(intervalRef.current)
            return
        }
        pollForNotifications()
        intervalRef.current = setInterval(pollForNotifications, POLL_INTERVAL_MS)
        return () => clearInterval(intervalRef.current)
    }, [user?.id, user?.role, pollForNotifications])

    useEffect(() => {
        if (!activeNotification && queue.length > 0) {
            setActiveNotification(queue[0])
            setQueue(prev => prev.slice(1))
        }
    }, [queue, activeNotification])

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
            onClose={handleDismiss}
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
