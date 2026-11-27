"use client"

import { useParams } from "next/navigation"
import { useState, Suspense, useEffect } from "react"
import { useCart, useSetActiveStore } from "@/context/cart-context"
import { ITEMS, Item, findStore, CATEGORIES } from "@/data/mockData"
import { NavBar } from "@/components/nav-bar"
import { ProductCard } from "@/components/product-card"
import { StickyCart } from "@/components/sticky-cart"
import { CheckoutDrawer } from "@/components/checkout-drawer"

function StoreContent() {
  const routeId = useParams().id as string
  const setStore = useSetActiveStore()
  useEffect(() => {
    if (routeId) setStore(routeId)
  }, [routeId, setStore])
  const store = findStore(routeId)
  if (!store) {
    return <div className="p-8">Store not found</div>
  }

  const { items: cartItems, count, total, add, increment, decrement, remove, clear } = useCart()
  const [category, setCategory] = useState("all")
  const [showCheckout, setShowCheckout] = useState(false)

  // Filter items by storeId
  const storeItems = ITEMS.filter((i) => i.storeId === routeId)

  // Further filter by category if not "all"
  const filteredItems = category === "all"
    ? storeItems
    : storeItems.filter((i) => i.category === category)

  const handleAdd = (item: Item) => {
    const existing = cartItems.find((c) => c.id === item.id)
    if (existing) {
      increment(item.id)
    } else {
      add(item)
    }
  }

  const handleCategoryChange = (cat: string) => {
    setCategory(cat)
  }

  const handleOpenCheckout = () => {
    setShowCheckout(true)
  }

  return (
    <div className="max-w-[480px] mx-auto p-4">
      <NavBar />
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          {store.name}
        </h1>
        <p className="text-sm text-slate-500">
          {store.distance} away · ⏱ {store.deliveryTime}
        </p>
      </header>

      <div className="mb-4">
        <div className="flex gap-2 overflo-auto scrollbar-hide">
          <button
            onClick={() => setCategory("all")}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium transition"
          >
            All
          </button>
          {CATEGORIES.map((cat) => {
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium transition"
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 px-3 pb-32">
        {filteredItems.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-slate-500">
            No items in this category
          </div>
        ) : (
          filteredItems.map((item) => (
            <div className="min-w-0" key={item.id}>
              <ProductCard item={item} />
            </div>
          ))
        )}
      </div>

      <StickyCart onOpenCheckout={handleOpenCheckout} />
      <CheckoutDrawer onClose={() => setShowCheckout(false)} isOpen={showCheckout} />
    </div>
  )
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading store...</div>}>
      <StoreContent />
    </Suspense>
  )
}
