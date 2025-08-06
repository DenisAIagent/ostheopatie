'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  Link,
  Divider,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import NextLink from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout/Layout'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signIn } = useAuth()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('') // Clear error on input change
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)
    setError('')

    try {
      await signIn(formData.email, formData.password)
      router.push(`/${locale}/dashboard`) // Redirect after successful login
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Box py={12}>
        <Container maxW="md">
          <VStack spacing={8} align="stretch">
            <Box textAlign="center">
              <Heading as="h1" size="xl" color="green.800" mb={2}>
                Connexion
              </Heading>
              <Text color="gray.600">
                Connectez-vous à votre compte pour gérer vos rendez-vous
              </Text>
            </Box>

            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <Box as="form" onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="votre.email@exemple.com"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Mot de passe</FormLabel>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Votre mot de passe"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="green"
                  size="lg"
                  w="full"
                  isLoading={loading}
                  loadingText="Connexion..."
                >
                  Se connecter
                </Button>
              </VStack>
            </Box>

            <Divider />

            <VStack spacing={2} textAlign="center">
              <Text color="gray.600">
                Pas encore de compte ?{' '}
                <Link as={NextLink} href={`/${locale}/auth/register`} color="green.500" fontWeight="medium">
                  Créer un compte
                </Link>
              </Text>
              
              <Link as={NextLink} href={`/${locale}/auth/forgot-password`} color="green.500" fontSize="sm">
                Mot de passe oublié ?
              </Link>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </Layout>
  )
}