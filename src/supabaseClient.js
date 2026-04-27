import { createClient } from '@supabase/supabase-js'

// You'll find these in your Supabase Dashboard under Settings > API
const supabaseUrl = 'https://gschjdiyjcgulsazqasg.supabase.co'
const supabaseKey = 'sb_publishable_EcnSyMQS7NjBKEZl4P12Tw_OjChhi13'

export const supabase = createClient(supabaseUrl, supabaseKey)