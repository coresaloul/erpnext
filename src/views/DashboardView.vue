<template>
  <div class="space-y-6">
    <!-- Welcome Banner -->
    <div class="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-soft relative overflow-hidden">
      <div class="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs mb-2">
            Yemen Red Crescent Society &bull; جمعية الهلال الأحمر اليمني
          </span>
          <h2 class="text-2xl font-bold tracking-tight">Welcome, {{ authStore.fullName || 'Officer' }}</h2>
          <p class="text-sm text-red-100 mt-1 max-w-xl">
            Live operations and inventory hub connected to your ERPNext instance. Monitor stock levels, warehouses, and relief supply requisitions in real-time.
          </p>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <router-link 
            to="/items"
            class="px-4 py-2 bg-white text-red-700 font-semibold text-xs rounded-xl shadow-xs hover:bg-red-50 transition-all"
          >
            Browse Stock Items
          </router-link>
          <router-link 
            to="/warehouses"
            class="px-4 py-2 bg-red-800/40 text-white border border-white/20 font-semibold text-xs rounded-xl hover:bg-red-800/60 transition-all"
          >
            View Warehouses
          </router-link>
        </div>
      </div>
    </div>

    <!-- Stat KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard 
        title="Total Stock Items"
        :value="inventoryStore.totalItemCount"
        subtitle="Cataloged in ERPNext"
        :icon="Package"
        variant="red"
      />
      <StatCard 
        title="Active Warehouses"
        :value="inventoryStore.totalWarehousesCount"
        subtitle="Relief distribution points"
        :icon="Warehouse"
        variant="blue"
      />
      <StatCard 
        title="Total Stock Units"
        :value="inventoryStore.totalActualQty"
        subtitle="Units across all facilities"
        :icon="Layers"
        variant="emerald"
      />
      <StatCard 
        title="Low Stock Alerts"
        :value="inventoryStore.lowStockItems.length"
        subtitle="Below safety threshold"
        :icon="AlertTriangle"
        variant="amber"
        :badge="inventoryStore.lowStockItems.length > 0 ? 'Attention' : 'Healthy'"
        :badgeVariant="inventoryStore.lowStockItems.length > 0 ? 'warning' : 'success'"
      />
    </div>

    <!-- Warehouse Distribution Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left 2 Cols: Recent Items / Critical Stock -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="text-base font-bold text-slate-900">Inventory Overview</h3>
            <p class="text-xs text-slate-500 mt-0.5">Key supplies and their latest stock status</p>
          </div>
          <router-link to="/items" class="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1">
            View All <ChevronRight class="w-3.5 h-3.5" />
          </router-link>
        </div>

        <div v-if="inventoryStore.loading" class="py-12 flex justify-center items-center text-slate-400">
          <Loader2 class="w-6 h-6 animate-spin text-red-600" />
        </div>

        <div v-else-if="inventoryStore.items.length === 0" class="py-12 text-center text-slate-400 text-sm">
          No stock items found in ERPNext.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th class="pb-3 pr-4">Item Code & Name</th>
                <th class="pb-3 px-4">Group</th>
                <th class="pb-3 px-4">Unit</th>
                <th class="pb-3 px-4">Safety Stock</th>
                <th class="pb-3 pl-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 text-slate-700 font-medium">
              <tr 
                v-for="item in inventoryStore.items.slice(0, 7)" 
                :key="item.name"
                class="hover:bg-slate-50/70 transition-colors"
              >
                <td class="py-3 pr-4">
                  <div class="font-semibold text-slate-900">{{ item.item_name }}</div>
                  <div class="text-[11px] text-slate-400">{{ item.item_code }}</div>
                </td>
                <td class="py-3 px-4 text-slate-600">{{ item.item_group || '—' }}</td>
                <td class="py-3 px-4 text-slate-600">{{ item.stock_uom }}</td>
                <td class="py-3 px-4 text-slate-600">{{ item.safety_stock || '—' }}</td>
                <td class="py-3 pl-4 text-right">
                  <StatusBadge :status="item.disabled ? 'Disabled' : 'In Stock'" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Col: Facilities & Warehouses -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-slate-900">Warehouses</h3>
            <p class="text-xs text-slate-500 mt-0.5">YRCS Storage & Distribution Hubs</p>
          </div>
          <router-link to="/warehouses" class="text-xs font-semibold text-red-600 hover:text-red-700">
            Details
          </router-link>
        </div>

        <div class="space-y-3 flex-1 overflow-y-auto">
          <div 
            v-for="w in inventoryStore.warehouses.slice(0, 6)" 
            :key="w.name"
            class="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/60 transition-colors flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Building2 class="w-4 h-4" />
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-900">{{ w.warehouse_name }}</p>
                <p class="text-[11px] text-slate-400 truncate max-w-[140px]">{{ w.company }}</p>
              </div>
            </div>

            <span 
              class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              :class="w.is_group ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'"
            >
              {{ w.is_group ? 'Group' : 'Active' }}
            </span>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-100 text-center">
          <router-link 
            to="/balances"
            class="w-full py-2 px-3 inline-flex justify-center items-center gap-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Layers class="w-3.5 h-3.5" />
            Check Live Stock Balances
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useInventoryStore } from '@/stores/inventory'
import StatCard from '@/components/common/StatCard.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { 
  Package, 
  Warehouse, 
  Layers, 
  AlertTriangle, 
  ChevronRight, 
  Building2,
  Loader2 
} from 'lucide-vue-next'

const authStore = useAuthStore()
const inventoryStore = useInventoryStore()
</script>
