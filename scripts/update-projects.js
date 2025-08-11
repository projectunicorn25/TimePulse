const { createClient } = require('@supabase/supabase-js')

// You'll need to replace these with your actual Supabase URL and service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateProjects() {
  try {
    console.log('Updating projects...')
    
    // First, delete all existing projects
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    if (deleteError) {
      console.error('Error deleting projects:', deleteError)
      return
    }
    
    // Insert the AI Startup project
    const { data, error } = await supabase
      .from('projects')
      .insert([
        { name: 'AI Startup', active: true }
      ])
      .select()
    
    if (error) {
      console.error('Error inserting project:', error)
      return
    }
    
    console.log('Successfully updated projects:', data)
    console.log('Projects now contain only: AI Startup')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

updateProjects()
