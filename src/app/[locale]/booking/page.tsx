'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout/Layout'
import SimpleCalendar from '@/components/Booking/SimpleCalendar'
import ServiceSelector from '@/components/Booking/ServiceSelector'
import SupabaseDebug from '@/components/Debug/SupabaseDebug'

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
}

export default function BookingPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [createdAppointment, setCreatedAppointment] = useState<any>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Load services from database
  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log('🔍 Fetching services from Supabase...')
        
        // Try both schemas to handle different environments
        let data, error
        
        // First try public schema (production might use this)
        const publicResult = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('price')
          
        if (!publicResult.error && publicResult.data && publicResult.data.length > 0) {
          data = publicResult.data
          error = null
          console.log('✅ Services loaded from public schema:', data.length)
        } else {
          console.log('⚠️ No data in public schema, trying app schema...')
          // Try app schema
          const appResult = await supabase
            .schema('app')
            .from('services')
            .select('*')
            .eq('is_active', true)
            .order('price')
            
          data = appResult.data
          error = appResult.error
          console.log('📊 App schema result:', { dataCount: data?.length || 0, error: error?.message })
        }

        if (error) {
          console.error('❌ Supabase error:', error)
          throw error
        }

        if (!data || data.length === 0) {
          console.warn('⚠️ No services found in database')
          setSubmitMessage({
            type: 'error',
            message: 'Aucun service disponible pour le moment.'
          })
          return
        }

        const formattedServices: Service[] = data.map((service: any) => ({
          id: service.id,
          name: service.name_fr, // Using French for now, can be made dynamic later
          description: service.description_fr,
          price: service.price,
          duration: service.duration
        }))

        console.log('✅ Services formatted:', formattedServices.length)
        setServices(formattedServices)
      } catch (error) {
        console.error('💥 Error fetching services:', error)
        setSubmitMessage({
          type: 'error',
          message: `Erreur lors du chargement des services: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        })
      } finally {
        setIsLoadingServices(false)
      }
    }

    fetchServices()
  }, [])

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime('') // Reset time when date changes
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || 
        !formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setSubmitMessage({
        type: 'error',
        message: 'Veuillez remplir tous les champs obligatoires.'
      })
      return
    }

    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      // Create appointment in Supabase
      const appointmentDateTime = new Date(selectedDate)
      const [hours, minutes] = selectedTime.split(':').map(Number)
      appointmentDateTime.setHours(hours, minutes, 0, 0)

      // Simple approach: create user first (without auth for now)
      // Try public schema first, then app schema
      let userData, userError
      
      const publicUserResult = await supabase
        .from('users')
        .upsert({
          id: crypto.randomUUID(), // Generate a UUID for demo purposes
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          preferred_language: 'fr'
        })
        .select()
        .single()
        
      if (!publicUserResult.error) {
        userData = publicUserResult.data
        userError = null
      } else {
        console.log('⚠️ Trying app schema for user creation...')
        const appUserResult = await supabase
          .schema('app')
          .from('users')
          .upsert({
            id: crypto.randomUUID(),
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            preferred_language: 'fr'
          })
          .select()
          .single()
          
        userData = appUserResult.data
        userError = appUserResult.error
      }

      if (userError) {
        console.error('User error:', userError)
        throw new Error('Erreur lors de la création du profil utilisateur')
      }

      // Then create appointment - try both schemas
      let appointmentData, appointmentError
      
      const publicAppointmentResult = await supabase
        .from('appointments')
        .insert({
          user_id: userData.id,
          service_id: selectedService.id,
          appointment_date: appointmentDateTime.toISOString(),
          notes: formData.notes,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        
      if (!publicAppointmentResult.error) {
        appointmentData = publicAppointmentResult.data
        appointmentError = null
      } else {
        console.log('⚠️ Trying app schema for appointment creation...')
        const appAppointmentResult = await supabase
          .schema('app')
          .from('appointments')
          .insert({
            user_id: userData.id,
            service_id: selectedService.id,
            appointment_date: appointmentDateTime.toISOString(),
            notes: formData.notes,
            status: 'pending',
            payment_status: 'pending'
          })
          .select()
          
        appointmentData = appAppointmentResult.data
        appointmentError = appAppointmentResult.error
      }

      const data = appointmentData
      const error = appointmentError

      if (error) {
        console.error('Appointment error:', error)
        throw new Error('Erreur lors de la création du rendez-vous')
      }

      setSubmitMessage({
        type: 'success',
        message: 'Réservation créée ! Procédez maintenant au paiement pour confirmer votre rendez-vous.'
      })
      
      // Save appointment for payment
      setCreatedAppointment(data)
    } catch (error) {
      console.error('Booking error:', error)
      setSubmitMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Une erreur est survenue lors de la réservation.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePayment = async () => {
    if (!createdAppointment || !selectedService) return

    setIsProcessingPayment(true)
    
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: createdAppointment.id,
          amount: selectedService.price,
          description: `Consultation ${selectedService.name} - ${formData.firstName} ${formData.lastName}`,
          redirectUrl: `${window.location.origin}/payment/success`
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to Mollie checkout
        window.location.href = data.checkoutUrl
      } else {
        throw new Error(data.error || 'Erreur de paiement')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setSubmitMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erreur lors du traitement du paiement'
      })
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return (
    <Layout>
      <Box py={8}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            <Box textAlign="center">
              <Heading as="h1" size="xl" color="green.800" mb={4}>
                Réserver votre consultation
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Choisissez votre service, date et heure préférés
              </Text>
            </Box>

            {/* Submit message */}
            {submitMessage && (
              <Alert status={submitMessage.type === 'success' ? 'success' : 'error'}>
                <AlertIcon />
                {submitMessage.message}
              </Alert>
            )}

            {/* Loading state for services */}
            {isLoadingServices ? (
              <Box textAlign="center" py={8}>
                <Spinner size="lg" color="green.500" />
                <Text mt={4}>Chargement des services...</Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                {/* Left Column - Service Selection and Calendar */}
                <VStack spacing={6} align="stretch">
                  <Card>
                    <CardBody>
                      <Heading as="h3" size="md" mb={4}>
                        1. Choisissez votre service
                      </Heading>
                      <ServiceSelector
                        services={services}
                        selectedService={selectedService}
                        onServiceSelect={handleServiceSelect}
                      />
                    </CardBody>
                  </Card>

                {selectedService && (
                  <Card>
                    <CardBody>
                      <Heading as="h3" size="md" mb={4}>
                        2. Sélectionnez votre créneau
                      </Heading>
                      <SimpleCalendar
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        onDateSelect={handleDateSelect}
                        onTimeSelect={handleTimeSelect}
                        serviceDuration={selectedService.duration}
                      />
                    </CardBody>
                  </Card>
                )}
              </VStack>

              {/* Right Column - Form and Summary */}
              <VStack spacing={6} align="stretch">
                {selectedService && selectedDate && selectedTime && (
                  <Card>
                    <CardBody>
                      <Heading as="h3" size="md" mb={4}>
                        Récapitulatif
                      </Heading>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Service :</Text>
                          <Text>{selectedService.name}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Date :</Text>
                          <Text>{selectedDate.toLocaleDateString('fr-FR')}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Heure :</Text>
                          <Text>{selectedTime}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Durée :</Text>
                          <HStack>
                            <Text fontSize="lg">🕰</Text>
                            <Text>{selectedService.duration} min</Text>
                          </HStack>
                        </HStack>
                        <Box borderTop="1px solid" borderColor="gray.200" my={2} />
                        <HStack justify="space-between">
                          <Text fontWeight="bold" fontSize="lg">Prix :</Text>
                          <HStack>
                            <Text fontSize="lg">€</Text>
                            <Text fontWeight="bold" fontSize="lg" color="green.500">
                              {selectedService.price}€
                            </Text>
                          </HStack>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                <Card>
                  <CardBody>
                    <Heading as="h3" size="md" mb={4}>
                      3. Vos informations
                    </Heading>
                    <VStack spacing={4}>
                      <HStack spacing={4} w="full">
                        <Box flex={1}>
                          <Text mb={1} fontWeight="medium">Prénom *</Text>
                          <Input
                            value={formData.firstName}
                            onChange={(e) => handleFormChange('firstName', e.target.value)}
                            placeholder="Votre prénom"
                          />
                        </Box>
                        <Box flex={1}>
                          <Text mb={1} fontWeight="medium">Nom *</Text>
                          <Input
                            value={formData.lastName}
                            onChange={(e) => handleFormChange('lastName', e.target.value)}
                            placeholder="Votre nom"
                          />
                        </Box>
                      </HStack>
                      
                      <Box w="full">
                        <Text mb={1} fontWeight="medium">Email *</Text>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleFormChange('email', e.target.value)}
                          placeholder="votre.email@exemple.com"
                        />
                      </Box>
                      
                      <Box w="full">
                        <Text mb={1} fontWeight="medium">Téléphone *</Text>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleFormChange('phone', e.target.value)}
                          placeholder="+351 xxx xxx xxx"
                        />
                      </Box>
                      
                      <Box w="full">
                        <Text mb={1} fontWeight="medium">Notes (optionnel)</Text>
                        <Textarea
                          value={formData.notes}
                          onChange={(e) => handleFormChange('notes', e.target.value)}
                          placeholder="Informations supplémentaires pour votre consultation..."
                          rows={3}
                        />
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {selectedService && selectedDate && selectedTime && !createdAppointment && (
                  <Button
                    colorScheme="green"
                    size="lg"
                    w="full"
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                    loadingText="Réservation en cours..."
                  >
                    📅 Confirmer la réservation
                  </Button>
                )}

                {createdAppointment && (
                  <Button
                    colorScheme="blue"
                    size="lg"
                    w="full"
                    onClick={handlePayment}
                    isLoading={isProcessingPayment}
                    loadingText="Traitement du paiement..."
                  >
                    💳 Procéder au paiement ({selectedService?.price}€)
                  </Button>
                )}
              </VStack>
              </SimpleGrid>
            )}
          </VStack>
        </Container>
      </Box>
      <SupabaseDebug />
    </Layout>
  )
}