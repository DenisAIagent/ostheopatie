// Debug script pour tester la connexion Supabase et récupération des services (avec RPC)
const { createClient } = require('@supabase/supabase-js')

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
    const { data: publicServices, error: publicError } = await supabase
      .from('services')
      .select('*')
      
    console.log('📊 Services (public):', publicServices?.length || 0)
    if (publicError) console.log('❌ Erreur public:', publicError)

    console.log('\n🧪 Test 3: RPC Function - get_services_from_app')
    const { data: rpcServices, error: rpcError } = await supabase
      .rpc('get_services_from_app')
      
    console.log('📊 Services (RPC app):', rpcServices?.length || 0)
    if (rpcError) console.log('❌ Erreur RPC:', rpcError)
    else console.log('✅ RPC function works!')

    console.log('\n🧪 Test 4: Services actifs (meilleure source)')
    let activeServices = []
    if (publicServices && publicServices.length > 0) {
      activeServices = publicServices.filter(s => s.is_active)
      console.log('📊 Using public schema services')
    } else if (rpcServices && rpcServices.length > 0) {
      activeServices = rpcServices.filter(s => s.is_active)
      console.log('📊 Using RPC (app schema) services')
    }
    
    console.log('📊 Services actifs trouvés:', activeServices.length)

    console.log('\n🧪 Test 5: Détails des services trouvés')
    activeServices.forEach((service, index) => {
      console.log(`📋 Service ${index + 1}:`, {
        id: service.id?.substring(0, 8) + '...',
        name_fr: service.name_fr,
        price: service.price,
        duration: service.duration,
        is_active: service.is_active
      })
    })

    console.log('\n🧪 Test 6: Test RPC user creation')
    const testUserId = 'test-user-' + Date.now()
    const { data: userTest, error: userTestError } = await supabase
      .rpc('insert_user_to_app', {
        p_id: testUserId,
        p_email: `test${Date.now()}@example.com`,
        p_first_name: 'Test',
        p_last_name: 'User',
        p_phone: '+351999999999',
        p_preferred_language: 'fr'
      })

    console.log('📊 User creation test:', {
      success: !userTestError,
      error: userTestError?.message || 'None',
      data_count: userTest?.length || 0
    })

  } catch (error) {
    console.error('💥 Erreur globale:', error)
  }
}

testConnection()