'use client'

import { useCart } from '@/context/cart-context'
import { Item } from '@/data/mockData'

export function ProductCard({ item }: { item: Item }) {
  const { add, increment, decrement, hasItem, qty } = useCart()
  const q = hasItem(item.id) ? qty(item.id) : 0

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2.5 flex flex-col justify-between h-full min-w-0 overflow-hidden">
      <div className="bg-slate-50 rounded-xl h-28 flex items-center justify-center text-4xl shrink-0">
        {item.image}
      </div>
      <div className="flex-1 min-w-0 px-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          {item.category}
        </span>
        <h4 className="font-bold text-slate-900 leading-tight line-clamp-2 min-h-[2.25rem] text-[13px] font-semibold leading-snug break-words">
          {item.name}
        </h4>
        <p className="text-xs font-bold text-[#0C831F]">
          ₹{item.price} / {item.unit}
        </p>
        {item.inStock ? (
          <span className="text-[3xs] text-slate-500 mt-1">
            ⚡ 14 MINS
          </span>
        ) : (
          <span className="text-[3xs] text-slate-500 opacity-50 mt-1">
            Out of stock
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-1.5">
        {q > 0 ? (
          <>
            <button
              onClick={() => decrement(item.id)}
              className="bg-[#0C831F] text-white font-bold rounded-lg w-8 h-8 shrink-0"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-6 text-center font-bold text-slate-900 text-xs">{q}</span>
            <button
              onClick={() => increment(item.id)}
              className="bg-[#0C831F] text-white font-bold rounded-lg w-8 h-8 shrink-0"
              aria-label="Increase quantity"
            >
              +
            </button>
          </>
        ) : (
          <button
            onClick={() => add(item)}
            className="border border-[#0C831F] bg-[#F7FFF9] text-[#0C831F] font-bold rounded-lg w-full py-2 text-sm shrink-0"
            disabled={!item.inStock}
          >
            {item.inStock ? '+ Add' : 'Out of Stock'}
          </button>
        )}
      </div>
    </div>
  )
}