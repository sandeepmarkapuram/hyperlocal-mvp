'use client'

import { CartProvider } from './cart-context'
import { OrderProvider } from './order-context'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <OrderProvider>{children}</OrderProvider>
    </CartProvider>
  )
}