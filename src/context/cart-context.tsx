'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { Item, CartItem } from '@/data/mockData'

const STORAGE_KEY = 'hl_cart'

interface CartState {
  itemsByStore: Record<string, CartItem[]>
  activeStoreId: string | null
}

interface CartContextValue {
  activeStoreId: string | null
  setActiveStore: (id: string | null) => void
  items: CartItem[]
  count: number
  total: number
  add: (item: Item) => void
  increment: (id: string) => void
  decrement: (id: string) => void
  remove: (id: string) => void
  clear: () => void
  hasItem: (id: string) => boolean
  qty: (id: string) => number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({ itemsByStore: {}, activeStoreId: null })

  // Hydrate from localStorage (SSR-safe)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        setState(JSON.parse(raw))
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, [])

  // Persist to localStorage so other tabs can pick it up
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // Listen for changes made in other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setState(JSON.parse(e.newValue))
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const items = state.activeStoreId ? (state.itemsByStore[state.activeStoreId] ?? []) : []
  const count = items.reduce((s, i) => s + i.qty, 0)
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  const setActiveStore = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, activeStoreId: id }))
  }, [])

  const add = useCallback((item: Item) => {
    setState((prev) => {
      const storeItems = prev.itemsByStore[prev.activeStoreId ?? ''] ?? []
      const existing = storeItems.find((i) => i.id === item.id)
      const nextStoreItems = existing
        ? storeItems.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
        : [...storeItems, { id: item.id, name: item.name, price: item.price, unit: item.unit, qty: 1, image: item.image }]
      return {
        ...prev,
        itemsByStore: { ...prev.itemsByStore, [prev.activeStoreId ?? '']: nextStoreItems },
      }
    })
  }, [])

  const increment = useCallback((id: string) => {
    setState((prev) => {
      const key = prev.activeStoreId ?? ''
      const storeItems = prev.itemsByStore[key] ?? []
      return {
        ...prev,
        itemsByStore: {
          ...prev.itemsByStore,
          [key]: storeItems.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)),
        },
      }
    })
  }, [])

  const decrement = useCallback((id: string) => {
    setState((prev) => {
      const key = prev.activeStoreId ?? ''
      const storeItems = prev.itemsByStore[key] ?? []
      const item = storeItems.find((i) => i.id === id)
      if (!item) return prev
      const nextStoreItems = item.qty === 1 ? storeItems.filter((i) => i.id !== id) : storeItems.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
      return {
        ...prev,
        itemsByStore: { ...prev.itemsByStore, [key]: nextStoreItems },
      }
    })
  }, [])

  const remove = useCallback((id: string) => {
    setState((prev) => {
      const key = prev.activeStoreId ?? ''
      return {
        ...prev,
        itemsByStore: {
          ...prev.itemsByStore,
          [key]: (prev.itemsByStore[key] ?? []).filter((i) => i.id !== id),
        },
      }
    })
  }, [])

  const clear = useCallback(() => {
    setState((prev) => {
      if (!prev.activeStoreId) return prev
      return {
        ...prev,
        itemsByStore: { ...prev.itemsByStore, [prev.activeStoreId]: [] },
      }
    })
  }, [])

  const hasItem = useCallback((id: string) => items.some((i) => i.id === id), [items])
  const qty = useCallback((id: string) => items.find((i) => i.id === id)?.qty ?? 0, [items])

  return (
    <CartContext.Provider value={{ activeStoreId: state.activeStoreId, setActiveStore, items, count, total, add, increment, decrement, remove, clear, hasItem, qty }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}

export function useSetActiveStore() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx.setActiveStore
}