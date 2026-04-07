import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl as string, supabaseKey as string)

async function test() {
  const { data: usuarios, error } = await supabase.from('usuarios').select('*, roles(nombre)')
  if (error) console.error("Error usuarios:", error)
  else console.log("Usuarios en BD:", JSON.stringify(usuarios, null, 2))
}

test()
