'use client'
import { useRef, useEffect, useState } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { makeStore } from '../lib/store'
import { setInitialCart } from '../lib/features/cart/cartSlice'
import { hydrateSession } from '../lib/features/auth/authSlice'

const CartInitializer = ({ children }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('gocycle_cart')
      if (savedCart && savedCart !== 'undefined') {
        dispatch(setInitialCart(JSON.parse(savedCart)))
      }
    } catch (e) {
      console.error("Cart Hydration Error:", e)
      localStorage.removeItem('gocycle_cart')
    }
    dispatch(hydrateSession())
  }, [dispatch])


  return children
}

export default function StoreProvider({ children }) {
  const [mounted, setMounted] = useState(false)
  const storeRef = useRef(undefined)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  // Prevents hydration mismatches by ensuring the client-side DOM
  // is stable before React claims control.
  if (!mounted) {
    return (
      <Provider store={storeRef.current}>
        <div suppressHydrationWarning>{children}</div>
      </Provider>
    )
  }

  return (
    <Provider store={storeRef.current}>
      <CartInitializer>
        {children}
      </CartInitializer>
    </Provider>
  )
}
