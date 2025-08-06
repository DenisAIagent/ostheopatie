'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Button,
  Badge,
  SimpleGrid,
  Avatar,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout/Layout'
import { createClient } from '@/lib/supabase-client'

interface Appointment {
  id: string
  appointment_date: string
  status: string
  services: {
    name_fr: string
    name_pt: string
    name_en: string
    price: number
    duration: number
  }
}

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  
  const supabase = createClient()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchAppointments()
    }
  }, [user])

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          status,
          services!inner (
            name_fr,
            name_pt, 
            name_en,
            price,
            duration
          )
        `)
        .eq('user_id', user?.id)
        .order('appointment_date', { ascending: true })

      if (error) throw error
      
      // Transform data to match interface (single service object instead of array)
      const transformedData = data?.map(appointment => ({
        ...appointment,
        services: Array.isArray(appointment.services) ? appointment.services[0] : appointment.services
      })) || []
      
      setAppointments(transformedData)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoadingAppointments(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'green'
      case 'pending':
        return 'yellow'
      case 'cancelled':
        return 'red'
      case 'completed':
        return 'blue'
      default:
        return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé'
      case 'pending':
        return 'En attente'
      case 'cancelled':
        return 'Annulé'
      case 'completed':
        return 'Terminé'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <Layout>
        <Box py={12}>
          <Container maxW="6xl">
            <Text>Chargement...</Text>
          </Container>
        </Box>
      </Layout>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <Layout>
      <Box py={12}>
        <Container maxW="6xl">
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <Box>
              <HStack justify="space-between" align="start" mb={6}>
                <Box>
                  <Heading as="h1" size="xl" color="green.800" mb={2}>
                    Tableau de bord
                  </Heading>
                  <Text color="gray.600">
                    Bienvenue, {profile.first_name} {profile.last_name}
                  </Text>
                </Box>
                
                <VStack align="end" spacing={2}>
                  <Avatar name={`${profile.first_name} ${profile.last_name}`} size="lg" />
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Se déconnecter
                  </Button>
                </VStack>
              </HStack>
            </Box>

            {/* Profile Summary */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Heading as="h2" size="md">
                    Informations personnelles
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>Email</Text>
                      <Text fontWeight="medium">{profile.email}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>Téléphone</Text>
                      <Text fontWeight="medium">{profile.phone}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>Langue</Text>
                      <Text fontWeight="medium">
                        {profile.preferred_language === 'fr' && 'Français'}
                        {profile.preferred_language === 'pt' && 'Português'}
                        {profile.preferred_language === 'en' && 'English'}
                      </Text>
                    </Box>
                    <Box>
                      <Button colorScheme="green" variant="outline" size="sm">
                        Modifier le profil
                      </Button>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>

            {/* Appointments */}
            <Box>
              <HStack justify="space-between" align="center" mb={6}>
                <Heading as="h2" size="lg">
                  Mes rendez-vous
                </Heading>
                <Button colorScheme="green" onClick={() => router.push('/booking')}>
                  Nouveau rendez-vous
                </Button>
              </HStack>

              {loadingAppointments ? (
                <Text>Chargement des rendez-vous...</Text>
              ) : appointments.length === 0 ? (
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={4} py={8}>
                      <Text fontSize="lg" color="gray.500">
                        Aucun rendez-vous planifié
                      </Text>
                      <Button colorScheme="green" onClick={() => router.push('/booking')}>
                        Prendre un rendez-vous
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ) : (
                <VStack spacing={4} align="stretch">
                  {appointments.map((appointment) => (
                    <Card key={appointment.id} bg={cardBg} borderColor={borderColor}>
                      <CardBody>
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={2}>
                            <HStack spacing={3}>
                              <Badge colorScheme={getStatusColor(appointment.status)}>
                                {getStatusText(appointment.status)}
                              </Badge>
                              <Text fontSize="lg" fontWeight="medium">
                                {appointment.services?.name_fr || 'Service'}
                              </Text>
                            </HStack>
                            
                            <Text color="gray.600">
                              {new Date(appointment.appointment_date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Text>
                            
                            <HStack spacing={4} fontSize="sm" color="gray.500">
                              <Text>Durée: {appointment.services?.duration || 60}min</Text>
                              <Text>Prix: {appointment.services?.price || 0}€</Text>
                            </HStack>
                          </VStack>
                          
                          <VStack spacing={2}>
                            {appointment.status === 'pending' && (
                              <Button size="sm" colorScheme="red" variant="outline">
                                Annuler
                              </Button>
                            )}
                            {appointment.status === 'confirmed' && (
                              <Button size="sm" colorScheme="blue" variant="outline">
                                Reprogrammer
                              </Button>
                            )}
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
        </Container>
      </Box>
    </Layout>
  )
}