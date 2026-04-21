import { createClient } from '@supabase/supabase-js'

// ⚠️ Make sure to replace these with your own Supabase project credentials
const SUPABASE_URL = 'https://czudhvjomegowmnhnrda.supabase.co/rest/v1/'
const SUPABASE_PUBLIC_KEY = 'sb_publishable_wVyLnD7qg57JZtXd9Wm0xA_9CAg6glC'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY)

