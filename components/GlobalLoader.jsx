'use client'

import { useSelector, useDispatch } from 'react-redux'
import Loading from './Loading'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { hideLoader } from '@/lib/features/ui/uiSlice'

const GlobalLoader = () => {
    const dispatch = useDispatch()
    const pathname = usePathname()
    const { isGlobalLoading, loadingMessage } = useSelector((state) => state.ui)
    const [show, setShow] = useState(false)

    // Hide loader automatically when pathname changes
    useEffect(() => {
        dispatch(hideLoader())
    }, [pathname, dispatch])

    useEffect(() => {
        let timeout
        if (isGlobalLoading) {
            timeout = setTimeout(() => setShow(true), 50)
        } else {
            setShow(false)
        }
        return () => clearTimeout(timeout)
    }, [isGlobalLoading])

    if (!show) return null

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm transition-opacity duration-300"
            aria-busy="true"
            aria-live="polite"
        >
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
                <Loading
                    message={loadingMessage}
                    size="12"
                    fullPage={false}
                    color="green-600"
                />
            </div>
        </div>
    )
}

export default GlobalLoader
