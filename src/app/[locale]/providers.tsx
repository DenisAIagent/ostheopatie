'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { useEffect } from 'react'
import ErrorBoundary from '@/components/ErrorBoundary'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Global error handler for unhandled promise rejections and AggregateError
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      // Prevent the default browser error handling
      event.preventDefault()
      
      // Log more details if it's an AggregateError
      if (event.reason instanceof AggregateError) {
        console.error('AggregateError details:', event.reason.errors)
      }
    }

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  return (
    <ErrorBoundary>
      <ChakraProvider>
        {children}
      </ChakraProvider>
    </ErrorBoundary>
  )
}