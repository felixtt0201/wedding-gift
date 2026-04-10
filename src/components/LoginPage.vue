<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-title">
        <span class="title-icon">🎊</span>
        <span>婚禮賓客管理</span>
      </div>

      <!-- 選擇角色 -->
      <template v-if="!selectedRole">
        <p class="hint">請選擇身份</p>
        <div class="role-btns">
          <button class="role-btn" @click="selectedRole = 'groom'">
            <span class="role-icon">🤵</span>
            <span class="role-label">男方</span>
          </button>
          <button class="role-btn" @click="selectedRole = 'bride'">
            <span class="role-icon">👰</span>
            <span class="role-label">女方</span>
          </button>
          <button class="role-btn admin-btn" @click="selectedRole = 'admin'">
            <span class="role-icon">🔑</span>
            <span class="role-label">管理者</span>
          </button>
        </div>
      </template>

      <!-- 輸入密碼 -->
      <template v-else>
        <button class="back-btn" @click="reset">← 返回</button>
        <div class="selected-label">
          {{ roleLabels[selectedRole] }} 登入
        </div>
        <input
          ref="pwdRef"
          type="password"
          v-model="password"
          placeholder="請輸入密碼"
          class="pwd-input"
          @keydown.enter="doLogin"
          autocomplete="current-password"
        />
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        <button class="btn-primary login-btn" @click="doLogin">登入</button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useGuestsStore } from '../stores/guests'

const auth = useAuthStore()
const guests = useGuestsStore()

const selectedRole = ref(null)
const password = ref('')
const errorMsg = ref('')
const pwdRef = ref(null)

const roleLabels = { groom: '🤵 男方', bride: '👰 女方', admin: '🔑 管理者' }

function reset() {
  selectedRole.value = null
  password.value = ''
  errorMsg.value = ''
}

async function selectRole(r) {
  selectedRole.value = r
  await nextTick()
  pwdRef.value?.focus()
}

function doLogin() {
  errorMsg.value = ''
  const err = auth.login(selectedRole.value, password.value)
  if (err) {
    errorMsg.value = err
    password.value = ''
    return
  }
  if (auth.currentSide) {
    guests.setSide(auth.currentSide)
  }
}

// 點角色後自動 focus 密碼框
import { watch } from 'vue'
watch(selectedRole, async (val) => {
  if (val) {
    await nextTick()
    pwdRef.value?.focus()
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 1.5rem;
}

.login-card {
  background: #fff;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.login-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--primary-dark);
}
.title-icon { font-size: 1.5rem; }

.hint {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: -0.4rem;
}

.role-btns {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.role-btn {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 1.2rem;
  border-radius: var(--radius);
  border: 2px solid var(--border);
  background: #fdf8f0;
  font-size: 1rem;
  transition: all 0.15s;
  text-align: left;
}
.role-btn:hover {
  border-color: var(--primary);
  background: #fef3ee;
}
.admin-btn { background: #f8f8f8; }
.admin-btn:hover { border-color: #555; background: #f0f0f0; }

.role-icon { font-size: 1.4rem; }
.role-label { font-weight: 700; color: var(--text); }

.back-btn {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.85rem;
  color: var(--text-muted);
  text-align: left;
  width: fit-content;
}
.back-btn:hover { color: var(--text); }

.selected-label {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-dark);
  text-align: center;
}

.pwd-input {
  font-size: 1rem;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 2px solid var(--border);
  width: 100%;
}
.pwd-input:focus { border-color: var(--primary); outline: none; }

.error-msg {
  background: #fdecea;
  color: var(--error);
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
  font-size: 0.85rem;
  text-align: center;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
}
</style>
