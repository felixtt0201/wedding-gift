import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAllGuests, searchGuests, updateGuest, createGuest, deleteGuest, deleteAllGuests } from '../api/guests'
import { addLog } from '../api/logs'

export const useGuestsStore = defineStore('guests', () => {
  const currentSide = ref(null) // 'groom' | 'bride'
  const allGuests = ref([])
  const searchResults = ref([])
  const currentGuest = ref(null)
  const loading = ref(false)
  const toast = ref(null)

  const totalGiftMoney = computed(() =>
    allGuests.value.reduce((sum, g) => sum + (g.giftMoney || 0), 0)
  )
  const cakeStats = computed(() => {
    const needs = allGuests.value.filter(g => g.needsCake)
    const received = needs.filter(g => g.cakeReceived)
    return { total: needs.length, received: received.length }
  })

  function setSide(side) {
    currentSide.value = side
    allGuests.value = []
    searchResults.value = []
    loadAll()
  }

  async function loadAll() {
    if (!currentSide.value) return
    loading.value = true
    try {
      allGuests.value = await getAllGuests(currentSide.value)
    } finally {
      loading.value = false
    }
  }

  async function search(name) {
    if (!name.trim()) {
      searchResults.value = []
      return
    }
    searchResults.value = await searchGuests(name.trim(), currentSide.value)
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
      const guest = allGuests.value.find(g => g.id === id)
      const updated = await updateGuest(id, data)
      const idx = allGuests.value.findIndex(g => g.id === id)
      if (idx !== -1) allGuests.value[idx] = updated
      currentGuest.value = null

      // logging
      if ('giftMoney' in data && guest) {
        addLog(currentSide.value, '更新禮金', guest.name, {
          from: guest.giftMoney,
          to: data.giftMoney,
        })
      } else if ('cakeReceived' in data && guest) {
        addLog(currentSide.value, '切換禮餅', guest.name, {
          received: data.cakeReceived,
        })
      } else if ('absent' in data && guest) {
        addLog(currentSide.value, '標記出席', guest.name, {
          absent: data.absent,
        })
      }

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
      const created = await createGuest({ ...data, side: currentSide.value })
      allGuests.value.push(created)
      addLog(currentSide.value, '新增賓客', data.name, {
        tableNumber: data.tableNumber,
        giftMoney: data.giftMoney,
        needsCake: data.needsCake,
      })
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
        const exists = allGuests.value.find(existing => existing.name === g.name)
        if (exists) { skipped++; continue }
        const created = await createGuest({ ...g, side: currentSide.value })
        allGuests.value.push(created)
        added++
      }
      addLog(currentSide.value, '批次匯入', null, { count: added, skipped })
      showToast(`匯入完成：新增 ${added} 筆，跳過重複 ${skipped} 筆`, 'success')
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      loading.value = false
    }
  }

  async function removeGuest(id) {
    const guest = allGuests.value.find(g => g.id === id)
    await deleteGuest(id)
    allGuests.value = allGuests.value.filter(g => g.id !== id)
    if (guest) addLog(currentSide.value, '刪除賓客', guest.name, {})
    showToast('已刪除', 'success')
  }

  async function clearAllGuests() {
    loading.value = true
    try {
      const count = allGuests.value.length
      await deleteAllGuests(currentSide.value)
      allGuests.value = []
      addLog(currentSide.value, '清除全部賓客', null, { count })
      showToast(`已刪除全部 ${count} 位賓客`, 'success')
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      loading.value = false
    }
  }

  function showToast(message, type = 'success') {
    toast.value = { message, type }
    setTimeout(() => { toast.value = null }, 3000)
  }

  return {
    currentSide,
    allGuests, searchResults, currentGuest, loading, toast,
    totalGiftMoney, cakeStats,
    setSide, loadAll, search, selectGuest, clearSelection,
    saveGuest, addGuest, importGuests, removeGuest, clearAllGuests, showToast
  }
})
