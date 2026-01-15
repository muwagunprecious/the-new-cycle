'use client'
import { useRef, useEffect } from 'react'
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
  const storeRef = useRef(undefined)
  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  return (
    <Provider store={storeRef.current}>
      <CartInitializer>
        {children}
      </CartInitializer>
    </Provider>
  )
}
