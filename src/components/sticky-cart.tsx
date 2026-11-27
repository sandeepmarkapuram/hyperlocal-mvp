'use client'

import { useCart } from '@/context/cart-context'

export function StickyCart({ onOpenCheckout }: { onOpenCheckout: () => void }) {
  const { items, count, total } = useCart()

  return (
    <div className="fixed bottom-5 left-0 right-0 z-40 px-3 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-[456px] mx-auto bg-[#0C831F] text-white rounded-2xl shadow-xl p-3 flex items-center justify-between gap-3 box-border">
        <div className="min-w-0">
          <div className="text-sm font-medium">
            {count === 1 ? '1 item' : `${count} items`}
          </div>
          <div className="text-sm font-bold">
            ₹{total.toLocaleString('en-IN')}
          </div>
        </div>
        {count === 0 ? (
          <span className="text-xs opacity-75 whitespace-nowrap">
            Cart is empty
          </span>
        ) : (
          <button
            onClick={onOpenCheckout}
            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl whitespace-nowrap"
            disabled={count === 0}
          >
            View Cart ▶
          </button>
        )}
      </div>
    </div>
  )
}