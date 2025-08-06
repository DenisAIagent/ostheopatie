'use client'

import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Stack,
  Container,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'

interface NavLinkProps {
  children: React.ReactNode
  href: string
}

const NavLink = ({ children, href }: NavLinkProps) => (
  <Link
    as={NextLink}
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: 'gray.200',
    }}
    href={href}
  >
    {children}
  </Link>
)

export default function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box bg="white" px={4} shadow="sm">
      <Container maxW="container.xl">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={<Text fontSize="lg">{isOpen ? '✕' : '☰'}</Text>}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          
          <HStack spacing={8} alignItems={'center'}>
            <Box>
              <Text fontSize="xl" fontWeight="bold" color="green.500">
                Camille Labasse D.O
              </Text>
            </Box>
            <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
              <NavLink href="/">Accueil</NavLink>
              <NavLink href="/services">Services</NavLink>
              <NavLink href="/about">À propos</NavLink>
              <NavLink href="/contact">Contact</NavLink>
            </HStack>
          </HStack>
          
          <Flex alignItems={'center'} gap={4}>
            <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
              <Text fontSize="lg">📞</Text>
              <Text fontSize="sm" color="gray.600">
                (+351) 930 505 939
              </Text>
            </HStack>
            
            <Menu>
              <MenuButton as={Button} variant="ghost" size="sm">
                <HStack>
                  <Text fontSize="lg">🌐</Text>
                  <Text>FR</Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem>🇫🇷 Français</MenuItem>
                <MenuItem>🇵🇹 Português</MenuItem>
                <MenuItem>🇬🇧 English</MenuItem>
              </MenuList>
            </Menu>
            
            <Button
              as={NextLink}
              href="/booking"
              colorScheme="green"
              size="sm"
              display={{ base: 'none', md: 'inline-flex' }}
            >
              Réserver
            </Button>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              <NavLink href="/">Accueil</NavLink>
              <NavLink href="/services">Services</NavLink>
              <NavLink href="/about">À propos</NavLink>
              <NavLink href="/contact">Contact</NavLink>
              <Box pt={2}>
                <Button
                  as={NextLink}
                  href="/booking"
                  colorScheme="green"
                  size="sm"
                  w="full"
                >
                  Réserver une consultation
                </Button>
              </Box>
            </Stack>
          </Box>
        ) : null}
      </Container>
    </Box>
  )
}