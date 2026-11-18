import { supabase } from './supabase'

async function testConnection() {
  const { data, error } = await supabase
    .from('retailers')
    .select('*')

  if (error) {
    console.error('Connection error:', error.message)
  } else {
    console.log('Supabase connected successfully!')
    console.log('Retailers data:', data)
  }
}

testConnection()