<template>
  <div class="admin-view">
    <!-- 統計 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">男方禮金</div>
        <div class="stat-value money">{{ formatMoney(groomTotal) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">女方禮金</div>
        <div class="stat-value money">{{ formatMoney(brideTotal) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">合計禮金</div>
        <div class="stat-value money total">{{ formatMoney(groomTotal + brideTotal) }}</div>
      </div>
    </div>

    <!-- 操作紀錄 -->
    <div class="log-section">
      <div class="log-toolbar">
        <span class="log-title">操作紀錄</span>
        <div class="log-filters">
          <button
            v-for="f in filters"
            :key="f.value"
            class="filter-btn"
            :class="{ active: filterSide === f.value }"
            @click="filterSide = f.value; loadLogs()"
          >{{ f.label }}</button>
        </div>
        <button class="btn-ghost refresh-btn" @click="loadLogs" :disabled="loadingLogs">
          {{ loadingLogs ? '載入中…' : '重新整理' }}
        </button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>時間</th>
              <th>操作方</th>
              <th>動作</th>
              <th>賓客</th>
              <th>詳情</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingLogs">
              <td colspan="5" class="empty-row">載入中…</td>
            </tr>
            <tr v-else-if="!logs.length">
              <td colspan="5" class="empty-row">尚無操作紀錄</td>
            </tr>
            <tr v-for="log in logs" :key="log.id">
              <td class="time-cell">{{ formatTime(log.created_at) }}</td>
              <td class="center">
                <span class="side-tag" :class="log.side === 'groom' ? 'tag-groom' : 'tag-bride'">
                  {{ log.side === 'groom' ? '男方' : '女方' }}
                </span>
              </td>
              <td>
                <span class="action-tag" :class="`action-${log.action}`">{{ log.action }}</span>
              </td>
              <td>{{ log.guest_name || '—' }}</td>
              <td class="detail-cell">{{ formatDetails(log.action, log.details) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLogs } from '../api/logs'
import { getAllGuestsAdmin } from '../api/guests'

const logs = ref([])
const loadingLogs = ref(false)
const filterSide = ref(null)
const groomTotal = ref(0)
const brideTotal = ref(0)

const filters = [
  { label: '全部', value: null },
  { label: '男方', value: 'groom' },
  { label: '女方', value: 'bride' },
]

async function loadLogs() {
  loadingLogs.value = true
  try {
    const [logsData, allGuests] = await Promise.all([
      getLogs(filterSide.value),
      getAllGuestsAdmin(),
    ])
    logs.value = logsData
    groomTotal.value = allGuests.filter(g => g.side === 'groom').reduce((s, g) => s + (g.giftMoney || 0), 0)
    brideTotal.value = allGuests.filter(g => g.side === 'bride').reduce((s, g) => s + (g.giftMoney || 0), 0)
  } finally {
    loadingLogs.value = false
  }
}

onMounted(() => loadLogs())

function formatTime(iso) {
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function formatMoney(v) {
  return '$' + Number(v || 0).toLocaleString()
}

function formatDetails(action, details) {
  if (!details) return '—'
  if (action === '更新禮金') return `$${details.from ?? 0} → $${details.to ?? 0}`
  if (action === '切換禮餅') return details.received ? '已領' : '退回未領'
  if (action === '標記出席') return details.absent ? '標記未出席' : '改為已出席'
  if (action === '新增賓客') {
    const parts = []
    if (details.tableNumber) parts.push(`第${details.tableNumber}桌`)
    if (details.giftMoney) parts.push(`禮金$${details.giftMoney}`)
    if (details.needsCake) parts.push('需禮餅')
    return parts.join('・') || '—'
  }
  if (action === '批次匯入') return `新增${details.count}筆，跳過${details.skipped}筆`
  return '—'
}
</script>

<style scoped>
.admin-view {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
}
.stat-card {
  background: #fff;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 0.9rem 1rem;
  text-align: center;
}
.stat-label { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.3rem; }
.stat-value { font-size: 1.3rem; font-weight: 700; }
.stat-value.money { color: var(--gold); }
.stat-value.total { color: var(--primary-dark); }

.log-section {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.log-toolbar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.log-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin-right: 0.2rem;
}
.log-filters {
  display: flex;
  gap: 0.4rem;
}
.filter-btn {
  padding: 0.3rem 0.8rem;
  font-size: 0.82rem;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: #fff;
  color: var(--text-muted);
}
.filter-btn.active {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
}
.refresh-btn {
  margin-left: auto;
  font-size: 0.82rem;
  padding: 0.3rem 0.8rem;
}

.table-wrap {
  overflow-x: auto;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: #fff;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.87rem;
}
th {
  background: #fdf3e7;
  padding: 0.65rem 0.8rem;
  text-align: left;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-muted);
  border-bottom: 2px solid var(--border);
  white-space: nowrap;
}
td {
  padding: 0.6rem 0.8rem;
  border-bottom: 1px solid #f5ebe0;
  vertical-align: middle;
}
tr:last-child td { border-bottom: none; }
tr:hover td { background: #fef9f2; }

.center { text-align: center; }
.time-cell { font-size: 0.78rem; color: var(--text-muted); white-space: nowrap; }
.detail-cell { color: var(--text-muted); font-size: 0.82rem; }
.empty-row { text-align: center; color: var(--text-muted); padding: 2rem; }

.side-tag {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}
.tag-groom { background: #dbeafe; color: #1d4ed8; }
.tag-bride { background: #f3e8ff; color: #7c3aed; }

.action-tag {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  background: #f3f4f6;
  color: var(--text);
}
.action-新增賓客 { background: #d1fae5; color: #065f46; }
.action-刪除賓客 { background: #fdecea; color: #991b1b; }
.action-更新禮金 { background: #fef9c3; color: #854d0e; }
.action-切換禮餅 { background: #e0e7ff; color: #3730a3; }
.action-批次匯入 { background: #dbeafe; color: #1e40af; }
</style>
