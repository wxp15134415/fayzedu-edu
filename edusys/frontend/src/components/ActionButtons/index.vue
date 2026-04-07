<template>
  <div class="action-buttons">
    <el-button
      v-for="action in filteredActions"
      :key="action.key"
      :type="action.type"
      :size="size"
      :link="!action.type"
      :disabled="action.disabled"
      @click="handleClick(action)"
    >
      <el-icon v-if="action.icon"><component :is="action.icon" /></el-icon>
      {{ action.label }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Action {
  key: string
  label: string
  icon?: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | ''
  disabled?: boolean
  show?: boolean
  click?: () => void
}

interface Props {
  actions: Action[]
  size?: 'default' | 'small' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  actions: () => [],
  size: 'default'
})

const emit = defineEmits<{
  action: [key: string]
}>()

const filteredActions = computed(() => {
  return props.actions.filter(action => {
    if (action.show === false) return false
    return true
  })
})

const handleClick = (action: Action) => {
  if (action.disabled) return
  if (action.click) {
    action.click()
  }
  emit('action', action.key)
}
</script>

<style scoped>
.action-buttons {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: var(--spacing-xs);
}

.action-buttons .el-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
}

@media (min-width: 1920px) {
  .action-buttons .el-button {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-base);
  }
}

@media (max-width: 768px) {
  .action-buttons {
    gap: 2px;
  }

  .action-buttons .el-button {
    padding: 2px 4px;
    font-size: var(--font-size-xs);
  }
}
</style>