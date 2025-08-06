'use client'

import {
  VStack,
  HStack,
  Box,
  Text,
  Icon,
  useColorModeValue,
  Radio,
  RadioGroup,
} from '@chakra-ui/react'
import { FaEuroSign, FaClock } from 'react-icons/fa'

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
}

interface ServiceSelectorProps {
  services: Service[]
  selectedService: Service | null
  onServiceSelect: (service: Service) => void
}

export default function ServiceSelector({
  services,
  selectedService,
  onServiceSelect,
}: ServiceSelectorProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const selectedBorderColor = useColorModeValue('primary.500', 'primary.300')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  return (
    <RadioGroup
      value={selectedService?.id || ''}
      onChange={(value) => {
        const service = services.find(s => s.id === value)
        if (service) onServiceSelect(service)
      }}
    >
      <VStack spacing={4} align="stretch">
        {services.map((service) => (
          <Box
            key={service.id}
            as="label"
            cursor="pointer"
            border="1px solid"
            borderColor={selectedService?.id === service.id ? selectedBorderColor : borderColor}
            borderRadius="md"
            p={4}
            _hover={{ bg: hoverBg, borderColor: selectedBorderColor }}
            transition="all 0.2s"
            bg={selectedService?.id === service.id ? 'primary.50' : 'transparent'}
          >
            <HStack spacing={4} align="start">
              <Radio value={service.id} mt={1} />
              <VStack align="start" spacing={2} flex="1">
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold" fontSize="lg">
                    {service.name}
                  </Text>
                  <HStack spacing={4} color="primary.500">
                    <HStack spacing={1}>
                      <Icon as={FaEuroSign} />
                      <Text fontWeight="bold">{service.price}</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={FaClock} />
                      <Text>{service.duration}min</Text>
                    </HStack>
                  </HStack>
                </HStack>
                <Text color="gray.600" fontSize="sm">
                  {service.description}
                </Text>
              </VStack>
            </HStack>
          </Box>
        ))}
      </VStack>
    </RadioGroup>
  )
}