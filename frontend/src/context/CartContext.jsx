import { createContext, useContext, useState, useCallback } from 'react'
import { cartApi } from '../api/cartApi'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  const refreshCount = useCallback(async () => {
    if (!isLoggedIn) { setCartCount(0); return }
    try {
      const res = await cartApi.getCount()
      setCartCount(res.data)
    } catch {
      setCartCount(0)
    }
  }, [isLoggedIn])

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, refreshCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
