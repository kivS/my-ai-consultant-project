'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'

export function Providers({ children, ...props }) {
  return (
    <NextThemesProvider {...props}>  
      <TooltipProvider>{children}</TooltipProvider>
    </NextThemesProvider>
  )
}
