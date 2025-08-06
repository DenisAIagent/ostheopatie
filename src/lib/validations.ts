import { z } from 'zod'

// User registration/profile schema
export const userSchema = z.object({
  email: z.string().email('Email invalide'),
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide'),
  preferred_language: z.enum(['fr', 'pt', 'en']).default('fr'),
})

// Appointment booking schema
export const appointmentSchema = z.object({
  service_id: z.string().uuid('ID de service invalide'),
  appointment_date: z.string().datetime('Date/heure invalide'),
  notes: z.string().max(500, 'Les notes ne peuvent pas dépasser 500 caractères').optional(),
})

// Availability slot schema
export const availabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide'),
  is_available: z.boolean().default(true),
}).refine(data => data.start_time < data.end_time, {
  message: 'L\'heure de fin doit être après l\'heure de début',
  path: ['end_time']
})

// Service schema for admin
export const serviceSchema = z.object({
  name_fr: z.string().min(3, 'Le nom français doit contenir au moins 3 caractères'),
  name_pt: z.string().min(3, 'Le nom portugais doit contenir au moins 3 caractères'),
  name_en: z.string().min(3, 'Le nom anglais doit contenir au moins 3 caractères'),
  description_fr: z.string().min(10, 'La description française doit contenir au moins 10 caractères'),
  description_pt: z.string().min(10, 'La description portugaise doit contenir au moins 10 caractères'),
  description_en: z.string().min(10, 'La description anglaise doit contenir au moins 10 caractères'),
  price: z.number().min(0, 'Le prix ne peut pas être négatif'),
  duration: z.number().min(15, 'La durée minimale est de 15 minutes'),
  is_active: z.boolean().default(true),
})

export type UserInput = z.infer<typeof userSchema>
export type AppointmentInput = z.infer<typeof appointmentSchema>
export type AvailabilityInput = z.infer<typeof availabilitySchema>
export type ServiceInput = z.infer<typeof serviceSchema>