<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-slate-900">المخازن ومراكز التوزيع (Warehouses & Hubs)</h2>
        <p class="text-xs text-slate-500 mt-0.5">مراكز ونقاط التخزين والتوزيع الإغاثية لجمعية الهلال الأحمر اليمني</p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-bold px-3 py-1 bg-red-50 text-red-700 border border-red-200/60 rounded-full">
          {{ inventoryStore.warehouses.length }} مخازن ومراكز مسجلة
        </span>
      </div>
    </div>

    <!-- Scoped User Info Notice -->
    <div v-if="!authStore.hasFullAccess" class="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
          <Info class="w-4 h-4" />
        </div>
        <div>
          <h4 class="text-xs font-bold text-amber-900">إشعار: إدارة ونقل المخازن محصورة بإدارة اللوجستيك وسلاسل الإمداد</h4>
          <p class="text-[11px] text-amber-700 mt-0.5">يمكنك استعراض المخازن لأغراض الاستعلام. لطلب مواد أو أصناف لمشروعك، يرجى التوجه إلى الطلبات اللوجستية.</p>
        </div>
      </div>
      <router-link to="/logistics" class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-2xs">
        الطلبات اللوجستية
      </router-link>
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
            <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <Building2 class="w-5 h-5" />
            </div>
            <span 
              class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              :class="w.is_group ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'"
            >
              {{ w.is_group ? 'مجموعة رئيسية' : 'مخزن نشط' }}
            </span>
          </div>

          <h3 class="mt-4 text-base font-bold text-slate-900 leading-snug">{{ w.warehouse_name }}</h3>
          <p class="text-xs font-mono text-slate-400 mt-0.5 truncate">{{ w.name }}</p>
          <p class="text-xs text-slate-500 mt-2">{{ w.company }}</p>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div class="text-xs text-slate-500">
            يحتوي على <span class="font-bold text-slate-900 font-mono">{{ getWarehouseItemCount(w.name) }}</span> مادة مخزنة
          </div>

          <router-link 
            :to="{ path: '/balances', query: { warehouse: w.name } }"
            class="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <span>معاينة الرصيد</span>
            <ArrowLeft class="w-3.5 h-3.5" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useInventoryStore } from '@/stores/inventory'
import { useAuthStore } from '@/stores/auth'
import { Building2, ArrowLeft, Info } from 'lucide-vue-next'

const inventoryStore = useInventoryStore()
const authStore = useAuthStore()

function getWarehouseItemCount(warehouseName) {
  return inventoryStore.stockBalances.filter(b => b.warehouse === warehouseName).length
}
</script>
