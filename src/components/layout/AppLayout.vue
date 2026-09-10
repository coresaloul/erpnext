<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main View Area (with margin for fixed sidebar) -->
    <div class="flex-1 flex flex-col transition-all duration-300 ml-64 min-w-0">
      <AppHeader :title="currentTitle" :subtitle="currentSubtitle" />

      <main class="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
        <router-view />
      </main>

      <footer class="py-4 px-6 border-t border-slate-200/80 bg-white/50 text-center text-xs text-slate-400">
        Yemen Red Crescent Society &bull; ERPNext Modern Operations Hub &bull; Connected to http://13.140.163.199
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

const route = useRoute()
const inventoryStore = useInventoryStore()

const currentTitle = computed(() => {
  return route.meta?.title || 'Operations & Inventory'
})

const currentSubtitle = computed(() => {
  return route.meta?.subtitle || ''
})

onMounted(() => {
  inventoryStore.loadAll()
})
</script>
