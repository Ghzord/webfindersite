import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://zqznaevluxughoiiqfyxs.supabase.co'
const supabaseKey = 'sb_publishable_x0tOQJpg_GF9ha2doN79QA_m8l2-5OD' // Certifique-se de que é a chave inteira do painel

export const supabase = createClient(supabaseUrl, supabaseKey)
