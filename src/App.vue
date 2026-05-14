<template>
  <div class="app">
    <!-- 未登入 -->
    <LoginPage v-if="!auth.role" />

    <!-- 管理者 -->
    <template v-else-if="auth.isAdmin">
      <header class="app-header">
        <div class="header-inner">
          <div class="app-title">
            <span class="title-icon">🎊</span>
            <span>婚禮賓客管理</span>
          </div>
          <div class="header-right">
            <span class="side-badge badge-admin">🔑 管理者</span>
            <button class="btn-ghost logout-btn" @click="auth.logout()">登出</button>
          </div>
        </div>
      </header>
      <main class="app-main">
        <AdminView />
      </main>
    </template>

    <!-- 男方 / 女方 -->
    <template v-else>
      <header class="app-header">
        <div class="header-inner">
          <div class="app-title">
            <span class="title-icon">🎊</span>
            <span>婚禮賓客管理</span>
          </div>
          <div class="header-right">
            <span
              class="side-badge"
              :class="auth.currentSide === 'groom' ? 'badge-groom' : 'badge-bride'"
            >
              {{ auth.currentSide === 'groom' ? '🤵 男方' : '👰 女方' }}
            </span>
            <button class="btn-ghost import-btn" @click="showImport = true">＋ 匯入名單</button>
            <button class="btn-ghost logout-btn" @click="auth.logout()">登出</button>
          </div>
        </div>
      </header>

      <main class="app-main">
        <GuestList />
      </main>

      <div
        v-if="store.toast"
        :class="['toast', `toast-${store.toast.type}`]"
      >{{ store.toast.message }}</div>

      <ImportModal v-if="showImport" @close="showImport = false" />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useGuestsStore } from './stores/guests'
import LoginPage from './components/LoginPage.vue'
import AdminView from './components/AdminView.vue'
import GuestList from './components/GuestList.vue'
import ImportModal from './components/ImportModal.vue'

const auth = useAuthStore()
const store = useGuestsStore()
const showImport = ref(false)

onMounted(() => {
  if (auth.currentSide && !store.currentSide) {
    store.setSide(auth.currentSide)
  }
})
</script>

<style scoped>
.app { min-height: 100vh; display: flex; flex-direction: column; }

.app-header {
  background: var(--primary);
  color: #fff;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  position: sticky; top: 0; z-index: 50;
}
.header-inner {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.8rem 1.2rem;
  gap: 0.6rem;
}
.app-title {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 1.1rem; font-weight: 700;
  flex-shrink: 0;
}
.title-icon { font-size: 1.3rem; }

.header-right {
  display: flex; align-items: center; gap: 0.6rem;
}

.side-badge {
  display: inline-flex; align-items: center;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem; font-weight: 700;
  white-space: nowrap;
}
.badge-groom { background: #2980b9; color: #fff; }
.badge-bride { background: #8e44ad; color: #fff; }
.badge-admin { background: #555; color: #fff; }

.import-btn, .logout-btn {
  background: rgba(255,255,255,0.15);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.35);
  font-size: 0.85rem;
  padding: 0.4rem 0.9rem;
  white-space: nowrap;
}
.import-btn:hover, .logout-btn:hover { background: rgba(255,255,255,0.25); }

.app-main {
  flex: 1;
  padding: 1.2rem;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 600px) {
  .app-main { padding: 0.75rem; }
  .header-inner { padding: 0.6rem 0.75rem; }
  .app-title { font-size: 0.95rem; }
  .import-btn, .logout-btn { font-size: 0.78rem; padding: 0.3rem 0.55rem; }
  .side-badge { font-size: 0.75rem; padding: 0.2rem 0.5rem; }
}
</style>
