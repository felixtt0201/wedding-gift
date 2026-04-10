const BASE = '/guests'

export async function searchGuests(name) {
  const res = await fetch(`${BASE}?name_like=${encodeURIComponent(name)}`)
  if (!res.ok) throw new Error('搜尋失敗')
  return res.json()
}

export async function getAllGuests() {
  const res = await fetch(BASE)
  if (!res.ok) throw new Error('載入失敗')
  return res.json()
}

export async function updateGuest(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('儲存失敗')
  return res.json()
}

export async function createGuest(data) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('新增失敗')
  return res.json()
}

export async function deleteGuest(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('刪除失敗')
}
