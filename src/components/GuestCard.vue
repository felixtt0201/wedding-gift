<template>
  <div class="card guest-card">
    <div class="guest-card__header">
      <div>
        <div class="guest-card__name">{{ guest.name }}</div>
        <div class="guest-card__table">
          <span class="table-icon">🪑</span> 第 {{ guest.tableNumber }} 桌
        </div>
      </div>
      <button class="btn-ghost close-btn" @click="$emit('close')">✕</button>
    </div>

    <div class="guest-card__body">
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

      <!-- 禮餅 -->
      <div class="field-group cake-row">
        <div class="cake-info">
          <span class="field-label">需要禮餅</span>
          <span class="tag" :class="guest.needsCake ? 'tag-yes' : 'tag-no'">
            {{ guest.needsCake ? '需要' : '不需要' }}
          </span>
        </div>
        <div v-if="guest.needsCake" class="cake-check">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.cakeReceived" />
            <span class="checkbox-text" :class="{ done: form.cakeReceived }">
              {{ form.cakeReceived ? '✓ 禮餅已領' : '禮餅未領' }}
            </span>
          </label>
        </div>
      </div>
    </div>

    <div class="guest-card__footer">
      <button class="btn-ghost" @click="$emit('close')">取消</button>
      <button class="btn-primary" :disabled="saving" @click="save">
        {{ saving ? '儲存中…' : '儲存' }}
      </button>
    </div>

    <div class="kbd-hints">
      <span class="kbd-hint"><kbd>Enter</kbd> 儲存</span>
      <span class="kbd-hint"><kbd>Esc</kbd> 取消</span>
      <span v-if="guest.needsCake" class="kbd-hint"><kbd>Space</kbd> 切換禮餅</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({ guest: Object })
const emit = defineEmits(['save', 'close'])

const saving = ref(false)
const form = ref({ giftMoney: 0, cakeReceived: false })

watch(() => props.guest, g => {
  if (g) form.value = { giftMoney: g.giftMoney || 0, cakeReceived: !!g.cakeReceived }
}, { immediate: true })

function adjustMoney(delta) {
  form.value.giftMoney = Math.max(0, (form.value.giftMoney || 0) + delta)
}

async function save() {
  if (saving.value) return
  saving.value = true
  await emit('save', props.guest.id, { ...form.value })
  saving.value = false
}

function onKeydown(e) {
  // 如果焦點在輸入框內，不攔截
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
  if (e.key === 'Enter') {
    e.preventDefault()
    save()
  } else if (e.key === 'Escape') {
    emit('close')
  } else if (e.key === ' ') {
    if (props.guest?.needsCake) {
      e.preventDefault()
      form.value.cakeReceived = !form.value.cakeReceived
    }
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.guest-card { max-width: 480px; width: 100%; }

.guest-card__header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 1.2rem;
}
.guest-card__name { font-size: 1.4rem; font-weight: 700; color: var(--primary-dark); }
.guest-card__table { font-size: 0.9rem; color: var(--text-muted); margin-top: 0.2rem; }
.table-icon { margin-right: 4px; }
.close-btn { padding: 0.3rem 0.6rem; }

.guest-card__body { display: flex; flex-direction: column; gap: 1rem; }

.field-group { display: flex; flex-direction: column; gap: 0.4rem; }
.field-label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }

.money-input {
  display: flex; align-items: center; gap: 0.4rem;
}
.money-input input { text-align: center; font-size: 1.1rem; font-weight: 600; }
.step-btn { padding: 0.4rem 0.8rem; font-size: 1.1rem; flex-shrink: 0; width: 40px; }

.cake-row { gap: 0.6rem; }
.cake-info { display: flex; align-items: center; gap: 0.6rem; }

.checkbox-label {
  display: flex; align-items: center; gap: 0.5rem; cursor: pointer;
}
.checkbox-label input[type="checkbox"] {
  width: 20px; height: 20px; cursor: pointer; accent-color: var(--gold);
}
.checkbox-text { font-weight: 600; color: var(--text-muted); }
.checkbox-text.done { color: var(--gold); }

.kbd-hints {
  display: flex; gap: 0.8rem; justify-content: center;
  margin-top: 0.8rem; flex-wrap: wrap;
}
.kbd-hint { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.25rem; }
kbd {
  background: #f0f0f0; border: 1px solid #ccc; border-bottom-width: 2px;
  border-radius: 4px; padding: 0.1rem 0.4rem;
  font-family: monospace; font-size: 0.72rem; color: #444;
}

.guest-card__footer {
  display: flex; justify-content: flex-end; gap: 0.6rem;
  margin-top: 1.4rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}
</style>
