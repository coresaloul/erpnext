<template>
  <header class="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-6 flex items-center justify-between shadow-2xs">
    <!-- Right in RTL: Page Title / Breadcrumb -->
    <div class="flex items-center gap-3">
      <div>
        <h1 class="text-base font-bold text-slate-900 tracking-tight">{{ title }}</h1>
        <p v-if="subtitle" class="text-xs text-slate-500 mt-0.5">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Left in RTL: Search, Refresh, Alerts, Status -->
    <div class="flex items-center gap-3">
      <!-- Search Input -->
      <div class="relative hidden sm:block w-64">
        <Search class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input 
          v-model="inventoryStore.searchQuery"
          type="text" 
          placeholder="بحث في الأصناف والرموز والمخازن..."
          class="w-full pr-9 pl-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-800 placeholder-slate-400"
        />
        <button 
          v-if="inventoryStore.searchQuery" 
          @click="inventoryStore.searchQuery = ''"
          class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Overdue Quick Alert Button -->
      <router-link 
        v-if="logisticsStore.overdueCount > 0"
        to="/logistics"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors animate-pulse"
        title="انتقل للطلبات اللوجستية المتأخرة"
      >
        <AlertCircle class="w-3.5 h-3.5 text-rose-600" />
        <span>{{ logisticsStore.overdueCount }} متأخر</span>
      </router-link>

      <!-- Refresh Data Button -->
      <button 
        @click="refreshData"
        :disabled="inventoryStore.loading"
        class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-colors shadow-2xs"
        title="تحديث البيانات من ERPNext"
      >
        <RefreshCw 
          class="w-4 h-4" 
          :class="{ 'animate-spin text-red-600': inventoryStore.loading }"
        />
      </button>

      <!-- YRCS Live Status Badge -->
      <div class="hidden md:flex items-center gap-2 pr-2 border-r border-slate-200">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/70 shadow-2xs">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>اتصال مباشر: YRCS</span>
        </span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useInventoryStore } from '@/stores/inventory'
import { useLogisticsStore } from '@/stores/logistics'
import { Search, RefreshCw, X, AlertCircle } from 'lucide-vue-next'

const inventoryStore = useInventoryStore()
const logisticsStore = useLogisticsStore()

defineProps({
  title: { type: String, default: 'لوحة التحكم والعمليات' },
  subtitle: { type: String, default: '' }
})

function refreshData() {
  inventoryStore.loadAll()
  logisticsStore.fetchRequisitions()
}
</script>
