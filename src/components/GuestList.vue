<template>
  <div class="guest-list">
    <!-- 新增賓客 Modal -->
    <AddGuestModal v-if="showAddModal" @close="showAddModal = false" />

    <!-- 統計卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">賓客總數</div>
        <div class="stat-value">{{ store.allGuests.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">總禮金</div>
        <div class="stat-value money">{{ formatMoney(store.totalGiftMoney) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">禮餅進度</div>
        <div class="stat-value cake">
          {{ store.cakeStats.received }} / {{ store.cakeStats.total }}
        </div>
      </div>
    </div>

    <!-- 篩選列 -->
    <div class="filter-row">
      <div class="filter-name-wrap">
        <input
          type="text"
          v-model="filterName"
          placeholder="搜尋姓名…"
          class="filter-input"
        />
        <button v-if="filterName" class="filter-clear-btn" @click="filterName = ''">✕</button>
      </div>
      <select v-model="filterTable" class="filter-select">
        <option value="">全部桌號</option>
        <option v-for="t in tables" :key="t" :value="t">第 {{ t }} 桌</option>
      </select>
      <select v-model="filterCake" class="filter-select">
        <option value="">全部禮餅</option>
        <option value="need">需要禮餅</option>
        <option value="received">已領禮餅</option>
        <option value="pending">未領禮餅</option>
      </select>
      <select v-model="filterAbsent" class="filter-select">
        <option value="">全部出席</option>
        <option value="absent">未出席</option>
        <option value="attended">已出席</option>
      </select>
    </div>

    <!-- 工具列 -->
    <div class="toolbar">
      <span class="result-count">共 {{ filtered.length }} 位賓客</span>
      <div class="toolbar-btns">
        <button class="btn-danger btn-clear" @click="clearAll">刪除全部賓客</button>
        <button class="btn-primary btn-add" @click="showAddModal = true">＋ 新增賓客</button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th @click="setSort('name')">姓名 <SortIcon field="name" /></th>
            <th @click="setSort('tableNumber')">桌號 <SortIcon field="tableNumber" /></th>
            <th @click="setSort('giftMoney')">禮金 <SortIcon field="giftMoney" /></th>
            <th @click="setSort('needsCake')">需要禮餅 <SortIcon field="needsCake" /></th>
            <th @click="setSort('cakeReceived')">禮餅狀態 <SortIcon field="cakeReceived" /></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!filtered.length">
            <td colspan="6" class="empty-row">沒有符合的賓客</td>
          </tr>
          <tr v-for="g in filtered" :key="g.id" :class="{ 'row-received': g.cakeReceived, 'row-absent': g.absent }">
            <td class="name-cell">
              {{ g.name }}
              <span v-if="g.absent" class="tag tag-sm tag-absent">未出席</span>
            </td>
            <td class="center">{{ g.tableNumber || '—' }}</td>
            <td class="center money-cell">
              <span v-if="!editing[g.id]" class="money-display" @click="startEdit(g)">
                {{ formatMoney(g.giftMoney) }}
              </span>
              <input
                v-else
                type="number"
                v-model.number="editValues[g.id]"
                class="inline-edit"
                @blur="commitEdit(g)"
                @keydown.enter="commitEdit(g)"
                @keydown.escape="cancelEdit(g)"
                :ref="el => { if (el) el.focus() }"
                min="0"
              />
            </td>
            <td class="center">
              <span class="tag tag-sm" :class="g.needsCake ? 'tag-yes' : 'tag-no'">
                {{ g.needsCake ? '需要' : '不需要' }}
              </span>
            </td>
            <td class="center">
              <template v-if="g.needsCake">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    :checked="g.cakeReceived"
                    @change="toggleCake(g)"
                  />
                  <span :class="g.cakeReceived ? 'tag tag-sm tag-done' : 'tag tag-sm tag-no'">
                    {{ g.cakeReceived ? '已領' : '未領' }}
                  </span>
                </label>
              </template>
              <span v-else class="tag tag-sm tag-done tag-readonly">已領過</span>
            </td>
            <td class="center">
              <button class="btn-danger btn-sm" @click="remove(g.id)">刪除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGuestsStore } from '../stores/guests'
import AddGuestModal from './AddGuestModal.vue'

const store = useGuestsStore()
const showAddModal = ref(false)

const filterName = ref('')
const filterTable = ref('')
const filterCake = ref('')
const filterAbsent = ref('')
const sortField = ref('name')
const sortAsc = ref(true)
const editing = ref({})
const editValues = ref({})

const tables = computed(() => {
  const set = new Set(store.allGuests.map(g => g.tableNumber).filter(Boolean))
  return [...set].sort()
})

const filtered = computed(() => {
  let list = store.allGuests
  if (filterName.value) {
    const q = filterName.value.toLowerCase()
    list = list.filter(g => g.name.toLowerCase().includes(q))
  }
  if (filterTable.value) {
    list = list.filter(g => g.tableNumber === filterTable.value)
  }
  if (filterCake.value === 'need') list = list.filter(g => g.needsCake)
  else if (filterCake.value === 'received') list = list.filter(g => g.needsCake && g.cakeReceived)
  else if (filterCake.value === 'pending') list = list.filter(g => g.needsCake && !g.cakeReceived)

  if (filterAbsent.value === 'absent') list = list.filter(g => g.absent)
  else if (filterAbsent.value === 'attended') list = list.filter(g => !g.absent)

  return [...list].sort((a, b) => {
    const av = a[sortField.value] ?? ''
    const bv = b[sortField.value] ?? ''
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortAsc.value ? cmp : -cmp
  })
})

function setSort(field) {
  if (sortField.value === field) sortAsc.value = !sortAsc.value
  else { sortField.value = field; sortAsc.value = true }
}

function formatMoney(v) {
  if (!v) return '$0'
  return '$' + Number(v).toLocaleString()
}

function startEdit(g) {
  editing.value[g.id] = true
  editValues.value[g.id] = g.giftMoney || 0
}

async function commitEdit(g) {
  if (!editing.value[g.id]) return
  editing.value[g.id] = false
  const newVal = editValues.value[g.id] || 0
  if (newVal !== g.giftMoney) {
    await store.saveGuest(g.id, { giftMoney: newVal })
  }
}

function cancelEdit(g) {
  editing.value[g.id] = false
}

async function toggleCake(g) {
  await store.saveGuest(g.id, { cakeReceived: !g.cakeReceived })
}

async function remove(id) {
  if (!confirm('確定要刪除這位賓客嗎？')) return
  await store.removeGuest(id)
}

async function clearAll() {
  const count = store.allGuests.length
  if (!count) return
  if (!confirm(`確定要刪除全部 ${count} 位賓客嗎？此操作無法復原。`)) return
  await store.clearAllGuests()
}

const SortIcon = {
  props: ['field'],
  setup(props) {
    return () => {
      const active = sortField.value === props.field
      const icon = active ? (sortAsc.value ? ' ▲' : ' ▼') : ' ⇅'
      return h('span', { style: 'font-size:0.75rem; opacity: ' + (active ? 1 : 0.4) }, icon)
    }
  }
}
import { h } from 'vue'
</script>

<style scoped>
.guest-list { display: flex; flex-direction: column; gap: 1rem; }

.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.8rem; }
.stat-card {
  background: #fff; border-radius: var(--radius);
  border: 1px solid var(--border); padding: 0.9rem 1rem;
  text-align: center;
}
.stat-label { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.3rem; }
.stat-value { font-size: 1.4rem; font-weight: 700; color: var(--primary-dark); }
.stat-value.money { color: var(--gold); }
.stat-value.cake { color: var(--success); }

.filter-row {
  display: flex; flex-wrap: wrap; gap: 0.6rem;
}
.filter-name-wrap {
  position: relative; display: flex; align-items: center; flex: 1; min-width: 140px;
}
.filter-input { flex: 1; min-width: 0; padding-right: 2.2rem; }
.filter-clear-btn {
  position: absolute; right: 0.5rem;
  background: none; border: none; padding: 0.2rem 0.4rem;
  color: var(--text-muted); font-size: 0.85rem; border-radius: 50%;
  line-height: 1;
}
.filter-clear-btn:hover { background: #eee; color: var(--text); }
.filter-select { flex: 1; min-width: 120px; }

.table-wrap {
  overflow-x: auto;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: #fff;
}
table {
  width: 100%; border-collapse: collapse;
  font-size: 0.9rem;
}
th {
  background: #fdf3e7; padding: 0.7rem 0.8rem;
  text-align: left; font-size: 0.82rem; font-weight: 700;
  color: var(--text-muted); cursor: pointer; user-select: none;
  border-bottom: 2px solid var(--border);
  white-space: nowrap;
}
th:hover { background: #fbe8d0; }
td {
  padding: 0.7rem 0.8rem;
  border-bottom: 1px solid #f5ebe0;
  vertical-align: middle;
}
tr:last-child td { border-bottom: none; }
tr:hover td { background: #fef9f2; }
.row-received td { background: #fffdf0; }

.center { text-align: center; }
.name-cell { font-weight: 600; }
.money-cell { min-width: 90px; }
.money-display { cursor: pointer; color: #5d4e37; font-weight: 600; }
.money-display:hover { text-decoration: underline; }

.inline-edit {
  width: 90px; text-align: center; padding: 0.3rem 0.5rem;
  font-size: 0.9rem;
}

.checkbox-label {
  display: flex; align-items: center; gap: 0.4rem; cursor: pointer; justify-content: center;
}
.checkbox-label input[type="checkbox"] {
  width: 16px; height: 16px; cursor: pointer; accent-color: var(--gold);
}

.text-muted { color: var(--text-muted); }

.btn-sm { padding: 0.25rem 0.6rem; font-size: 0.78rem; }

.empty-row { text-align: center; color: var(--text-muted); padding: 2rem; }

.tag-sm { font-size: 0.72rem; padding: 0.1rem 0.45rem; }
.tag-absent { background: #fdecea; color: var(--error); margin-left: 0.4rem; }
.tag-readonly { opacity: 0.55; cursor: default; }

.row-absent td { color: var(--text-muted); }
.row-absent .name-cell { color: var(--text); }

.toolbar {
  display: flex; align-items: center; justify-content: space-between;
}
.toolbar-btns { display: flex; gap: 0.5rem; }
.result-count { font-size: 0.82rem; color: var(--text-muted); }
.btn-add { font-size: 0.9rem; padding: 0.5rem 1rem; }
.btn-clear { font-size: 0.9rem; padding: 0.5rem 1rem; }

@media (max-width: 600px) {
  .stat-value { font-size: 1.1rem; }
  .filter-select { min-width: 100px; }
  .toolbar { flex-direction: column; align-items: flex-start; gap: 0.4rem; }
  .toolbar-btns { width: 100%; justify-content: flex-end; }
  .btn-add, .btn-clear { font-size: 0.82rem; padding: 0.4rem 0.75rem; }
}
</style>
