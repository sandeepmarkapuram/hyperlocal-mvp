"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { STORES, CATEGORIES } from "@/data/mockData"
import { NavBar } from "@/components/nav-bar"
import { StoreCard } from "@/components/store-card"

function StorefrontContent() {
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get("category") || "all"
  const [searchQuery, setSearchQuery] = useState("")

  const searchedStores = STORES.filter((store) => {
    const matchesCategory =
      selectedCategory === "all" || store.category === selectedCategory
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      !q ||
      store.name.toLowerCase().includes(q) ||
      store.category.toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  return (
    <div className="w-full max-w-[480px] mx-auto overflow-x-hidden bg-[#F4F6FB] min-h-screen">
      <NavBar />

      <div className="px-4 pt-3 pb-2 bg-gradient-to-b from-[#FDE68A]/60 to-[#F4F6FB]">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search 'milk', 'bread', 'snacks', or stores..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-[#0C831F] focus:outline-none"
        />
      </div>

      <div className="px-4 py-2 flex gap-2 overflow-x-auto">
        <Link
          href="?"
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
            selectedCategory === "all"
              ? "bg-[#0C831F] text-white border-[#0C831F]"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`?category=${encodeURIComponent(cat)}`}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
              selectedCategory === cat
                ? "bg-[#0C831F] text-white border-[#0C831F]"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      <div className="px-4 pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Stores near RR Nagar ({searchedStores.length})
          </h2>
          <span className="text-[11px] font-bold text-[#0C831F] bg-[#F7FFF9] border border-[#0C831F]/20 px-2 py-0.5 rounded-full">
            ⚡ 14 mins delivery
          </span>
        </div>

        {searchedStores.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No stores matched your filter.
          </div>
        ) : (
          searchedStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))
        )}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm text-slate-500">Loading stores...</div>}>
      <StorefrontContent />
    </Suspense>
  )
}