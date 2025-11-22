// Script to create 3 test users for the 3 tiers
const SUPABASE_URL = 'https://oglmncodldqiafmxpwdw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbG1uY29kbGRxaWFmbXhwd2R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTY4ODcxMCwiZXhwIjoyMDY3MjY0NzEwfQ.mRKrQnjnW7LXjjDUx-uFi3aWJjnbaZShH4f5RqJl9_Q'

const testUsers = [
  {
    email: 'hobby@test.com',
    full_name: 'Hobby Test User',
    username: 'hobbyuser',
    password: 'TestPass123!',
    tier: 'hobby',
    role: 'user',
    credits_balance: 100,
    monthly_limit: 100
  },
  {
    email: 'pro@test.com',
    full_name: 'Pro Test User',
    username: 'prouser',
    password: 'TestPass123!',
    tier: 'pro',
    role: 'user',
    credits_balance: 1000,
    monthly_limit: 1000
  },
  {
    email: 'advanced@test.com',
    full_name: 'Advanced Test User',
    username: 'advanceduser',
    password: 'TestPass123!',
    tier: 'Advanced',
    role: 'user',
    credits_balance: 5000,
    monthly_limit: 5000
  }
]

async function createTestUsers() {
  console.log('🚀 Starting to create test users...')
  
  for (const user of testUsers) {
    try {
      console.log(`\n📝 Creating user: ${user.email}`)
      
      // First create user in auth.users (Supabase Auth)
      const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            full_name: user.full_name,
            username: user.username
          }
        })
      })
      
      if (!authResponse.ok) {
        const authError = await authResponse.text()
        console.error(`❌ Auth creation failed for ${user.email}:`, authError)
        continue
      }
      
      const authData = await authResponse.json()
      console.log(`✅ Auth user created: ${authData.user.id}`)
      
      // Then create user record in public.users
      const userResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          id: authData.user.id,
          email: user.email,
          full_name: user.full_name,
          username: user.username,
          role: user.role,
          tier: user.tier,
          credits_balance: user.credits_balance,
          monthly_limit: user.monthly_limit,
          is_active: true,
          onboarding_completed: false,
          metadata: {
            created_by: 'test_script',
            test_user: true
          }
        })
      })
      
      if (!userResponse.ok) {
        const userError = await userResponse.text()
        console.error(`❌ User record creation failed for ${user.email}:`, userError)
        continue
      }
      
      const userData = await userResponse.json()
      console.log(`✅ User record created: ${userData[0].id}`)
      console.log(`🎉 Successfully created user: ${user.email} (${user.tier} tier)`)
      
    } catch (error) {
      console.error(`❌ Error creating user ${user.email}:`, error.message)
    }
  }
  
  console.log('\n🏁 Test user creation completed!')
}

// Run the script
createTestUsers().catch(console.error)
