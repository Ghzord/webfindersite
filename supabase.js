import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://zqznaevluxughoiiqfyxs.supabase.co'[cite: 1]
// Copie a chave completa "Publishable key" que aparece na sua tela do Supabase:
const supabaseKey = 'sb_publishable_x0tOQJpg_GF9ha2doN79QA_m8l2-5OD'

export const supabase = createClient(supabaseUrl, supabaseKey)
