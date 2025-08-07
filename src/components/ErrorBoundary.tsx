'use client'

import React from 'react'
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      hasError: true,
      error,
      errorInfo
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          minH="100vh" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          bg="red.50"
          p={8}
        >
          <VStack spacing={6} textAlign="center" maxW="md">
            <Box fontSize="6xl">⚠️</Box>
            <Heading color="red.600">Une erreur s'est produite</Heading>
            <Text color="gray.600">
              L'application a rencontré une erreur inattendue. Veuillez rafraîchir la page pour continuer.
            </Text>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box bg="white" p={4} borderRadius="md" w="full">
                <Text fontSize="sm" color="red.500" fontFamily="mono">
                  {this.state.error.message}
                </Text>
              </Box>
            )}
            <Button 
              colorScheme="blue" 
              onClick={this.handleReload}
            >
              Rafraîchir la page
            </Button>
          </VStack>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary