// Debug script pour tester la connexion Supabase et récupération des services
const { createClient } = require('@supabase/supabase-js')

// Configuration (utiliser les mêmes variables que Railway)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

console.log('🔍 Debug Services Loading')
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

    console.log('\n🧪 Test 3: Services dans schema app')
    const { data: appServices, error: appError } = await supabase
      .schema('app')
      .from('services')
      .select('*')
      
    console.log('📊 Services (app):', appServices?.length || 0)
    if (appError) console.log('❌ Erreur app:', appError)

    console.log('\n🧪 Test 4: RLS Policies')
    const { data: rlsTest, error: rlsError } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      
    console.log('📊 Services actifs:', rlsTest?.length || 0)
    if (rlsError) console.log('❌ Erreur RLS:', rlsError)

    console.log('\n🧪 Test 5: Détails des services trouvés')
    const services = publicServices || appServices || []
    services.forEach((service, index) => {
      console.log(`📋 Service ${index + 1}:`, {
        id: service.id,
        name_fr: service.name_fr,
        price: service.price,
        is_active: service.is_active
      })
    })

  } catch (error) {
    console.error('💥 Erreur globale:', error)
  }
}

testConnection()