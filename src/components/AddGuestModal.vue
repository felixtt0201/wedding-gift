<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>手動新增賓客</h2>
        <button class="btn-ghost close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- 姓名 -->
        <div class="field-group">
          <label class="field-label">姓名 <span class="required">*</span></label>
          <input
            ref="nameInputRef"
            type="text"
            v-model.trim="form.name"
            placeholder="輸入賓客姓名"
            class="text-input"
            autocomplete="off"
          />
        </div>

        <!-- 禮金 -->
        <div class="field-group">
          <label class="field-label">禮金</label>
          <div class="money-input">
            <button class="btn-ghost step-btn" @click="adjustMoney(-100)">−</button>
            <input
              type="number"
              v-model.number="form.giftMoney"
              min="0"
              step="100"
              placeholder="0"
            />
            <button class="btn-ghost step-btn" @click="adjustMoney(100)">+</button>
          </div>
        </div>

        <!-- 桌號 -->
        <div class="field-group">
          <label class="field-label">桌號</label>
          <input
            type="text"
            v-model.trim="form.tableNumber"
            placeholder="例：A1、3"
            class="text-input"
            autocomplete="off"
          />
        </div>

        <!-- 未出席 -->
        <div class="field-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.absent" />
            <span class="checkbox-text" :class="{ absent: form.absent }">
              未出席（禮到人不到）
            </span>
          </label>
        </div>

        <!-- 需要禮餅 -->
        <div class="field-group cake-row">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.needsCake" />
            <span class="checkbox-text" :class="{ active: form.needsCake }">
              需要禮餅
            </span>
          </label>
        </div>
      </div>

      <div class="modal-footer">
        <div class="kbd-hints">
          <span class="kbd-hint"><kbd>Enter</kbd> 儲存</span>
          <span class="kbd-hint"><kbd>Esc</kbd> 取消</span>
        </div>
        <div class="footer-btns">
          <button class="btn-ghost" @click="$emit('close')">取消</button>
          <button
            class="btn-primary"
            :disabled="!form.name || saving"
            @click="save"
          >
            {{ saving ? '新增中…' : '新增賓客' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGuestsStore } from '../stores/guests'

const emit = defineEmits(['close'])
const store = useGuestsStore()

const nameInputRef = ref(null)
const saving = ref(false)
const form = ref({
  name: '',
  giftMoney: 0,
  tableNumber: '',
  absent: false,
  needsCake: false,
  cakeReceived: false
})

function adjustMoney(delta) {
  form.value.giftMoney = Math.max(0, (form.value.giftMoney || 0) + delta)
}

async function save() {
  if (!form.value.name || saving.value) return
  saving.value = true
  await store.addGuest({ ...form.value })
  saving.value = false
  emit('close')
}

function onKeydown(e) {
  if (e.key === 'Escape') {
    emit('close')
  } else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
    e.preventDefault()
    save()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  nameInputRef.value?.focus()
})
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.2rem;
}
.modal-header h2 { font-size: 1.15rem; font-weight: 700; }
.close-btn { padding: 0.3rem 0.6rem; }

.modal-body { display: flex; flex-direction: column; gap: 1rem; }

.field-group { display: flex; flex-direction: column; gap: 0.4rem; }
.field-label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
.required { color: var(--error); }
.optional { font-weight: 400; font-size: 0.78rem; }

.text-input {
  font-size: 1rem;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  border: 2px solid var(--border);
  background: #fff;
  width: 100%;
  box-sizing: border-box;
}
.text-input:focus { border-color: var(--primary); outline: none; }

.money-input {
  display: flex; align-items: center; gap: 0.4rem;
}
.money-input input { text-align: center; font-size: 1.1rem; font-weight: 600; }
.step-btn { padding: 0.4rem 0.8rem; font-size: 1.1rem; flex-shrink: 0; width: 40px; }

.cake-row { flex-direction: row; align-items: center; }
.checkbox-label {
  display: flex; align-items: center; gap: 0.5rem; cursor: pointer;
}
.checkbox-label input[type="checkbox"] {
  width: 20px; height: 20px; cursor: pointer; accent-color: var(--gold);
}
.checkbox-text { font-weight: 600; color: var(--text-muted); }
.checkbox-text.active { color: var(--gold); }
.checkbox-text.absent { color: var(--primary); }

.modal-footer {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 1.4rem; padding-top: 1rem;
  border-top: 1px solid var(--border);
}
.footer-btns { display: flex; gap: 0.6rem; }

.kbd-hints { display: flex; gap: 0.8rem; }
.kbd-hint { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.25rem; }
kbd {
  background: #f0f0f0; border: 1px solid #ccc; border-bottom-width: 2px;
  border-radius: 4px; padding: 0.1rem 0.4rem;
  font-family: monospace; font-size: 0.72rem; color: #444;
}
</style>
