<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-slate-900">Warehouses & Storage Hubs</h2>
        <p class="text-xs text-slate-500 mt-0.5">Yemen Red Crescent Society storage facilities and relief centers</p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold px-3 py-1 bg-red-50 text-red-700 border border-red-200/60 rounded-full">
          {{ inventoryStore.warehouses.length }} Registered Facilities
        </span>
      </div>
    </div>

    <!-- Facilities Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div 
        v-for="w in inventoryStore.warehouses" 
        :key="w.name"
        class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
              <Building2 class="w-5 h-5" />
            </div>
            <span 
              class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              :class="w.is_group ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'"
            >
              {{ w.is_group ? 'Group Facility' : 'Active Storage' }}
            </span>
          </div>

          <h3 class="mt-4 text-base font-bold text-slate-900 leading-snug">{{ w.warehouse_name }}</h3>
          <p class="text-xs font-mono text-slate-400 mt-0.5 truncate">{{ w.name }}</p>
          <p class="text-xs text-slate-500 mt-2">{{ w.company }}</p>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div class="text-xs text-slate-500">
            <span class="font-bold text-slate-900">{{ getWarehouseItemCount(w.name) }}</span> items in stock
          </div>

          <router-link 
            :to="{ path: '/balances', query: { warehouse: w.name } }"
            class="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            Inspect Stock <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useInventoryStore } from '@/stores/inventory'
import { Building2, ArrowRight } from 'lucide-vue-next'

const inventoryStore = useInventoryStore()

function getWarehouseItemCount(warehouseName) {
  return inventoryStore.stockBalances.filter(b => b.warehouse === warehouseName).length
}
</script>
