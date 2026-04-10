import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const PASSWORDS = {
  groom: import.meta.env.VITE_GROOM_PASSWORD,
  bride: import.meta.env.VITE_BRIDE_PASSWORD,
  admin: import.meta.env.VITE_ADMIN_PASSWORD,
}

const STORAGE_KEY = 'wedding_role'

export const useAuthStore = defineStore('auth', () => {
  const role = ref(localStorage.getItem(STORAGE_KEY) || null)

  const isAdmin = computed(() => role.value === 'admin')
  const currentSide = computed(() =>
    role.value === 'groom' || role.value === 'bride' ? role.value : null
  )

  function login(selectedRole, password) {
    if (!PASSWORDS[selectedRole]) {
      return '此角色尚未設定密碼'
    }
    if (password !== PASSWORDS[selectedRole]) {
      return '密碼錯誤'
    }
    role.value = selectedRole
    localStorage.setItem(STORAGE_KEY, selectedRole)
    return null // null = 成功
  }

  function logout() {
    role.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  return { role, isAdmin, currentSide, login, logout }
})
