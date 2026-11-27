'use client'

import Link from 'next/link'
import { Store } from '@/data/mockData'

export function StoreCard({ store }: { store: Store }) {
  return (
    <Link href={`/store/${store.id}`} className="block">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]">
        <div className="flex items-center gap-3">
          <div className="text-3xl shrink-0">{store.image}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 leading-tight truncate">{store.name}</h3>
            <p className="text-xs font-semibold text-indigo-600 truncate">{store.category}</p>
          </div>
          <span className="bg-[#0C831F] text-white text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
            ⚡ {store.rating} mins
          </span>
        </div>
        <div className="mt-2">
          <span className="text-xs font-medium text-[#F8CB46]">
            ⚡ 15 mins
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">📍 {store.distance}</span>
          <span className="w-px h-3 bg-slate-300 mx-1"></span>
          <span>⏱ {store.deliveryTime}</span>
        </div>
      </div>
    </Link>
  )
}