<template>
  <div class="app">
    <!-- 選擇男方/女方 -->
    <SideSelect v-if="!store.currentSide" @select="store.setSide" />

    <!-- 主畫面 -->
    <template v-else>
      <header class="app-header">
        <div class="header-inner">
          <div class="app-title">
            <span class="title-icon">🎊</span>
            <span>婚禮賓客管理</span>
          </div>
          <div class="header-right">
            <button
              class="side-badge"
              :class="store.currentSide === 'groom' ? 'badge-groom' : 'badge-bride'"
              @click="store.setSide(store.currentSide === 'groom' ? 'bride' : 'groom')"
              title="點擊切換"
            >
              {{ store.currentSide === 'groom' ? '🤵 男方' : '👰 女方' }}
              <span class="badge-switch">切換</span>
            </button>
            <button class="btn-ghost import-btn" @click="showImport = true">
              ＋ 匯入名單
            </button>
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
import { ref } from 'vue'
import { useGuestsStore } from './stores/guests'
import SideSelect from './components/SideSelect.vue'
import GuestList from './components/GuestList.vue'
import ImportModal from './components/ImportModal.vue'

const store = useGuestsStore()
const showImport = ref(false)
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
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.35rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem; font-weight: 700;
  border: none; cursor: pointer;
  transition: opacity 0.15s;
}
.side-badge:hover { opacity: 0.85; }
.badge-groom { background: #2980b9; color: #fff; }
.badge-bride { background: #8e44ad; color: #fff; }
.badge-switch {
  font-size: 0.7rem; font-weight: 400;
  opacity: 0.8;
  border-left: 1px solid rgba(255,255,255,0.4);
  padding-left: 0.4rem;
  margin-left: 0.1rem;
}

.import-btn {
  background: rgba(255,255,255,0.15);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.35);
  font-size: 0.85rem;
  padding: 0.4rem 0.9rem;
  white-space: nowrap;
}
.import-btn:hover { background: rgba(255,255,255,0.25); }

.app-main {
  flex: 1;
  padding: 1.2rem;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
}
</style>
