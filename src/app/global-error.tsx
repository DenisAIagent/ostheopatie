'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to error reporting service
    console.error('Global error occurred:', error)
    
    // Log more details if it's an AggregateError
    if (error instanceof AggregateError) {
      console.error('AggregateError details:', error.errors)
    }
  }, [error])

  return (
    <html>
      <body style={{ margin: 0, padding: 0 }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fed7d7',
          padding: '32px'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div style={{ fontSize: '6rem' }}>💥</div>
            <h1 style={{ color: '#c53030', margin: 0 }}>Erreur critique</h1>
            <p style={{ color: '#4a5568', margin: 0 }}>
              L'application a rencontré une erreur critique. Veuillez réessayer ou contacter le support.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#e53e3e',
                fontFamily: 'monospace',
                textAlign: 'left'
              }}>
                {error.message}
                {error.digest && (
                  <div style={{ fontSize: '12px', color: '#718096', marginTop: '8px' }}>
                    Digest: {error.digest}
                  </div>
                )}
              </div>
            )}
            <button 
              onClick={reset}
              style={{
                backgroundColor: '#3182ce',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}