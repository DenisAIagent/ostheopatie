'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Alert,
  AlertIcon,
  Link,
  Divider,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import NextLink from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { userSchema } from '@/lib/validations'
import Layout from '@/components/Layout/Layout'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    preferred_language: 'fr' as 'fr' | 'pt' | 'en',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  
  const { signUp } = useAuth()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear specific field error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate with zod schema
    try {
      userSchema.parse({
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        preferred_language: formData.preferred_language,
      })
    } catch (err: any) {
      err.errors?.forEach((error: any) => {
        newErrors[error.path[0]] = error.message
      })
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      await signUp(formData.email, formData.password, {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        preferred_language: formData.preferred_language,
      })
      
      // Show success message and redirect
      router.push(`/${locale}/auth/verify-email`)
    } catch (err: any) {
      setErrors({ general: err.message || 'Une erreur est survenue lors de l\'inscription' })
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
                Créer un compte
              </Heading>
              <Text color="gray.600">
                Inscrivez-vous pour réserver vos consultations
              </Text>
            </Box>

            {errors.general && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {errors.general}
              </Alert>
            )}

            <Box as="form" onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <HStack spacing={4} w="full">
                  <FormControl isRequired isInvalid={!!errors.first_name}>
                    <FormLabel>Prénom</FormLabel>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => handleChange('first_name', e.target.value)}
                      placeholder="Votre prénom"
                    />
                    {errors.first_name && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.first_name}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.last_name}>
                    <FormLabel>Nom</FormLabel>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => handleChange('last_name', e.target.value)}
                      placeholder="Votre nom"
                    />
                    {errors.last_name && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.last_name}
                      </Text>
                    )}
                  </FormControl>
                </HStack>

                <FormControl isRequired isInvalid={!!errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="votre.email@exemple.com"
                  />
                  {errors.email && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.email}
                    </Text>
                  )}
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.phone}>
                  <FormLabel>Téléphone</FormLabel>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+351 xxx xxx xxx"
                  />
                  {errors.phone && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.phone}
                    </Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Langue préférée</FormLabel>
                  <Select
                    value={formData.preferred_language}
                    onChange={(e) => handleChange('preferred_language', e.target.value)}
                  >
                    <option value="fr">Français</option>
                    <option value="pt">Português</option>
                    <option value="en">English</option>
                  </Select>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.password}>
                  <FormLabel>Mot de passe</FormLabel>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Au moins 8 caractères"
                  />
                  {errors.password && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.password}
                    </Text>
                  )}
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.confirmPassword}>
                  <FormLabel>Confirmer le mot de passe</FormLabel>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Répétez votre mot de passe"
                  />
                  {errors.confirmPassword && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="green"
                  size="lg"
                  w="full"
                  isLoading={loading}
                  loadingText="Inscription..."
                >
                  Créer mon compte
                </Button>
              </VStack>
            </Box>

            <Divider />

            <Text textAlign="center" color="gray.600">
              Déjà un compte ?{' '}
              <Link as={NextLink} href={`/${locale}/auth/login`} color="green.500" fontWeight="medium">
                Se connecter
              </Link>
            </Text>
          </VStack>
        </Container>
      </Box>
    </Layout>
  )
}