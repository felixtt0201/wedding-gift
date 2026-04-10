<template>
  <div class="app">
    <header class="app-header">
      <div class="header-inner">
        <div class="app-title">
          <span class="title-icon">🎊</span>
          <span>婚禮賓客管理</span>
        </div>
        <button class="btn-ghost import-btn" @click="showImport = true">
          ＋ 匯入名單
        </button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGuestsStore } from './stores/guests'
import GuestList from './components/GuestList.vue'
import ImportModal from './components/ImportModal.vue'

const store = useGuestsStore()
const showImport = ref(false)

onMounted(() => store.loadAll())
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
}
.app-title {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 1.1rem; font-weight: 700;
}
.title-icon { font-size: 1.3rem; }

.import-btn {
  background: rgba(255,255,255,0.15);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.35);
  font-size: 0.85rem;
  padding: 0.4rem 0.9rem;
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
