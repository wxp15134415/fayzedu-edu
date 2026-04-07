<template>
  <div class="search-bar" :class="{ 'search-bar-inline': inline }">
    <el-input
      v-model="searchValue"
      :placeholder="placeholder"
      :clearable="clearable"
      :size="size"
      :prefix-icon="Search"
      @keyup.enter="handleSearch"
      @clear="handleClear"
    >
      <template #append v-if="showSearchButton">
        <el-button :icon="Search" @click="handleSearch" />
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

interface Props {
  modelValue?: string
  placeholder?: string
  clearable?: boolean
  size?: 'default' | 'small' | 'large'
  inline?: boolean
  showSearchButton?: boolean
  debounce?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '搜索',
  clearable: true,
  size: 'default',
  inline: true,
  showSearchButton: false,
  debounce: 0
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
  clear: []
}>()

const searchValue = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  searchValue.value = val
})

watch(searchValue, (val) => {
  emit('update:modelValue', val)

  if (props.debounce > 0) {
    // 后续实现防抖
  }
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const handleSearch = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  if (props.debounce > 0) {
    debounceTimer = setTimeout(() => {
      emit('search', searchValue.value)
    }, props.debounce)
  } else {
    emit('search', searchValue.value)
  }
}

const handleClear = () => {
  emit('clear')
}
</script>

<style scoped>
.search-bar {
  width: 100%;
}

.search-bar-inline {
  width: 220px;
}

.search-bar :deep(.el-input__wrapper) {
  box-shadow: none;
  border: 1px solid var(--color-border-base);
}

.search-bar :deep(.el-input__wrapper:hover),
.search-bar :deep(.el-input__wrapper.is-focus) {
  border-color: var(--color-primary);
}

@media (max-width: 768px) {
  .search-bar-inline {
    width: 100%;
  }
}
</style>