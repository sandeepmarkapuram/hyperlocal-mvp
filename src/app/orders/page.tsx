'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useOrders } from '@/context/order-context'
import { useAuth } from '@/context/auth-context'
import { NavBar } from '@/components/nav-bar'
import { Order, OrderStatus } from '@/data/mockData'

const ORDER_STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'received', label: 'Received' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'packed', label: 'Packed' },
  { key: 'out-for-delivery', label: 'On the Way' },
  { key: 'delivered', label: 'Delivered' },
]

const ACTIVE_COLOR = '#0C831F'
// "Cancelled" is a customer-facing state not present in the OrderStatus union,
// so it is carried as a plain string and cast when calling updateOrderStatus.
const CANCELLED_STATUS: string = 'Cancelled'

function formatOrderTime(createdAt: string): string {
  return new Date(createdAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function OrderCard({
  order,
  updateOrderStatus,
}: {
  order: Order
  updateOrderStatus: (id: string, status: OrderStatus) => void
}) {
  // Widen to string so the "Cancelled" state can be compared (OrderStatus has
  // no overlap with the "Cancelled" literal).
  const status: string = order.status
  const isCancelled = status === CANCELLED_STATUS
  const currentIndex = ORDER_STATUS_STEPS.findIndex(
    (step) => step.key === order.status
  )

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900">{order.storeName}</p>
          <p className="text-xs text-slate-500">
            #{order.id} · {formatOrderTime(order.createdAt)}
          </p>
        </div>
        <p className="font-medium text-slate-900 text-right">
          ₹{order.total.toLocaleString('en-IN')}
        </p>
      </div>

      <p className="text-sm text-slate-600">
        {order.items.map((item) => (
          <span key={item.name}>{item.qty} × {item.name}</span>
        ))}
      </p>

      {isCancelled ? (
        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-800">
          Order Cancelled
        </span>
      ) : (
        <div className="grid grid-cols-5 gap-1 items-start w-full overflow-hidden pt-1 relative">
          {/* Connecting bars between steps */}
          {ORDER_STATUS_STEPS.slice(0, -1).map((_, i) => (
            <span
              key={`stepper-bar-${i}`}
              aria-hidden="true"
              className={`absolute top-2.5 h-[1px] -z-10 ${
                currentIndex >= 0 && i < currentIndex
                  ? 'bg-[#0C831F]'
                  : 'bg-slate-200'
              }`}
              style={{
                left: `${i * 20 + 10}%`,
                right: `${100 - ((i + 1) * 20 + 10)}%`,
              }}
            />
          ))}
          {ORDER_STATUS_STEPS.map((step, i) => {
            const isCompleted = currentIndex >= 0 && i < currentIndex
            const isActive = currentIndex >= 0 && i === currentIndex
            const isReached = isCompleted || isActive
            return (
              <div key={step.key} className="flex flex-col items-center text-center min-w-0 relative z-10">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isReached
                      ? `bg-[#0C831F] text-white ${
                          isActive ? 'ring-4 ring-[#0C831F]/20' : ''
                        }`
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : ''}
                </span>
                <span
                  className={`text-[10px] leading-tight mt-1.5 break-words ${
                    isReached
                      ? 'font-semibold text-[#0C831F]'
                      : 'font-medium text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {order.status === 'received' && (
        <button
          type="button"
          onClick={() => updateOrderStatus(order.id, CANCELLED_STATUS as OrderStatus)}
          className="w-full rounded-xl bg-[#0C831F] py-3 text-sm font-semibold text-white"
        >
          Cancel Order
        </button>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
      <p className="text-lg font-medium text-slate-900 mb-2">
        No orders yet
      </p>
      <p className="text-sm text-slate-500 mb-4">
        Place your first order from a nearby store.
      </p>
      <Link href="/" className="text-sm font-semibold text-[#0C831F] hover:underline">
        Browse Stores
      </Link>
    </div>
  )
}

function LoginPrompt() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
      <p className="text-lg font-medium text-slate-900 mb-2">
        Log in to see your orders
      </p>
      <p className="text-sm text-slate-500 mb-4">
        Place orders while signed in to view your order history here.
      </p>
      <Link href="/login" className="text-sm font-semibold text-[#0C831F] hover:underline">
        Go to Login
      </Link>
    </div>
  )
}

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useOrders()
  const { user } = useAuth()
  const visibleOrders = user ? orders.filter((order) => order.userId === user.id) : []
  const sortedOrders = useMemo(
    () =>
      [...visibleOrders].sort(
        (a, b) => b.createdAt.localeCompare(a.createdAt)
      ),
    [visibleOrders]
  )

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-[#F4F6FB] pb-24 overflow-x-hidden">
      <NavBar />
      <div className="px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            ← Back to Stores
          </Link>
        </div>

        {!user ? (
          <LoginPrompt />
        ) : sortedOrders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {sortedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                updateOrderStatus={updateOrderStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}