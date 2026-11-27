'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavBar() {
  const pathname = usePathname()
  const isMerchant = pathname === '/merchant'

  return (
    <nav className="w-full max-w-[480px] mx-auto bg-white border-b border-slate-100 sticky top-0 z-30">
      {/* Top row: brand + My Orders / Back to Store */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
        <Link href="/" className="shrink-0 font-bold text-black text-xl tracking-tight">
          HyperLocal
        </Link>
        {isMerchant ? (
          <Link
            href="/"
            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200"
          >
            ← Back to Store
          </Link>
        ) : (
          <Link
            href="/orders"
            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200"
          >
            My Orders
          </Link>
        )}
      </div>

      {/* Second row — Location & ETA bar */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-2 bg-slate-50 border-t border-slate-100">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-xs font-medium text-slate-700 truncate">
            📍 Rajarajeshwari Nagar, Bengaluru
          </p>
        </div>
        <span className="shrink-0 text-[11px] font-bold text-amber-800 bg-[#F8CB46]/30 px-2 py-0.5 rounded-full whitespace-nowrap">
          ⚡ Delivery in 14 mins
        </span>
      </div>
    </nav>
  )
}