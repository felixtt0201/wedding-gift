import { supabase } from '../lib/supabase'

export function addLog(side, action, guestName, details = {}) {
  // fire and forget，不阻塞 UI
  supabase.from('logs').insert({ side, action, guest_name: guestName, details }).then()
}

export async function getLogs(filterSide = null) {
  let query = supabase
    .from('logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300)
  if (filterSide) query = query.eq('side', filterSide)
  const { data, error } = await query
  if (error) throw new Error('載入紀錄失敗')
  return data
}
