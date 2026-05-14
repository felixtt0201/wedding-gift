<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>匯入賓客名單</h2>
        <button class="btn-ghost close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- 步驟一：全部賓客 -->
        <div class="step-block">
          <div class="step-label">
            <span class="step-num">1</span>
            全部賓客名單
            <span class="step-hint"
              >格式：名字 或 名字,桌號（每行一筆，預設不需要禮餅）</span
            >
          </div>
          <div
            class="drop-zone"
            :class="{ dragging: dragging1, done: guestRows.length }"
            @dragover.prevent="dragging1 = true"
            @dragleave="dragging1 = false"
            @drop.prevent="(e) => onDrop(e, 'guest')"
            @click="fileInput1.click()"
          >
            <span v-if="!guestRows.length">
              <div class="drop-icon">📄</div>
              <div>拖曳或點擊選擇全部賓客 CSV</div>
            </span>
            <span v-else class="parsed-info"
              >✓ {{ guestRows.length }} 位賓客</span
            >
          </div>
          <input
            ref="fileInput1"
            type="file"
            accept=".csv,.txt"
            style="display: none"
            @change="(e) => onFile(e, 'guest')"
          />
        </div>

        <!-- 步驟二：禮餅名單 -->
        <div class="step-block">
          <div class="step-label">
            <span class="step-num">2</span>
            需要禮餅名單
            <span class="step-hint"
              >每行一個名字，與步驟一重複的人標記需要禮餅</span
            >
          </div>
          <div
            class="drop-zone"
            :class="{
              dragging: dragging2,
              done: cakeNames.length,
              disabled: !guestRows.length,
            }"
            @dragover.prevent="if (guestRows.length) dragging2 = true;"
            @dragleave="dragging2 = false"
            @drop.prevent="
              (e) => {
                if (guestRows.length) onDrop(e, 'cake');
              }
            "
            @click="if (guestRows.length) fileInput2.click();"
          >
            <span v-if="!cakeNames.length">
              <div class="drop-icon">🎂</div>
              <div>
                {{
                  guestRows.length
                    ? "拖曳或點擊選擇禮餅名單 CSV"
                    : "請先上傳步驟一"
                }}
              </div>
            </span>
            <span v-else class="parsed-info"
              >✓ {{ cakeNames.length }} 位需要禮餅</span
            >
          </div>
          <input
            ref="fileInput2"
            type="file"
            accept=".csv,.txt"
            style="display: none"
            @change="(e) => onFile(e, 'cake')"
          />
        </div>

        <!-- 錯誤訊息 -->
        <div v-if="parseError" class="parse-error">{{ parseError }}</div>

        <!-- 預覽 -->
        <div v-if="mergedGuests.length" class="preview">
          <div class="preview-title">
            預覽（前 5 筆）
            <span class="preview-stats">
              共 {{ mergedGuests.length }} 位・需要禮餅
              {{ mergedGuests.filter((g) => g.needsCake).length }} 位
            </span>
          </div>
          <table class="preview-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>桌號</th>
                <th>需要禮餅</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(g, i) in mergedGuests.slice(0, 5)" :key="i">
                <td>{{ g.name }}</td>
                <td>{{ g.tableNumber || '—' }}</td>
                <td>
                  <span
                    class="tag tag-sm"
                    :class="g.needsCake ? 'tag-yes' : 'tag-no'"
                  >
                    {{ g.needsCake ? "是" : "否" }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="mergedGuests.length > 5" class="preview-more">
            … 還有 {{ mergedGuests.length - 5 }} 筆
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-ghost" @click="$emit('close')">取消</button>
        <button
          class="btn-primary"
          :disabled="!mergedGuests.length || importing"
          @click="doImport"
        >
          {{ importing ? "匯入中…" : "確認匯入" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useGuestsStore } from "../stores/guests";
import { parseNameList } from "../utils/csvParser";

const emit = defineEmits(["close"]);
const store = useGuestsStore();

const dragging1 = ref(false);
const dragging2 = ref(false);
const fileInput1 = ref(null);
const fileInput2 = ref(null);
const guestRows = ref([]); // [{ name, tableNumber }]
const cakeNames = ref([]);
const parseError = ref("");
const importing = ref(false);

const mergedGuests = computed(() => {
  if (!guestRows.value.length) return [];
  const cakeSet = new Set(cakeNames.value);
  const seen = new Set();
  const result = [];
  for (const { name, tableNumber } of guestRows.value) {
    if (seen.has(name)) continue;
    seen.add(name);
    result.push({
      name,
      tableNumber: tableNumber || '',
      needsCake: cakeSet.has(name),
      cakeReceived: false,
      giftMoney: 0,
      absent: false,
    });
  }
  return result;
});

async function processFile(file, type) {
  parseError.value = "";
  try {
    const rows = await parseNameList(file);
    if (type === "guest") guestRows.value = rows;
    else cakeNames.value = rows.map(r => r.name);
  } catch (e) {
    parseError.value = e.message;
  }
}

function onFile(e, type) {
  const f = e.target.files[0];
  if (f) processFile(f, type);
}

function onDrop(e, type) {
  if (type === "guest") dragging1.value = false;
  else dragging2.value = false;
  const f = e.dataTransfer.files[0];
  if (f) processFile(f, type);
}

async function doImport() {
  if (!mergedGuests.value.length) return;
  importing.value = true;
  await store.importGuests(mergedGuests.value);
  importing.value = false;
  emit("close");
}
</script>

<style scoped>
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
}
.modal-header h2 {
  font-size: 1.15rem;
  font-weight: 700;
}
.close-btn {
  padding: 0.3rem 0.6rem;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text);
}
.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  flex-shrink: 0;
}
.step-hint {
  font-weight: 400;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.drop-zone {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  padding: 1.2rem;
  text-align: center;
  cursor: pointer;
  color: var(--text-muted);
  transition:
    border-color 0.15s,
    background 0.15s;
  font-size: 0.88rem;
}
.drop-zone:hover,
.drop-zone.dragging {
  border-color: var(--primary);
  background: #fef3ee;
}
.drop-zone.done {
  border-color: var(--success);
  background: #f0fdf4;
  border-style: solid;
}
.drop-zone.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.drop-zone.disabled:hover {
  border-color: var(--border);
  background: transparent;
}
.drop-icon {
  font-size: 1.5rem;
  margin-bottom: 0.3rem;
}
.parsed-info {
  font-weight: 600;
  color: var(--success);
  font-size: 0.95rem;
}

.parse-error {
  background: #fdecea;
  color: var(--error);
  border-radius: 8px;
  padding: 0.7rem 1rem;
  font-size: 0.85rem;
}

.preview-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.preview-stats {
  font-weight: 400;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.preview-table th {
  background: #fdf3e7;
  padding: 0.5rem 0.7rem;
  font-weight: 700;
  font-size: 0.78rem;
  text-align: left;
}
.preview-table td {
  padding: 0.45rem 0.7rem;
  border-top: 1px solid #f0e8d8;
}
.preview-more {
  font-size: 0.78rem;
  color: var(--text-muted);
  text-align: center;
  margin-top: 0.4rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1.4rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}
</style>
