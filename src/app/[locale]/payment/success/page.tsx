'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Icon,
} from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout/Layout'

export default function PaymentSuccessPage() {
  const router = useRouter()

  return (
    <Layout>
      <Container maxW="container.md" py={12}>
        <Card>
          <CardBody textAlign="center">
            <VStack spacing={6}>
              <Icon as={CheckCircleIcon} w={20} h={20} color="green.500" />
              
              <VStack spacing={3}>
                <Heading as="h1" size="xl" color="green.600">
                  Paiement réussi !
                </Heading>
                <Text fontSize="lg" color="gray.600">
                  Votre rendez-vous a été confirmé
                </Text>
              </VStack>

              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Réservation confirmée</Text>
                  <Text fontSize="sm">
                    Vous recevrez un email de confirmation avec tous les détails de votre rendez-vous.
                  </Text>
                </Box>
              </Alert>

              <VStack spacing={4} pt={4}>
                <Text fontSize="md" color="gray.600">
                  Que faire ensuite ?
                </Text>
                
                <VStack spacing={2} fontSize="sm" color="gray.500">
                  <Text>• Vérifiez votre email pour la confirmation</Text>
                  <Text>• Notez la date et l'heure de votre rendez-vous</Text>
                  <Text>• Contactez-nous si vous avez des questions</Text>
                </VStack>

                <Button
                  colorScheme="green"
                  size="lg"
                  onClick={() => router.push('/')}
                  mt={4}
                >
                  Retour à l'accueil
                </Button>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Layout>
  )
}