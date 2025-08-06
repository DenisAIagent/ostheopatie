'use client'

import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Link,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook } from 'react-icons/fa'
import NextLink from 'next/link'

export default function Footer() {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
    >
      <Container as={Stack} maxW={'container.xl'} py={10}>
        <SimpleGrid
          templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr' }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Box>
              <Text fontSize="lg" fontWeight="bold" color="primary.500">
                Camille Labasse D.O
              </Text>
              <Text fontSize={'sm'}>
                Ostéopathe certifiée à Lisbonne
              </Text>
            </Box>
            <Text fontSize={'sm'}>
              Spécialiste en ostéopathie tissulaire, aquatique et pédiatrique.
              Consultations en français, portugais et anglais.
            </Text>
            <Text fontSize={'sm'} color="gray.500">
              N. Cédula profissional 0100935
            </Text>
          </Stack>
          
          <Stack spacing={6}>
            <Text fontWeight={'500'}>Contact</Text>
            <Stack spacing={3}>
              <HStack>
                <Icon as={FaMapMarkerAlt} color="primary.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize={'sm'}>Espaço Oneleaf</Text>
                  <Text fontSize={'sm'}>Rua Rodrigues Sampaio n°76</Text>
                  <Text fontSize={'sm'}>1º apartamento, Lisbonne</Text>
                </VStack>
              </HStack>
              <HStack>
                <Icon as={FaPhone} color="primary.500" />
                <Text fontSize={'sm'}>(+351) 930 505 939</Text>
              </HStack>
              <HStack>
                <Icon as={FaEnvelope} color="primary.500" />
                <Text fontSize={'sm'}>camilleosteopatia@gmail.com</Text>
              </HStack>
            </Stack>
          </Stack>
          
          <Stack spacing={6}>
            <Text fontWeight={'500'}>Navigation</Text>
            <Stack spacing={2}>
              <Link as={NextLink} href="/" fontSize={'sm'}>Accueil</Link>
              <Link as={NextLink} href="/services" fontSize={'sm'}>Services</Link>
              <Link as={NextLink} href="/about" fontSize={'sm'}>À propos</Link>
              <Link as={NextLink} href="/contact" fontSize={'sm'}>Contact</Link>
              <Link as={NextLink} href="/booking" fontSize={'sm'} color="primary.500">
                Réserver
              </Link>
            </Stack>
          </Stack>
        </SimpleGrid>
      </Container>

      <Box
        borderTopWidth={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <Container
          as={Stack}
          maxW={'container.xl'}
          py={4}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}
        >
          <Text fontSize={'sm'}>
            © 2025 Camille Labasse D.O. Tous droits réservés.
          </Text>
          <HStack>
            <Link
              href="https://facebook.com/osteopatalisboa"
              isExternal
              _hover={{ color: 'primary.500' }}
            >
              <Icon as={FaFacebook} />
            </Link>
          </HStack>
        </Container>
      </Box>
    </Box>
  )
}