<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>匯入賓客名單</h2>
        <button class="btn-ghost close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- CSV 格式說明 -->
        <div class="hint-box">
          <div class="hint-title">CSV 格式範例</div>
          <pre class="hint-code">名稱,桌次,需要禮餅
王大明,A1,是
陳小美,B2,否</pre>
          <div class="hint-note">「需要禮餅」填「是」或「否」</div>
        </div>

        <!-- 上傳區 -->
        <div
          class="drop-zone"
          :class="{ dragging }"
          @dragover.prevent="dragging = true"
          @dragleave="dragging = false"
          @drop.prevent="onDrop"
          @click="fileInput.click()"
        >
          <span v-if="!parsedGuests">
            <div class="drop-icon">📄</div>
            <div>拖曳 CSV 到此，或點擊選擇檔案</div>
          </span>
          <span v-else class="parsed-info">
            已解析 {{ parsedGuests.length }} 位賓客
          </span>
        </div>
        <input ref="fileInput" type="file" accept=".csv" style="display:none" @change="onFile" />

        <!-- 錯誤訊息 -->
        <div v-if="parseError" class="parse-error">{{ parseError }}</div>

        <!-- 預覽 -->
        <div v-if="parsedGuests && parsedGuests.length" class="preview">
          <div class="preview-title">預覽（前 5 筆）</div>
          <table class="preview-table">
            <thead><tr><th>姓名</th><th>桌次</th><th>需要禮餅</th></tr></thead>
            <tbody>
              <tr v-for="(g, i) in parsedGuests.slice(0, 5)" :key="i">
                <td>{{ g.name }}</td>
                <td>{{ g.tableNumber }}</td>
                <td>{{ g.needsCake ? '是' : '否' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="parsedGuests.length > 5" class="preview-more">
            … 還有 {{ parsedGuests.length - 5 }} 筆
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-ghost" @click="$emit('close')">取消</button>
        <button
          class="btn-primary"
          :disabled="!parsedGuests || !parsedGuests.length || importing"
          @click="doImport"
        >
          {{ importing ? '匯入中…' : '確認匯入' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGuestsStore } from '../stores/guests'
import { parseGuestCsv } from '../utils/csvParser'

const emit = defineEmits(['close'])
const store = useGuestsStore()

const dragging = ref(false)
const fileInput = ref(null)
const parsedGuests = ref(null)
const parseError = ref('')
const importing = ref(false)

async function processFile(file) {
  parseError.value = ''
  parsedGuests.value = null
  try {
    parsedGuests.value = await parseGuestCsv(file)
  } catch (e) {
    parseError.value = e.message
  }
}

function onFile(e) {
  const f = e.target.files[0]
  if (f) processFile(f)
}

function onDrop(e) {
  dragging.value = false
  const f = e.dataTransfer.files[0]
  if (f) processFile(f)
}

async function doImport() {
  if (!parsedGuests.value) return
  importing.value = true
  await store.importGuests(parsedGuests.value)
  importing.value = false
  emit('close')
}
</script>

<style scoped>
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.2rem;
}
.modal-header h2 { font-size: 1.15rem; font-weight: 700; }
.close-btn { padding: 0.3rem 0.6rem; }

.modal-body { display: flex; flex-direction: column; gap: 1rem; }

.hint-box {
  background: #f8f4ee; border-radius: 8px; padding: 0.9rem;
  border: 1px solid var(--border);
}
.hint-title { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.4rem; }
.hint-code {
  font-family: monospace; font-size: 0.82rem;
  background: #fff; padding: 0.5rem 0.7rem; border-radius: 6px;
  border: 1px solid #ddd; line-height: 1.6;
}
.hint-note { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.4rem; }

.drop-zone {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: border-color 0.15s, background 0.15s;
}
.drop-zone:hover, .drop-zone.dragging {
  border-color: var(--primary); background: #fef3ee;
}
.drop-icon { font-size: 2rem; margin-bottom: 0.5rem; }
.parsed-info { font-weight: 600; color: var(--success); font-size: 1rem; }

.parse-error {
  background: #fdecea; color: var(--error);
  border-radius: 8px; padding: 0.7rem 1rem;
  font-size: 0.85rem;
}

.preview-title { font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem; }
.preview-table {
  width: 100%; border-collapse: collapse; font-size: 0.85rem;
  border: 1px solid var(--border); border-radius: 8px; overflow: hidden;
}
.preview-table th {
  background: #fdf3e7; padding: 0.5rem 0.7rem;
  font-weight: 700; font-size: 0.78rem; text-align: left;
}
.preview-table td { padding: 0.45rem 0.7rem; border-top: 1px solid #f0e8d8; }
.preview-more { font-size: 0.78rem; color: var(--text-muted); text-align: center; margin-top: 0.4rem; }

.modal-footer {
  display: flex; justify-content: flex-end; gap: 0.6rem;
  margin-top: 1.4rem; padding-top: 1rem;
  border-top: 1px solid var(--border);
}
</style>
