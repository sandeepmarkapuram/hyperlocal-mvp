'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { Order, OrderStatus, type OrderItem } from '@/data/mockData'
import { supabase } from '@/lib/supabase'

interface OrderContextValue {
  orders: Order[]
  placeOrder: (input: Omit<Order, 'id' | 'status' | 'createdAt'>) => void
  updateOrderStatus: (id: string, status: OrderStatus) => void
}

const OrderContext = createContext<OrderContextValue | null>(null)

// Shape of a row in the public.orders table (snake_case columns).
interface OrderRow {
  id: string
  store_id: string
  store_name: string
  customer_name: string
  phone: string
  address: string
  payment_mode: 'upi' | 'cod'
  items: OrderItem[]
  subtotal: number
  total: number
  delivery_fee: number
  status: OrderStatus
  created_at: string
}

const toOrder = (row: OrderRow): Order => ({
  id: row.id,
  storeId: row.store_id,
  storeName: row.store_name,
  customerName: row.customer_name,
  phone: row.phone,
  address: row.address,
  paymentMode: row.payment_mode,
  items: row.items,
  total: row.total,
  status: row.status,
  createdAt: row.created_at,
})

const toOrderRow = (order: Order): OrderRow => ({
  id: order.id,
  store_id: order.storeId,
  store_name: order.storeName,
  customer_name: order.customerName,
  phone: order.phone,
  address: order.address,
  payment_mode: order.paymentMode,
  items: order.items,
  subtotal: order.total,
  total: order.total,
  status: order.status,
  created_at: order.createdAt,
  // The orders table keeps a delivery_fee column that the client Order type
  // does not expose; default to 0 on insert.
  delivery_fee: 0,
})

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])

  // Fetch existing orders from Supabase on mount.
  useEffect(() => {
    let mounted = true

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from<'orders', OrderRow>('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch orders', error)
      } else if (mounted) {
        setOrders((data ?? []).map(toOrder))
      }
    }

    fetchOrders()

    return () => {
      mounted = false
    }
  }, [])

  // Subscribe to live changes so orders placed or updated on another device
  // appear immediately without a refresh.
  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload: { eventType: string; new: unknown; old: unknown }) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as OrderRow | null
            if (!row) return
            // Ignore inserts for orders we already added optimistically.
            setOrders((prev) =>
              prev.some((o) => o.id === row.id) ? prev : [toOrder(row), ...prev]
            )
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as OrderRow | null
            if (!row) return
            setOrders((prev) => prev.map((o) => (o.id === row.id ? toOrder(row) : o)))
          } else if (payload.eventType === 'DELETE') {
            const row = payload.old as OrderRow | null
            if (!row) return
            setOrders((prev) => prev.filter((o) => o.id !== row.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const placeOrder = useCallback(
    (input: Omit<Order, 'id' | 'status' | 'createdAt'>) => {
      const id = 'ORD-' + Date.now()
      const createdAt = new Date().toISOString()
      const order: Order = { ...input, id, status: 'received', createdAt }
      setOrders((prev) => [order, ...prev])
      supabase
        .from('orders')
        .insert(toOrderRow(order))
        .then(({ error }) => {
          if (error) {
            console.error('Failed to place order', error)
          }
        })
    },
    []
  )

  const updateOrderStatus = useCallback(
    (id: string, status: OrderStatus) => {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
      supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Failed to update order status', error)
          }
        })
    },
    []
  )

  return (
    <OrderContext.Provider value={{ orders, placeOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  )
}

export const useOrders = () => {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrders must be used within an OrderProvider')
  return ctx
}