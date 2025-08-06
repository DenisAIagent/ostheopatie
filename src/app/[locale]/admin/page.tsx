'use client'

import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Button,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Alert,
  AlertIcon,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout/Layout'

interface Appointment {
  id: string
  appointment_date: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: 'pending' | 'paid' | 'failed'
  notes?: string
  users: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
  services: {
    name_fr: string
    price: number
    duration: number
  }
}

interface Availability {
  id: string
  date: string
  start_time: string
  end_time: string
  is_available: boolean
}

export default function AdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{type: 'success' | 'error', message: string} | null>(null)
  
  // Modal state for adding availability
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [newAvailability, setNewAvailability] = useState({
    date: '',
    start_time: '09:00',
    end_time: '18:00'
  })

  // Load appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            users (first_name, last_name, email, phone),
            services (name_fr, price, duration)
          `)
          .order('appointment_date', { ascending: true })

        if (error) throw error
        setAppointments(data || [])
      } catch (error) {
        console.error('Error fetching appointments:', error)
        setMessage({
          type: 'error',
          message: 'Erreur lors du chargement des rendez-vous'
        })
      }
    }

    const fetchAvailabilities = async () => {
      try {
        const { data, error } = await supabase
          .from('availability')
          .select('*')
          .order('date', { ascending: true })

        if (error) throw error
        setAvailabilities(data || [])
      } catch (error) {
        console.error('Error fetching availabilities:', error)
        setMessage({
          type: 'error',
          message: 'Erreur lors du chargement des disponibilités'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
    fetchAvailabilities()
  }, [])

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)

      if (error) throw error

      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: status as any } : apt
        )
      )

      setMessage({
        type: 'success',
        message: 'Statut mis à jour avec succès'
      })
    } catch (error) {
      console.error('Error updating appointment:', error)
      setMessage({
        type: 'error',
        message: 'Erreur lors de la mise à jour'
      })
    }
  }

  const addAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('availability')
        .insert([{
          date: newAvailability.date,
          start_time: newAvailability.start_time,
          end_time: newAvailability.end_time,
          is_available: true
        }])
        .select()
        .single()

      if (error) throw error

      setAvailabilities(prev => [...prev, data])
      setNewAvailability({ date: '', start_time: '09:00', end_time: '18:00' })
      onClose()

      setMessage({
        type: 'success',
        message: 'Disponibilité ajoutée avec succès'
      })
    } catch (error) {
      console.error('Error adding availability:', error)
      setMessage({
        type: 'error',
        message: 'Erreur lors de l\'ajout de la disponibilité'
      })
    }
  }

  const toggleAvailability = async (availabilityId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('availability')
        .update({ is_available: !currentStatus })
        .eq('id', availabilityId)

      if (error) throw error

      setAvailabilities(prev => 
        prev.map(avail => 
          avail.id === availabilityId ? { ...avail, is_available: !currentStatus } : avail
        )
      )

      setMessage({
        type: 'success',
        message: 'Disponibilité mise à jour'
      })
    } catch (error) {
      console.error('Error updating availability:', error)
      setMessage({
        type: 'error',
        message: 'Erreur lors de la mise à jour'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const colorMap = {
      pending: 'orange',
      confirmed: 'green',
      cancelled: 'red',
      completed: 'blue'
    }
    return <Badge colorScheme={colorMap[status as keyof typeof colorMap]}>{status}</Badge>
  }

  if (isLoading) {
    return (
      <Layout>
        <Box textAlign="center" py={8}>
          <Spinner size="lg" color="green.500" />
          <div>Chargement...</div>
        </Box>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading as="h1" size="xl" color="green.800" mb={4}>
              Administration
            </Heading>
          </Box>

          {message && (
            <Alert status={message.type === 'success' ? 'success' : 'error'}>
              <AlertIcon />
              {message.message}
            </Alert>
          )}

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {/* Appointments Section */}
            <Card>
              <CardBody>
                <Heading as="h2" size="md" mb={4}>
                  Rendez-vous ({appointments.length})
                </Heading>
                
                <Box maxH="400px" overflow="auto">
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Date</Th>
                        <Th>Client</Th>
                        <Th>Service</Th>
                        <Th>Statut</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {appointments.map((appointment) => (
                        <Tr key={appointment.id}>
                          <Td>
                            {new Date(appointment.appointment_date).toLocaleString('fr-FR')}
                          </Td>
                          <Td>
                            {appointment.users.first_name} {appointment.users.last_name}
                          </Td>
                          <Td>
                            {appointment.services.name_fr}
                            <br />
                            <small>{appointment.services.price}€</small>
                          </Td>
                          <Td>
                            {getStatusBadge(appointment.status)}
                          </Td>
                          <Td>
                            <Select
                              size="sm"
                              value={appointment.status}
                              onChange={(e) => updateAppointmentStatus(appointment.id, e.target.value)}
                            >
                              <option value="pending">En attente</option>
                              <option value="confirmed">Confirmé</option>
                              <option value="cancelled">Annulé</option>
                              <option value="completed">Terminé</option>
                            </Select>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>

            {/* Availability Section */}
            <Card>
              <CardBody>
                <HStack justify="space-between" mb={4}>
                  <Heading as="h2" size="md">
                    Disponibilités ({availabilities.length})
                  </Heading>
                  <Button colorScheme="green" size="sm" onClick={onOpen}>
                    + Ajouter
                  </Button>
                </HStack>
                
                <Box maxH="400px" overflow="auto">
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Date</Th>
                        <Th>Horaires</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {availabilities.map((availability) => (
                        <Tr key={availability.id}>
                          <Td>
                            {new Date(availability.date).toLocaleDateString('fr-FR')}
                          </Td>
                          <Td>
                            {availability.start_time} - {availability.end_time}
                          </Td>
                          <Td>
                            <Badge colorScheme={availability.is_available ? 'green' : 'red'}>
                              {availability.is_available ? 'Disponible' : 'Indisponible'}
                            </Badge>
                          </Td>
                          <Td>
                            <Button
                              size="xs"
                              colorScheme={availability.is_available ? 'red' : 'green'}
                              onClick={() => toggleAvailability(availability.id, availability.is_available)}
                            >
                              {availability.is_available ? 'Fermer' : 'Ouvrir'}
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>

        {/* Add Availability Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Ajouter une disponibilité</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={newAvailability.date}
                    onChange={(e) => setNewAvailability(prev => ({ ...prev, date: e.target.value }))}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Heure de début</FormLabel>
                  <Input
                    type="time"
                    value={newAvailability.start_time}
                    onChange={(e) => setNewAvailability(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Heure de fin</FormLabel>
                  <Input
                    type="time"
                    value={newAvailability.end_time}
                    onChange={(e) => setNewAvailability(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </FormControl>

                <Button
                  colorScheme="green"
                  w="full"
                  onClick={addAvailability}
                  isDisabled={!newAvailability.date}
                >
                  Ajouter la disponibilité
                </Button>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Layout>
  )
}