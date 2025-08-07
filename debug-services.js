// Debug script pour tester la connexion Supabase et récupération des services
import { createClient } from '@supabase/supabase-js'

// Configuration (utiliser les mêmes variables que Railway)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

console.log('🔍 Debug Services Loading (avec RPC)')
console.log('📊 Supabase URL:', supabaseUrl.substring(0, 30) + '...')
console.log('🔑 Anon Key:', supabaseAnonKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('\n🧪 Test 1: Connexion basique')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('services')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Erreur connexion:', connectionError)
    } else {
      console.log('✅ Connexion OK')
    }

    console.log('\n🧪 Test 2: Services dans schema public')
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('price')
      
    console.log('📊 Services found:', services?.length || 0)
    if (servicesError) {
      console.log('❌ Erreur services:', servicesError)
    } else {
      console.log('✅ Services loaded successfully!')
    }

    console.log('\n🧪 Test 3: Détails des services trouvés')
    if (services && services.length > 0) {
      services.forEach((service, index) => {
        console.log(`📋 Service ${index + 1}:`, {
          id: service.id?.substring(0, 8) + '...',
          name_fr: service.name_fr,
          price: service.price,
          duration: service.duration,
          is_active: service.is_active
        })
      })
    } else {
      console.log('⚠️ No services found. Run migrate-final.sql script first!')
    }

    console.log('\n🧪 Test 4: Test user creation (public schema)')
    const { data: userTest, error: userTestError } = await supabase
      .from('users')
      .upsert({
        email: `test${Date.now()}@example.com`,
        first_name: 'Test',
        last_name: 'User',
        phone: '+351999999999',
        preferred_language: 'fr'
      }, { onConflict: 'email' })
      .select()
      .single()

    console.log('📊 User creation test:', {
      success: !userTestError,
      error: userTestError?.message || 'None',
      user_id: userTest?.id?.substring(0, 8) + '...' || 'None'
    })

    console.log('\n🧪 Test 5: Test appointment creation (if user exists)')
    if (userTest && services && services.length > 0) {
      const testDate = new Date()
      testDate.setHours(testDate.getHours() + 24) // Tomorrow
      
      const { data: appointmentTest, error: appointmentTestError } = await supabase
        .from('appointments')
        .insert({
          user_id: userTest.id,
          service_id: services[0].id,
          appointment_date: testDate.toISOString(),
          notes: 'Test appointment',
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single()

      console.log('📊 Appointment creation test:', {
        success: !appointmentTestError,
        error: appointmentTestError?.message || 'None',
        appointment_id: appointmentTest?.id?.substring(0, 8) + '...' || 'None'
      })
    }

    console.log('\n✅ RÉSULTATS FINAUX:')
    console.log(`📊 Services disponibles: ${services?.length || 0}`)
    console.log(`🔧 Migration requise: ${services?.length ? 'NON' : 'OUI - Exécutez migrate-final.sql'}`)

  } catch (error) {
    console.error('💥 Erreur globale:', error)
  }
}

testConnection()