<template>
  <el-card shadow="hover" :class="['stat-card', { 'stat-card-clickable': clickable }]" @click="handleClick">
    <div class="stat-content">
      <div class="stat-left">
        <div class="stat-icon-wrap" :style="{ background: gradient }">
          <el-icon><component :is="icon" /></el-icon>
        </div>
      </div>
      <div class="stat-right">
        <div class="stat-number">{{ displayValue }}</div>
        <div class="stat-label">{{ label }}</div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value?: number | string
  label: string
  icon?: string
  gradient?: string
  prefix?: string
  suffix?: string
  clickable?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  icon: 'DataLine',
  gradient: 'linear-gradient(135deg, #58c0fc 0%, #bd45fb 100%)',
  prefix: '',
  suffix: '',
  clickable: false,
  loading: false
})

const emit = defineEmits<{
  click: []
}>()

const displayValue = computed(() => {
  if (props.loading) return '-'
  const val = typeof props.value === 'number' ? props.value.toLocaleString() : props.value
  return `${props.prefix}${val}${props.suffix}`
})

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style scoped>
.stat-card {
  cursor: default;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.stat-card-clickable {
  cursor: pointer;
}

.stat-card-clickable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
}

.stat-left {
  flex-shrink: 0;
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-size: 22px;
}

.stat-right {
  flex: 1;
  min-width: 0;
}

.stat-number {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

@media (max-width: 768px) {
  .stat-icon-wrap {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .stat-number {
    font-size: var(--font-size-lg);
  }

  .stat-label {
    font-size: var(--font-size-xs);
  }
}
</style>
