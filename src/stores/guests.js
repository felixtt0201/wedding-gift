import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAllGuests, searchGuests, updateGuest, createGuest, deleteGuest } from '../api/guests'

export const useGuestsStore = defineStore('guests', () => {
  const allGuests = ref([])
  const searchResults = ref([])
  const currentGuest = ref(null)
  const loading = ref(false)
  const toast = ref(null) // { message, type }

  const totalGiftMoney = computed(() =>
    allGuests.value.reduce((sum, g) => sum + (g.giftMoney || 0), 0)
  )
  const cakeStats = computed(() => {
    const needs = allGuests.value.filter(g => g.needsCake)
    const received = needs.filter(g => g.cakeReceived)
    return { total: needs.length, received: received.length }
  })

  async function loadAll() {
    loading.value = true
    try {
      allGuests.value = await getAllGuests()
    } finally {
      loading.value = false
    }
  }

  async function search(name) {
    if (!name.trim()) {
      searchResults.value = []
      return
    }
    searchResults.value = await searchGuests(name.trim())
  }

  function selectGuest(guest) {
    currentGuest.value = { ...guest }
  }

  function clearSelection() {
    currentGuest.value = null
    searchResults.value = []
  }

  async function saveGuest(id, data) {
    loading.value = true
    try {
      const updated = await updateGuest(id, data)
      const idx = allGuests.value.findIndex(g => g.id === id)
      if (idx !== -1) allGuests.value[idx] = updated
      currentGuest.value = null
      showToast('已儲存', 'success')
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      loading.value = false
    }
  }

  async function addGuest(data) {
    loading.value = true
    try {
      const created = await createGuest(data)
      allGuests.value.push(created)
      showToast(`已新增賓客：${data.name}`, 'success')
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      loading.value = false
    }
  }

  async function importGuests(guests) {
    loading.value = true
    let added = 0
    let skipped = 0
    try {
      for (const g of guests) {
        const exists = allGuests.value.find(
          existing => existing.name === g.name
        )
        if (exists) { skipped++; continue }
        const created = await createGuest(g)
        allGuests.value.push(created)
        added++
      }
      showToast(`匯入完成：新增 ${added} 筆，跳過重複 ${skipped} 筆`, 'success')
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      loading.value = false
    }
  }

  async function removeGuest(id) {
    await deleteGuest(id)
    allGuests.value = allGuests.value.filter(g => g.id !== id)
    showToast('已刪除', 'success')
  }

  function showToast(message, type = 'success') {
    toast.value = { message, type }
    setTimeout(() => { toast.value = null }, 3000)
  }

  return {
    allGuests, searchResults, currentGuest, loading, toast,
    totalGiftMoney, cakeStats,
    loadAll, search, selectGuest, clearSelection,
    saveGuest, addGuest, importGuests, removeGuest, showToast
  }
})
