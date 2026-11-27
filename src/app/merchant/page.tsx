'use client'

import { Suspense, useCallback, useEffect, useState, type ChangeEvent } from "react"
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useOrders } from '@/context/order-context'
import { OrderStatus, STORES, Store } from '@/data/mockData'
import { NavBar } from '@/components/nav-bar'

const STORAGE_KEY = 'hyperlocal_merchant_store_id'
const ADMIN_STORE_ID = 'admin'
const ADMIN_STORE_NAME = 'All Stores (Pilot Admin)'

// Deterministic 4-digit demo PIN per store based on its index:
// "1111", "2222", "3333" plus the pilot admin option ("9999").
const storePinOptions: { id: string; name: string; pin: string }[] = [
  ...STORES.map((store, idx) => ({
    id: store.id,
    name: store.name,
    pin: String(idx + 1).repeat(4),
  })),
  { id: ADMIN_STORE_ID, name: ADMIN_STORE_NAME, pin: '9999' },
]

// Mirrors the customer-facing order stepper in src/app/orders/page.tsx.
const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'received', label: 'Received' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'packed', label: 'Packed' },
  { key: 'out-for-delivery', label: 'On the Way' },
  { key: 'delivered', label: 'Delivered' },
]

function PinGate({ onUnlock }: { onUnlock: (storeId: string) => void }) {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('')
  const [pin, setPin] = useState<string>('')
  const [error, setError] = useState<string>('')

  const selectedOption = storePinOptions.find((o) => o.id === selectedStoreId)

  const handleUnlock = () => {
    if (!selectedStoreId) {
      setError('Please select a store before unlocking.')
      return
    }
    const expectedPin = selectedOption?.pin
    if (!expectedPin) {
      setError('Invalid store selection.')
      return
    }
    if (pin === expectedPin) {
      setError('')
      onUnlock(selectedStoreId)
    } else {
      setError('Invalid PIN. Demo PINs: 1111, 2222, 3333 · Admin: 9999')
    }
  }

  const handlePinChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 4) value = value.slice(0, 4)
    setPin(value)
    if (error) setError('')
  }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-[#F4F6FB] pb-24">
      <NavBar />
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900">Merchant Portal</h1>
          <p className="text-sm text-slate-500">
            Select your store and enter your 4-digit PIN to manage live orders.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Store</label>
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="" disabled>
              Select a store
            </option>
            {storePinOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">4-digit PIN</label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={handlePinChange}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <p className="text-xs text-slate-400">
            Demo PINs: 1111, 2222, 3333 · Admin: 9999
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={handleUnlock}
          className="bg-[#0C831F] hover:bg-[#096b19] text-white font-semibold w-full py-2.5 rounded-xl"
        >
          Unlock Store Dashboard
        </button>
      </div>
    </div>
  )
}

function normalizeStatus(status: string) {
  return status.toLowerCase()
}

function MerchantContent({
  activeStoreId,
  onSwitchStore,
}: {
  activeStoreId: string
  onSwitchStore: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = (searchParams.get('status') || 'all').toLowerCase()

  const { orders, updateOrderStatus } = useOrders()

  const activeStore: Store | undefined = STORES.find((s) => s.id === activeStoreId)
  const activeStoreName =
    activeStoreId === ADMIN_STORE_ID
      ? ADMIN_STORE_NAME
      : activeStore?.name ?? activeStoreId

  const storeFilteredOrders =
    activeStoreId === ADMIN_STORE_ID
      ? orders
      : orders.filter((o) => o.storeId === activeStoreId)

  const filteredOrders = statusFilter === 'all'
    ? storeFilteredOrders
    : storeFilteredOrders.filter((o) => normalizeStatus(o.status) === statusFilter)

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

      {/* Active-store banner */}
      <div className="mb-4 flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">
            Active Store
          </span>
          <span className="text-sm font-medium text-slate-900">{activeStoreName}</span>
        </div>
        <button
          type="button"
          onClick={onSwitchStore}
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          Switch Store
        </button>
      </div>

      <header className="mb-6 mt-2">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Merchant Dashboard
        </h1>
        <p className="text-sm text-slate-500">Incoming orders</p>
      </header>

      {/* Status filter dot-stepper bar */}
      <div className="mb-4">
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Filter by Status
            </span>
            <button
              type="button"
              onClick={() => router.push('/merchant')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition ${
                statusFilter === 'all'
                  ? 'bg-[#0C831F] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({orders.length})
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1 items-start w-full relative pt-1">
            {/* Connecting track behind the circles */}
            {STATUS_STEPS.slice(0, -1).map((_, i) => (
              <span
                key={`stepper-track-${i}`}
                aria-hidden="true"
                className="absolute top-3 -z-10 h-[1px] bg-slate-200"
                style={{
                  left: `${i * 20 + 10}%`,
                  right: `${100 - ((i + 1) * 20 + 10)}%`,
                }}
              />
            ))}
            {STATUS_STEPS.map((step) => {
              const active = statusFilter === step.key
              const count = orders.filter((o) => normalizeStatus(o.status) === step.key).length
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() =>
                    router.push(active ? '/merchant' : `?status=${step.key}`)
                  }
                  className="flex flex-col items-center text-center min-w-0 relative z-10 group"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                      active
                        ? 'bg-[#0C831F] text-white ring-4 ring-[#0C831F]/20'
                        : 'bg-slate-100 text-slate-700 border border-slate-200 group-hover:border-[#0C831F]'
                    }`}
                  >
                    {count}
                  </span>
                  <span
                    className={`text-[10px] leading-tight mt-1.5 break-words ${
                      active ? 'font-semibold text-[#0C831F]' : 'font-medium text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              )
            })}
          </div>
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
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null)

  useEffect(() => {
    setActiveStoreId(sessionStorage.getItem(STORAGE_KEY))
  }, [])

  const handleUnlock = useCallback((storeId: string) => {
    sessionStorage.setItem(STORAGE_KEY, storeId)
    setActiveStoreId(storeId)
  }, [])

  const handleSwitchStore = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setActiveStoreId(null)
  }, [])

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading merchant dashboard...</div>}>
      {activeStoreId === null ? (
        <PinGate onUnlock={handleUnlock} />
      ) : (
        <MerchantContent activeStoreId={activeStoreId} onSwitchStore={handleSwitchStore} />
      )}
    </Suspense>
  )
}
