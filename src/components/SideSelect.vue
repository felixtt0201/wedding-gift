<template>
  <div class="side-select">
    <div class="side-card">
      <div class="side-title">
        <span class="title-icon">🎊</span>
        <span>婚禮賓客管理</span>
      </div>
      <p class="side-subtitle">請選擇您負責的桌次</p>
      <div class="side-btns">
        <button class="side-btn groom-btn" @click="$emit('select', 'groom')">
          <span class="side-btn-icon">🤵</span>
          <span class="side-btn-label">男方</span>
        </button>
        <button class="side-btn bride-btn" @click="$emit('select', 'bride')">
          <span class="side-btn-icon">👰</span>
          <span class="side-btn-label">女方</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['select'])
</script>

<style scoped>
.side-select {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 1.5rem;
}

.side-card {
  background: #fff;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 360px;
  text-align: center;
}

.side-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 0.7rem;
}
.title-icon { font-size: 1.5rem; }

.side-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

.side-btns {
  display: flex;
  gap: 1rem;
}

.side-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 1.5rem 1rem;
  border-radius: var(--radius);
  border: 2px solid var(--border);
  background: #fdf8f0;
  transition: all 0.15s;
}
.side-btn:hover {
  border-color: var(--primary);
  background: #fef3ee;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(192, 57, 43, 0.15);
}
.side-btn-icon { font-size: 2.2rem; }
.side-btn-label { font-size: 1.1rem; font-weight: 700; color: var(--primary-dark); }
</style>
