<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main View Area (with right margin in RTL for fixed sidebar) -->
    <div 
      class="flex-1 flex flex-col transition-all duration-300 min-w-0"
      :class="[uiStore.isSidebarCollapsed ? 'md:mr-20' : 'md:mr-64']"
    >
      <AppHeader :title="currentTitle" :subtitle="currentSubtitle" />

      <main class="flex-1 p-5 md:p-8 max-w-7xl w-full mx-auto">
        <router-view />
      </main>

      <footer class="py-4 px-6 border-t border-slate-200/80 bg-white/70 text-center text-xs text-slate-500 font-medium">
        جمعية الهلال الأحمر اليمني (YRCS) &bull; منصة إدارة العمليات والطلبات اللوجستية &bull; النظام متصل بـ ERPNext
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import { useUiStore } from '@/stores/ui'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

const route = useRoute()
const inventoryStore = useInventoryStore()
const uiStore = useUiStore()

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
