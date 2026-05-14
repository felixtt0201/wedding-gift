<template>
  <div class="search-panel">
    <div class="search-bar-wrap">
      <div class="search-input-wrap">
        <input
          ref="inputRef"
          type="text"
          v-model="query"
          placeholder="輸入賓客姓名搜尋…"
          @input="onInput"
          @keydown.escape="clearAll"
          autocomplete="off"
          class="search-input"
        />
        <button v-if="query" class="clear-btn" @click="clearAll">✕</button>
      </div>
      <button class="add-btn btn-ghost" @click="showAddModal = true" title="手動新增賓客">＋</button>
    </div>

    <AddGuestModal v-if="showAddModal" @close="onAddModalClose" />

    <!-- 搜尋結果 -->
    <div v-if="store.searchResults.length && !store.currentGuest" class="result-list">
      <div
        v-for="g in store.searchResults.slice(0, 5)"
        :key="g.id"
        class="result-item"
        @click="select(g)"
      >
        <div class="result-name">{{ g.name }}</div>
        <div class="result-meta">
          <span v-if="g.tableNumber">第 {{ g.tableNumber }} 桌</span>
          <span class="tag tag-sm" :class="g.needsCake ? 'tag-yes' : 'tag-no'">
            {{ g.needsCake ? '需要禮餅' : '不需要禮餅' }}
          </span>
          <span v-if="g.cakeReceived" class="tag tag-sm tag-done">已領</span>
        </div>
      </div>
    </div>

    <div v-if="query && !store.searchResults.length && !store.currentGuest" class="no-result">
      找不到「{{ query }}」
    </div>

    <!-- 賓客操作卡片 -->
    <div v-if="store.currentGuest" class="card-wrap">
      <GuestCard
        :guest="store.currentGuest"
        @save="onSave"
        @close="clearAll"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGuestsStore } from '../stores/guests'
import GuestCard from './GuestCard.vue'
import AddGuestModal from './AddGuestModal.vue'

const store = useGuestsStore()
const query = ref('')
const inputRef = ref(null)
const showAddModal = ref(false)

let debounceTimer = null
function onInput() {
  clearTimeout(debounceTimer)
  if (!query.value.trim()) {
    store.searchResults = []
    store.currentGuest = null
    return
  }
  debounceTimer = setTimeout(() => store.search(query.value), 250)
}

function select(guest) {
  store.selectGuest(guest)
  query.value = guest.name
}

function clearAll() {
  query.value = ''
  store.clearSelection()
  inputRef.value?.focus()
}

async function onSave(id, data) {
  await store.saveGuest(id, data)
  clearAll()
}

function onAddModalClose() {
  showAddModal.value = false
  inputRef.value?.focus()
}
</script>

<style scoped>
.search-panel { display: flex; flex-direction: column; gap: 1rem; }

.search-bar-wrap {
  display: flex; align-items: center;
  gap: 0.5rem;
}
.search-input-wrap {
  position: relative;
  flex: 1;
  display: flex; align-items: center;
}
.search-input {
  width: 100%;
  font-size: 1.2rem;
  padding: 0.8rem 2.8rem 0.8rem 1rem;
  border-radius: 12px;
  border: 2px solid var(--border);
  background: #fff;
}
.search-input:focus { border-color: var(--primary); }

.clear-btn {
  position: absolute; right: 0.8rem;
  background: none; border: none;
  color: var(--text-muted); font-size: 1rem;
  padding: 0.3rem;
  border-radius: 50%;
}
.clear-btn:hover { background: #eee; }

.add-btn {
  flex-shrink: 0;
  font-size: 1.3rem;
  padding: 0.5rem 0.8rem;
  border-radius: 10px;
  line-height: 1;
}

.result-list {
  background: #fff;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  overflow: hidden;
}
.result-item {
  padding: 0.9rem 1.1rem;
  cursor: pointer;
  border-bottom: 1px solid #f0e8d8;
  transition: background 0.12s;
}
.result-item:last-child { border-bottom: none; }
.result-item:hover { background: #fef9f0; }
.result-name { font-size: 1.05rem; font-weight: 600; margin-bottom: 0.3rem; }
.result-meta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--text-muted); }

.tag-sm { font-size: 0.72rem; padding: 0.1rem 0.45rem; }

.no-result {
  text-align: center;
  color: var(--text-muted);
  padding: 1.5rem;
  background: #fff;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.card-wrap { display: flex; justify-content: center; }
</style>
