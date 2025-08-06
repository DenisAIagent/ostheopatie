import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Badge
} from '@chakra-ui/react'
import Layout from '@/components/Layout/Layout'
import Link from 'next/link'

export default function HomePage() {
  return (
    <Layout>
      <Box bg="white" minH="100vh">
        {/* Hero Section */}
        <Box bg="green.50" py={20}>
          <Container maxW="container.xl">
            <VStack spacing={8} textAlign="center">
              <Heading as="h1" size="2xl" color="green.800">
                Camille Labasse D.O
              </Heading>
              <Text fontSize="xl" color="green.600" maxW="2xl">
                Ostéopathe certifiée à Lisbonne
                <br />
                Spécialiste en ostéopathie tissulaire, aquatique et pédiatrique
              </Text>
              <Button
                as={Link}
                href="/fr/booking"
                size="lg"
                colorScheme="green"
                px={8}
                py={4}
              >
                📅 Réserver une consultation
              </Button>
            </VStack>
          </Container>
        </Box>

        {/* Services Section */}
        <Box py={16}>
          <Container maxW="container.xl">
            <VStack spacing={12}>
              <Heading as="h2" size="xl" textAlign="center" color="green.800">
                Nos Services
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
                <Card>
                  <CardBody textAlign="center" p={8}>
                    <VStack spacing={4}>
                      <Badge colorScheme="green" p={2} borderRadius="full">
                        55€
                      </Badge>
                      <Heading as="h3" size="md">
                        Consultation Standard
                      </Heading>
                      <Text color="gray.600">
                        Consultation d&apos;ostéopathie classique pour tous les âges
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card>
                  <CardBody textAlign="center" p={8}>
                    <VStack spacing={4}>
                      <Badge colorScheme="blue" p={2} borderRadius="full">
                        50€
                      </Badge>
                      <Heading as="h3" size="md">
                        Tarif Réduit
                      </Heading>
                      <Text color="gray.600">
                        Pour bébés &lt; 1 an, demandeurs d&apos;emploi
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card>
                  <CardBody textAlign="center" p={8}>
                    <VStack spacing={4}>
                      <Badge colorScheme="teal" p={2} borderRadius="full">
                        90€
                      </Badge>
                      <Heading as="h3" size="md">
                        Ostéopathie Aquatique
                      </Heading>
                      <Text color="gray.600">
                        Séances spécialisées en milieu aquatique
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* À propos */}
        <Box bg="gray.50" py={16}>
          <Container maxW="container.xl">
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12}>
              <Box>
                <VStack spacing={6} align="stretch">
                  <Heading as="h2" size="xl" color="green.800">
                    À propos de votre ostéopathe
                  </Heading>
                  <Text fontSize="lg" color="gray.700">
                    <strong>N. Cédula profissional 0100935</strong>
                  </Text>
                  <Text color="gray.600">
                    Camille est ostéopathe D.O, exclusive et agréée. Formation de 5 années 
                    à temps plein respectant les normes européennes de formation en ostéopathie.
                  </Text>
                  <Text color="gray.600">
                    Formée en approche tissulaire de Pierre Tricot, obstétrique d&apos;Elisabeth Tissot, 
                    ostéopathie aquatique, pédiatrique, gynécologie holistique.
                  </Text>
                </VStack>
              </Box>
              <Box>
                <VStack spacing={6} align="stretch">
                  <Heading as="h3" size="lg" color="green.800">
                    Informations pratiques
                  </Heading>
                  <HStack>
                    <Text fontSize="lg">📍</Text>
                    <Text>
                      Espaço Oneleaf<br />
                      Rua Rodrigues Sampaio n°76, 1º apartamento<br />
                      Lisbonne, Portugal
                    </Text>
                  </HStack>
                  <HStack>
                    <Text fontSize="lg">📞</Text>
                    <Text>(+351) 930 505 939</Text>
                  </HStack>
                  <HStack>
                    <Text fontSize="lg">🌐</Text>
                    <Text>Consultations en Français, Portugais et Anglais</Text>
                  </HStack>
                </VStack>
              </Box>
            </SimpleGrid>
          </Container>
        </Box>

        {/* CTA Section */}
        <Box bg="green.500" py={16}>
          <Container maxW="container.xl">
            <VStack spacing={8} textAlign="center">
              <Heading as="h2" size="xl" color="white">
                Prêt à prendre rendez-vous ?
              </Heading>
              <Text fontSize="lg" color="green.100" maxW="2xl">
                Réservez votre consultation en ligne en quelques clics. 
                Choisissez votre créneau selon vos disponibilités.
              </Text>
              <Button
                as={Link}
                href="/fr/booking"
                size="lg"
                bg="white"
                color="green.500"
                _hover={{ bg: "gray.100" }}
                px={8}
                py={4}
              >
                📅 Réserver maintenant
              </Button>
            </VStack>
          </Container>
        </Box>
      </Box>
    </Layout>
  )
}