<template>
  <header class="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-6 flex items-center justify-between shadow-xs">
    <!-- Left: Page Title / Breadcrumb -->
    <div class="flex items-center gap-3">
      <div>
        <h1 class="text-base font-bold text-slate-900 tracking-tight">{{ title }}</h1>
        <p v-if="subtitle" class="text-xs text-slate-500">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Right: Search, Refresh, Actions -->
    <div class="flex items-center gap-3">
      <!-- Search Input -->
      <div class="relative hidden sm:block w-64">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input 
          v-model="inventoryStore.searchQuery"
          type="text" 
          placeholder="Search items, codes..."
          class="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-800 placeholder-slate-400"
        />
        <button 
          v-if="inventoryStore.searchQuery" 
          @click="inventoryStore.searchQuery = ''"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Refresh Data Button -->
      <button 
        @click="refreshData"
        :disabled="inventoryStore.loading"
        class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-colors shadow-xs"
        title="Refresh Data from ERPNext"
      >
        <RefreshCw 
          class="w-4 h-4" 
          :class="{ 'animate-spin text-red-600': inventoryStore.loading }"
        />
      </button>

      <!-- Language / RTL Toggle -->
      <button 
        @click="toggleRtl"
        class="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
      >
        {{ isRtl ? 'English' : 'عربي' }}
      </button>

      <!-- YRCS Emblem Badge -->
      <div class="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200/60">
          <span class="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          YRCS Live
        </span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import { Search, RefreshCw, X } from 'lucide-vue-next'

const route = useRoute()
const inventoryStore = useInventoryStore()
const isRtl = ref(false)

const title = defineProps({
  title: { type: String, default: 'Operations & Inventory' },
  subtitle: { type: String, default: '' }
})

function refreshData() {
  inventoryStore.loadAll()
}

function toggleRtl() {
  isRtl.value = !isRtl.value
  document.documentElement.setAttribute('dir', isRtl.value ? 'rtl' : 'ltr')
}
</script>
