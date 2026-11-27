"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useCart } from "@/context/cart-context"
import { useOrders } from "@/context/order-context"
import { useAuth } from "@/context/auth-context"
import { findStore } from "@/data/mockData"
import type { CartItem } from "@/data/mockData"

export function CheckoutDrawer({ onClose, isOpen }: { onClose: () => void; isOpen: boolean }) {
  const router = useRouter()
  const { clear, items, count, total, activeStoreId } = useCart()
  const { placeOrder } = useOrders()
  const { user, profile } = useAuth()
  const [name, setName] = useState(profile?.full_name ?? "")
  const [phone, setPhone] = useState(profile?.phone ?? "")
  const [address, setAddress] = useState(profile?.address ?? "RR Nagar, Bengaluru")
  const [paymentMode, setPaymentMode] = useState<"upi" | "cod">("upi")
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const formattedPhone = phone.replace(/\D/g, "").slice(0, 10)

  const upiLabelClassName = "flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 bg-indigo-50 cursor-pointer "
  const codLabelClassName = "flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 bg-white cursor-pointer "

  const handlePlaceOrder = async () => {
    if (!name.trim() || !formattedPhone.trim()) return
    const store = activeStoreId ? findStore(activeStoreId) : null
    const order = {
      id: "ORD-" + Date.now(),
      storeId: activeStoreId || "",
      storeName: activeStoreId ? (store ? store.name : "RR Nagar Kirana") : "RR Nagar Kirana",
      customerName: name,
      phone: formattedPhone,
      address: address,
      paymentMode,
      items: items.map((i: CartItem) => ({ name: i.name, qty: i.qty, price: i.price })),
      total,
      status: "received",
      createdAt: new Date().toISOString(),
      userId: user?.id ?? undefined,
    }
    clear()
    router.push("/")
    setShowSuccess(true)
    placeOrder(order)
    setSubmitting(false)
  }

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => { setShowSuccess(false); onClose() }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end p-4">
      <div className="w-full max-w-[480px] mx-auto px-4 pt-4 pb-6 box-border max-h-[85vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
        <div className="w-10 h-1.5 rounded-xl bg-slate-200 mx-auto my-3"></div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 text-center mb-4">Delivery Details</h3>
          <div className="mb-3">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Customer Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full box-border px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" placeholder="Your full name" required />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Phone Number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full box-border px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="10-digit mobile number" pattern="[6-9]\d{9}" title="Enter a valid 10-digit mobile number" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Delivery Address</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full box-border px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition min-h-[80px]" placeholder="Flat/Apt, Street, Landmark, RR Nagar, Bengaluru"></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Payment Mode</label>
            <div className="flex gap-4 space-x-4">
              <label className={upiLabelClassName}>
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path className="stroke-2" d="M12 19l9 2-9-2-9 2 9-2zM12 5l9 2-9 2-9-2 9 2z" /></svg>
                UPI on Delivery
              </label>
              <label className={codLabelClassName}>
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path className="stroke-2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                Cash on Delivery
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl bg-white border border-slate-300 text-slate-600 text-xs font-medium hover:border-slate-400 transition">Cancel</button>
            <button onClick={handlePlaceOrder} disabled={submitting} className={["flex-1 py-2 rounded-xl w-full box-border ", submitting ? "opacity-50 cursor-not-allowed" : "bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition ", count === 0 ? "disabled opacity-50" : ""].filter(Boolean).join(" ")}>
              {submitting ? "Placing order..." : "Place Order"}
            </button>
          </div>
        </div>
        {showSuccess && (<div className="text-center py-6"><svg className="mx-auto w-12 h-12 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path className="stroke-2" d="M5 13l4 4L19 7" /></svg><h4 className="text-xl font-bold text-slate-900 mb-1">Order Placed!</h4><p className="text-slate-500 mb-4">Your order has been received and will be delivered shortly.</p></div>)}
      </div>
    </div>
  )
}
