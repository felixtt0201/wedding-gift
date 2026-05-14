import { supabase } from '../lib/supabase'

function fromDb(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    side: row.side,
    tableNumber: row.table_number ?? '',
    needsCake: row.needs_cake ?? false,
    cakeReceived: row.cake_received ?? false,
    giftMoney: row.gift_money ?? 0,
    absent: row.absent ?? false,
  }
}

function toDb(data) {
  const result = {}
  if ('name' in data) result.name = data.name
  if ('side' in data) result.side = data.side
  if ('tableNumber' in data) result.table_number = data.tableNumber
  if ('needsCake' in data) result.needs_cake = data.needsCake
  if ('cakeReceived' in data) result.cake_received = data.cakeReceived
  if ('giftMoney' in data) result.gift_money = data.giftMoney
  if ('absent' in data) result.absent = data.absent
  return result
}

export async function getAllGuests(side) {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('side', side)
  if (error) throw new Error('載入失敗')
  return data.map(fromDb)
}

export async function getAllGuestsAdmin() {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
  if (error) throw new Error('載入失敗')
  return data.map(fromDb)
}

export async function searchGuests(name, side) {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .ilike('name', `%${name}%`)
    .eq('side', side)
  if (error) throw new Error('搜尋失敗')
  return data.map(fromDb)
}

export async function updateGuest(id, data) {
  const { data: rows, error } = await supabase
    .from('guests')
    .update(toDb(data))
    .eq('id', id)
    .select()
  if (error) throw new Error('儲存失敗')
  return fromDb(rows[0])
}

export async function createGuest(data) {
  const { data: rows, error } = await supabase
    .from('guests')
    .insert(toDb(data))
    .select()
  if (error) throw new Error('新增失敗')
  return fromDb(rows[0])
}

export async function deleteGuest(id) {
  const { error } = await supabase
    .from('guests')
    .delete()
    .eq('id', id)
  if (error) throw new Error('刪除失敗')
}

export async function deleteAllGuests(side) {
  const { error } = await supabase
    .from('guests')
    .delete()
    .eq('side', side)
  if (error) throw new Error('刪除失敗')
}
