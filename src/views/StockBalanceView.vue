<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-slate-900">أرصدة المخزون الحية (Stock Balances)</h2>
        <p class="text-xs text-slate-500 mt-0.5">متابعة الكميات المتوفرة والفعلية في مخازن جمعية الهلال الأحمر اليمني</p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Warehouse Filter -->
        <select 
          v-model="selectedWarehouse"
          class="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-700 font-bold"
        >
          <option value="">جميع المخازن والمراكز</option>
          <option v-for="w in inventoryStore.warehouses" :key="w.name" :value="w.name">
            {{ w.warehouse_name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Balance Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
      <div v-if="inventoryStore.loading" class="py-16 flex justify-center items-center text-slate-400">
        <Loader2 class="w-8 h-8 animate-spin text-red-600" />
      </div>

      <div v-else-if="filteredBalances.length === 0" class="py-16 text-center text-slate-400 text-sm">
        لا توجد سجلات أرصدة مطابقة للفلتر المحدد.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-right text-xs">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <th class="py-3.5 px-6">رمز المادة (Item Code)</th>
              <th class="py-3.5 px-6">المخزن</th>
              <th class="py-3.5 px-6 text-left">الكمية الفعلية</th>
              <th class="py-3.5 px-6 text-left">الكمية المحجوزة</th>
              <th class="py-3.5 px-6 text-left">الكمية المتوقعة</th>
              <th class="py-3.5 px-6 text-left">سعر التقييم</th>
              <th class="py-3.5 px-6 text-left">حالة الرصيد</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
            <tr 
              v-for="b in filteredBalances" 
              :key="b.name"
              class="hover:bg-slate-50/70 transition-colors"
            >
              <td class="py-3.5 px-6 font-mono font-bold text-slate-900">{{ b.item_code }}</td>
              <td class="py-3.5 px-6 text-slate-800 font-semibold">{{ b.warehouse }}</td>
              <td class="py-3.5 px-6 text-left font-mono font-bold text-slate-900">
                {{ b.actual_qty }} <span class="text-xs font-normal text-slate-400">{{ b.stock_uom }}</span>
              </td>
              <td class="py-3.5 px-6 text-left font-mono text-slate-500">{{ b.reserved_qty || '0' }}</td>
              <td class="py-3.5 px-6 text-left font-mono font-semibold text-slate-700">{{ b.projected_qty || b.actual_qty }}</td>
              <td class="py-3.5 px-6 text-left font-mono text-slate-600">{{ Number(b.valuation_rate || 0).toFixed(2) }}</td>
              <td class="py-3.5 px-6 text-left">
                <StatusBadge :status="Number(b.actual_qty) > 0 ? 'In Stock' : 'Out of Stock'" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { Loader2 } from 'lucide-vue-next'

const route = useRoute()
const inventoryStore = useInventoryStore()
const selectedWarehouse = ref(route.query.warehouse || '')

onMounted(() => {
  if (route.query.warehouse) {
    selectedWarehouse.value = route.query.warehouse
  }
})

const filteredBalances = computed(() => {
  if (!selectedWarehouse.value) return inventoryStore.stockBalances
  return inventoryStore.stockBalances.filter(b => b.warehouse === selectedWarehouse.value)
})
</script>
