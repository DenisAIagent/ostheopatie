'use client'

import { Box } from '@chakra-ui/react'
import Header from './Header'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex="1">
        {children}
      </Box>
      <Footer />
    </Box>
  )
}