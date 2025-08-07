import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if both URL and key are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null as any // Will be handled by the API routes

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string
          preferred_language: 'fr' | 'pt' | 'en'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          phone: string
          preferred_language?: 'fr' | 'pt' | 'en'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string
          preferred_language?: 'fr' | 'pt' | 'en'
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name_fr: string
          name_pt: string
          name_en: string
          description_fr: string
          description_pt: string
          description_en: string
          price: number
          duration: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_fr: string
          name_pt: string
          name_en: string
          description_fr: string
          description_pt: string
          description_en: string
          price: number
          duration: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_fr?: string
          name_pt?: string
          name_en?: string
          description_fr?: string
          description_pt?: string
          description_en?: string
          price?: number
          duration?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          service_id: string
          appointment_date: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string
          payment_status: 'pending' | 'paid' | 'failed'
          payment_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_id: string
          appointment_date: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string
          payment_status?: 'pending' | 'paid' | 'failed'
          payment_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_id?: string
          appointment_date?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string
          payment_status?: 'pending' | 'paid' | 'failed'
          payment_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      availability: {
        Row: {
          id: string
          date: string
          start_time: string
          end_time: string
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          start_time: string
          end_time: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          start_time?: string
          end_time?: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}