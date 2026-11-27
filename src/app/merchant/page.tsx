'use client'

import { Suspense } from "react"
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useOrders } from '@/context/order-context'
import { OrderStatus } from '@/data/mockData'
import { NavBar } from '@/components/nav-bar'

function normalizeStatus(status: string) {
  return status.toLowerCase()
}

function MerchantContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = (searchParams.get('status') || 'all').toLowerCase()

  const { orders, updateOrderStatus } = useOrders()

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((o) => normalizeStatus(o.status) === statusFilter)

  const statusLabels: Record<OrderStatus, string> = {
    received: 'Received',
    accepted: 'Accepted',
    packed: 'Packed',
    'out-for-delivery': 'Out for Delivery',
    delivered: 'Delivered',
  }

  const statusColors: Record<OrderStatus, string> = {
    received: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-indigo-100 text-indigo-800',
    packed: 'bg-green-100 text-green-800',
    'out-for-delivery': 'bg-orange-100 text-orange-800',
    delivered: 'bg-emerald-100 text-emerald-800',
  }

  return (
    <div className="max-w-[480px] mx-auto p-4">
      <NavBar />
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Merchant Dashboard
        </h1>
        <p className="text-sm text-slate-500">Incoming orders</p>
      </header>

      {/* Status filter chips */}
      <div className="mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {(['all', 'received', 'accepted', 'packed', 'out-for-delivery', 'delivered'] as const).map((status) => {
            const active = statusFilter === status
            const ordersCount = status === 'all'
              ? orders.length
              : orders.filter((o) => o.status.toLowerCase() === status).length
            const label = status === 'all' ? 'All' : statusLabels[status]
            return (
              <button
                key={status}
                type="button"
                onClick={() => router.push(status === 'all' ? '/merchant' : `?status=${status}`)}
                className={`
                  shrink-0 px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium transition
                  ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-600 border-transparent'}
                `}
              >
                {label} ({ordersCount})
              </button>
            )
          })}
        </div>
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <div className="p-6 text-center text-slate-500">
          No orders found
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const status = normalizeStatus(order.status)
            const statusKey = (status === 'pending' ? 'received' : status) as OrderStatus
            const badgeClass = statusColors[statusKey] ?? 'bg-slate-100 text-slate-700'

            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{order.customerName}</p>
                    <p className="text-xs text-slate-500">
                      {order.phone} · {order.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-indigo-600">₹{order.total.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-500">{order.createdAt.slice(11, 16)}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
                      {status === 'delivered' ? 'Delivered ✓' : statusLabels[statusKey] ?? status}
                    </span>
                  </div>
                </div>

                {(status === 'received' || status === 'pending') && (
                  <button
                    type="button"
                    onClick={() => updateOrderStatus(order.id, 'accepted')}
                    className="mt-3 w-full rounded-xl bg-[#0C831F] py-3 text-sm font-semibold text-white"
                  >
                    Accept Order
                  </button>
                )}
                {status === 'accepted' && (
                  <button
                    type="button"
                    onClick={() => updateOrderStatus(order.id, 'packed')}
                    className="mt-3 w-full rounded-xl bg-[#F8CB46] py-3 text-sm font-semibold text-slate-900"
                  >
                    Mark as Packed
                  </button>
                )}
                {status === 'packed' && (
                  <button
                    type="button"
                    onClick={() => updateOrderStatus(order.id, 'out-for-delivery')}
                    className="mt-3 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white"
                  >
                    Out for Delivery
                  </button>
                )}
                {status === 'out-for-delivery' && (
                  <button
                    type="button"
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    className="mt-3 w-full rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white"
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function MerchantPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading merchant dashboard...</div>}>
      <MerchantContent />
    </Suspense>
  )
}
