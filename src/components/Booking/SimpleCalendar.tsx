'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  SimpleGrid,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  addMonths, 
  subMonths,
  isBefore,
  startOfDay,
  isSameDay
} from 'date-fns'
import { fr } from 'date-fns/locale'

interface SimpleCalendarProps {
  selectedDate: Date | null
  selectedTime: string
  onDateSelect: (date: Date) => void
  onTimeSelect: (time: string) => void
  serviceDuration: number
}

// Fetch available time slots from API
const getAvailableSlots = async (date: Date): Promise<string[]> => {
  try {
    const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD format
    const response = await fetch(`/api/availability?date=${dateString}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch availability')
    }
    
    const data = await response.json()
    return data.availableSlots || []
  } catch (error) {
    console.error('Error fetching available slots:', error)
    return []
  }
}

export default function SimpleCalendar({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  serviceDuration,
}: SimpleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  const today = startOfDay(new Date())
  
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const selectedBg = useColorModeValue('primary.500', 'primary.300')
  const todayBg = useColorModeValue('primary.100', 'primary.700')
  const disabledColor = useColorModeValue('gray.300', 'gray.600')

  // Load available slots when selected date changes
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([])
      return
    }

    const loadSlots = async () => {
      setIsLoadingSlots(true)
      try {
        const slots = await getAvailableSlots(selectedDate)
        setAvailableSlots(slots)
      } catch (error) {
        console.error('Error loading slots:', error)
        setAvailableSlots([])
      } finally {
        setIsLoadingSlots(false)
      }
    }

    loadSlots()
  }, [selectedDate])

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const isDayDisabled = (date: Date) => {
    return isBefore(date, today) || date.getDay() === 0 || date.getDay() === 6
  }

  const getDayButtonProps = (date: Date) => {
    const isSelected = selectedDate && isSameDay(date, selectedDate)
    const isCurrentDay = isToday(date)
    const isDisabled = isDayDisabled(date)
    const isOtherMonth = !isSameMonth(date, currentDate)

    let props: any = {
      size: 'sm',
      variant: 'ghost',
      onClick: () => !isDisabled && onDateSelect(date),
      disabled: isDisabled || isOtherMonth,
      color: isOtherMonth ? disabledColor : 'inherit',
    }

    if (isSelected) {
      props = {
        ...props,
        bg: selectedBg,
        color: 'white',
        _hover: { bg: selectedBg },
      }
    } else if (isCurrentDay && !isDisabled) {
      props = {
        ...props,
        bg: todayBg,
        _hover: { bg: todayBg },
      }
    }

    return props
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Calendar Header */}
      <HStack justify="space-between">
        <Button
          onClick={goToPreviousMonth}
          variant="ghost"
          size="sm"
        >
          ← Précédent
        </Button>
        <Text fontSize="lg" fontWeight="bold">
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </Text>
        <Button
          onClick={goToNextMonth}
          variant="ghost"
          size="sm"
        >
          Suivant →
        </Button>
      </HStack>

      {/* Calendar Grid */}
      <Box>
        {/* Day Headers */}
        <SimpleGrid columns={7} spacing={1} mb={2}>
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <Text
              key={day}
              textAlign="center"
              fontSize="sm"
              fontWeight="bold"
              color="gray.500"
              py={2}
            >
              {day}
            </Text>
          ))}
        </SimpleGrid>

        {/* Calendar Days */}
        <SimpleGrid columns={7} spacing={1}>
          {/* Add empty cells for days before month start */}
          {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, index) => (
            <Box key={`empty-${index}`} />
          ))}
          
          {monthDays.map((date) => (
            <Button
              key={date.toISOString()}
              {...getDayButtonProps(date)}
            >
              {format(date, 'd')}
            </Button>
          ))}
        </SimpleGrid>
      </Box>

      {/* Time Slots */}
      {selectedDate && (
        <Box>
          <Text fontSize="md" fontWeight="bold" mb={3}>
            Créneaux disponibles
          </Text>
          
          {isLoadingSlots ? (
            <Box textAlign="center" py={4}>
              <Spinner size="md" color="green.500" />
              <Text mt={2} fontSize="sm" color="gray.500">
                Chargement des créneaux...
              </Text>
            </Box>
          ) : availableSlots.length > 0 ? (
            <SimpleGrid columns={{ base: 3, md: 4 }} spacing={2}>
              {availableSlots.map((slot) => (
                <Button
                  key={slot}
                  size="sm"
                  variant={selectedTime === slot ? 'solid' : 'outline'}
                  colorScheme={selectedTime === slot ? 'green' : 'gray'}
                  onClick={() => onTimeSelect(slot)}
                >
                  {slot}
                </Button>
              ))}
            </SimpleGrid>
          ) : (
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text color="gray.600" textAlign="center">
                Aucun créneau disponible pour cette date.
                <br />
                Veuillez choisir un autre jour.
              </Text>
            </Box>
          )}
        </Box>
      )}
    </VStack>
  )
}