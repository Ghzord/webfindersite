import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://yzeliparrqpyssxjmysw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZWxpcGFycnFweXNzeGpteXN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMzYwNTEsImV4cCI6MjEwNjgxMjA1MX0.HrHKALXb-_OQyXMgOHm3clAK_ZFNrI81SDE0c0jK67w' // Certifique-se de que é a chave inteira do painel

export const supabase = createClient(supabaseUrl, supabaseKey)
