import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase credentials in environment variables')
}

// Client for public operations (auth)
const supabase = createClient(supabaseUrl, supabaseKey)

// Admin client with service role for database operations
// Falls back to anon key if service key is not available
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseKey)

export { supabase, supabaseAdmin } 