import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://zqznaevluxughoiiqfyxs.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxem5hZXZseHVnaG9paXFmeXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMzkyMjcsImV4cCI6MjEwNjgxNTIyN30.hOsOi3soIUqjcDwCf4eP0mHJu0is254h6GcLlEe-bHs'

export const supabase = createClient(supabaseUrl, supabaseKey)
