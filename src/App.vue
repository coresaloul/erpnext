<template>
  <div id="app" class="min-h-screen bg-slate-50 font-sans text-slate-800">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  // Check active session on initial load
  await authStore.checkAuth()
})
</script>
