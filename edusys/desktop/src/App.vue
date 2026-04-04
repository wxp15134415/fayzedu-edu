<template>
  <router-view />
  <OfflineIndicator />
</template>

<script setup lang="ts">
import OfflineIndicator from '@/components/OfflineIndicator.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>