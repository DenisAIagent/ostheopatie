'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  VStack,
  Text,
  Code,
  Alert,
  AlertIcon,
  Collapse,
  Heading
} from '@chakra-ui/react'
import { supabase } from '@/lib/supabase'

interface DebugInfo {
  timestamp: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  data?: any
}

export default function SupabaseDebug() {
  const [isOpen, setIsOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addDebugInfo = (message: string, type: DebugInfo['type'], data?: any) => {
    setDebugInfo(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
      data
    }])
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setDebugInfo([])
    
    addDebugInfo('Starting Supabase diagnostics...', 'info')

    try {
      // Test 1: Basic connection
      addDebugInfo('Testing basic connection...', 'info')
      const { data: connectionTest, error: connectionError } = await supabase
        .from('services')
        .select('count')
        .limit(1)

      if (connectionError) {
        addDebugInfo(`Connection failed: ${connectionError.message}`, 'error', connectionError)
      } else {
        addDebugInfo('Basic connection successful', 'success')
      }

      // Test 2: Services in public schema
      addDebugInfo('Checking services in public schema...', 'info')
      const { data: publicServices, error: publicError } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)

      if (publicError) {
        addDebugInfo(`Public schema error: ${publicError.message}`, 'error', publicError)
      } else {
        addDebugInfo(`Found ${publicServices?.length || 0} services in public schema`, 
          publicServices?.length ? 'success' : 'warning', publicServices)
      }

      // Test 3: Services in app schema
      addDebugInfo('Checking services in app schema...', 'info')
      const { data: appServices, error: appError } = await supabase
        .schema('app')
        .from('services')
        .select('*')
        .eq('is_active', true)

      if (appError) {
        addDebugInfo(`App schema error: ${appError.message}`, 'error', appError)
      } else {
        addDebugInfo(`Found ${appServices?.length || 0} services in app schema`, 
          appServices?.length ? 'success' : 'warning', appServices)
      }

      // Test 4: Environment variables
      addDebugInfo('Checking environment variables...', 'info')
      const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
      const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      addDebugInfo(`NEXT_PUBLIC_SUPABASE_URL: ${hasUrl ? 'Set ✅' : 'Missing ❌'}`, hasUrl ? 'success' : 'error')
      addDebugInfo(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasKey ? 'Set ✅' : 'Missing ❌'}`, hasKey ? 'success' : 'error')

      addDebugInfo('Diagnostics completed', 'success')
    } catch (error) {
      addDebugInfo(`Global error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error', error)
    } finally {
      setIsRunning(false)
    }
  }

  const getAlertStatus = (type: DebugInfo['type']) => {
    switch (type) {
      case 'success': return 'success'
      case 'warning': return 'warning'
      case 'error': return 'error'
      default: return 'info'
    }
  }

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <Box position="fixed" bottom={4} right={4} zIndex={9999}>
      <Button 
        colorScheme="blue" 
        size="sm" 
        onClick={() => setIsOpen(!isOpen)}
        mb={2}
      >
        🔧 Debug Supabase
      </Button>
      
      <Collapse in={isOpen}>
        <Box 
          bg="white" 
          border="1px solid" 
          borderColor="gray.200" 
          borderRadius="md" 
          p={4} 
          maxW="400px"
          maxH="500px"
          overflowY="auto"
          boxShadow="lg"
        >
          <VStack spacing={3} align="stretch">
            <Heading size="sm">Supabase Debug Panel</Heading>
            
            <Button
              colorScheme="green"
              size="sm"
              onClick={runDiagnostics}
              isLoading={isRunning}
              loadingText="Running..."
            >
              🔍 Run Diagnostics
            </Button>

            {debugInfo.map((info, index) => (
              <Alert key={index} status={getAlertStatus(info.type)} size="sm">
                <AlertIcon boxSize="12px" />
                <Box flex="1">
                  <Text fontSize="xs" fontWeight="bold">
                    {info.timestamp}
                  </Text>
                  <Text fontSize="xs">{info.message}</Text>
                  {info.data && (
                    <Code fontSize="xs" display="block" mt={1} p={1} borderRadius="sm">
                      {JSON.stringify(info.data, null, 2)}
                    </Code>
                  )}
                </Box>
              </Alert>
            ))}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  )
}