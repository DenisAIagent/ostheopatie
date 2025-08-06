'use client'

import { useState, useMemo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  SimpleGrid,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
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
  addMinutes,
  isSameDay
} from 'date-fns'
import { fr } from 'date-fns/locale'

interface BookingCalendarProps {
  selectedDate: Date | null
  selectedTime: string
  onDateSelect: (date: Date) => void
  onTimeSelect: (time: string) => void
  serviceDuration: number
}

// Mock available time slots - in real app, this would come from Supabase
const getAvailableSlots = (date: Date): string[] => {
  // Skip weekends for this demo
  if (date.getDay() === 0 || date.getDay() === 6) {
    return []
  }
  
  // Basic time slots from 9:00 to 18:00
  const slots: string[] = []
  const startHour = 9
  const endHour = 18
  
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    slots.push(`${hour.toString().padStart(2, '0')}:30`)
  }
  
  return slots
}

export default function BookingCalendar({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  serviceDuration,
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  const today = startOfDay(new Date())
  
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const selectedBg = useColorModeValue('primary.500', 'primary.300')
  const todayBg = useColorModeValue('primary.100', 'primary.700')
  const disabledColor = useColorModeValue('gray.300', 'gray.600')

  const availableSlots = useMemo(() => {
    if (!selectedDate) return []
    return getAvailableSlots(selectedDate)
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
        <IconButton
          aria-label="Mois précédent"
          icon={<ChevronLeftIcon />}
          onClick={goToPreviousMonth}
          variant="ghost"
        />
        <Text fontSize="lg" fontWeight="bold">
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </Text>
        <IconButton
          aria-label="Mois suivant"
          icon={<ChevronRightIcon />}
          onClick={goToNextMonth}
          variant="ghost"
        />
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
      {selectedDate && availableSlots.length > 0 && (
        <Box>
          <Text fontSize="md" fontWeight="bold" mb={3}>
            Créneaux disponibles
          </Text>
          <SimpleGrid columns={{ base: 3, md: 4 }} spacing={2}>
            {availableSlots.map((slot) => (
              <Button
                key={slot}
                size="sm"
                variant={selectedTime === slot ? 'solid' : 'outline'}
                colorScheme={selectedTime === slot ? 'primary' : 'gray'}
                onClick={() => onTimeSelect(slot)}
              >
                {slot}
              </Button>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {selectedDate && availableSlots.length === 0 && (
        <Box p={4} bg="gray.50" borderRadius="md">
          <Text color="gray.600" textAlign="center">
            Aucun créneau disponible pour cette date.
            <br />
            Veuillez choisir un autre jour.
          </Text>
        </Box>
      )}
    </VStack>
  )
}