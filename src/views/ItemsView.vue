<template>
  <div class="space-y-6">
    <!-- Header & Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
      <div>
        <h2 class="text-lg font-bold text-slate-900">دليل الأصناف والمواد (Stock Items)</h2>
        <p class="text-xs text-slate-500 mt-0.5">إدارة وفحص المواد والمساعدات الإنسانية المخزنة في النظام</p>
      </div>

      <div class="flex items-center gap-3">
        <!-- New Item Trigger -->
        <button 
          @click="showCreateModal = true"
          class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <Plus class="w-4 h-4" />
          <span>إضافة مادة جديدة</span>
        </button>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-soft flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3 flex-1">
        <!-- Search -->
        <div class="relative min-w-[220px] max-w-sm flex-1">
          <Search class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            v-model="inventoryStore.searchQuery"
            type="text" 
            placeholder="بحث بالاسم، رمز الصنف..."
            class="w-full pr-9 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 placeholder-slate-400"
          />
        </div>

        <!-- Item Group Dropdown -->
        <select 
          v-model="inventoryStore.selectedGroup"
          class="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-700 font-medium"
        >
          <option value="">جميع مجموعات الأصناف</option>
          <option v-for="g in inventoryStore.itemGroups" :key="g.name" :value="g.name">
            {{ g.name }}
          </option>
        </select>
      </div>

      <!-- Count -->
      <div class="text-xs text-slate-500 font-medium">
        عرض <span class="font-bold text-slate-900">{{ inventoryStore.filteredItems.length }}</span> صنف
      </div>
    </div>

    <!-- Items Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
      <div v-if="inventoryStore.loading" class="py-16 flex justify-center items-center text-slate-400">
        <Loader2 class="w-8 h-8 animate-spin text-red-600" />
      </div>

      <div v-else-if="inventoryStore.filteredItems.length === 0" class="py-16 text-center text-slate-400 text-sm">
        لا توجد أصناف مطابقة للبحث المحدد.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-right text-xs">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <th class="py-3.5 px-6">رمز المادة (Code)</th>
              <th class="py-3.5 px-6">اسم المادة</th>
              <th class="py-3.5 px-6">مجموعة الصنف</th>
              <th class="py-3.5 px-6">الوحدة</th>
              <th class="py-3.5 px-6">حد الأمان</th>
              <th class="py-3.5 px-6">الحالة</th>
              <th class="py-3.5 px-6 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
            <tr 
              v-for="item in inventoryStore.filteredItems" 
              :key="item.name"
              class="hover:bg-slate-50/70 transition-colors"
            >
              <td class="py-3.5 px-6 font-mono text-slate-900 font-bold">{{ item.item_code }}</td>
              <td class="py-3.5 px-6 font-bold text-slate-900">
                {{ item.item_name }}
                <p v-if="item.description && item.description !== item.item_name" class="text-[11px] font-normal text-slate-400 truncate max-w-xs mt-0.5">
                  {{ item.description }}
                </p>
              </td>
              <td class="py-3.5 px-6">
                <span class="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[11px]">
                  {{ item.item_group || 'Standard' }}
                </span>
              </td>
              <td class="py-3.5 px-6 text-slate-600">{{ item.stock_uom }}</td>
              <td class="py-3.5 px-6 text-slate-600 font-mono">{{ item.safety_stock || '—' }}</td>
              <td class="py-3.5 px-6">
                <StatusBadge :status="item.disabled ? 'Disabled' : 'In Stock'" />
              </td>
              <td class="py-3.5 px-6 text-left">
                <button 
                  @click="openItemDetails(item)"
                  class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="عرض التفاصيل"
                >
                  <Eye class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Item Details Modal -->
    <Modal 
      v-model="showDetailsModal" 
      :title="selectedItem?.item_name || 'Item Details'"
      :subtitle="selectedItem?.item_code"
      size="lg"
    >
      <div v-if="selectedItem" class="space-y-5 text-sm">
        <div class="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs text-slate-400 font-medium">Item Code</p>
            <p class="font-mono font-semibold text-slate-900">{{ selectedItem.item_code }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium">Item Group</p>
            <p class="font-semibold text-slate-900">{{ selectedItem.item_group }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium">Stock UOM</p>
            <p class="font-semibold text-slate-900">{{ selectedItem.stock_uom }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium">Safety Stock</p>
            <p class="font-semibold text-slate-900">{{ selectedItem.safety_stock || '0' }}</p>
          </div>
        </div>

        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Stock by Warehouse</h4>
          <div v-if="itemWarehouseBalances.length === 0" class="p-4 text-center text-xs text-slate-400 rounded-xl bg-slate-50 border border-slate-100">
            No stock recorded across warehouses for this item.
          </div>
          <div v-else class="rounded-xl border border-slate-100 overflow-hidden">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 border-b border-slate-100 text-slate-400">
                <tr>
                  <th class="p-3">Warehouse</th>
                  <th class="p-3 text-right">Available Qty</th>
                  <th class="p-3 text-right">Valuation Rate</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="b in itemWarehouseBalances" :key="b.name">
                  <td class="p-3 font-semibold text-slate-800">{{ b.warehouse }}</td>
                  <td class="p-3 text-right font-bold text-slate-900">{{ b.actual_qty }} {{ b.stock_uom }}</td>
                  <td class="p-3 text-right text-slate-600">{{ b.valuation_rate || '0.00' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <template #footer>
        <button 
          @click="showDetailsModal = false"
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
        >
          Close
        </button>
      </template>
    </Modal>

    <!-- Create Item Modal -->
    <Modal 
      v-model="showCreateModal" 
      title="Create New Stock Item"
      subtitle="Register an aid item in ERPNext"
      size="md"
    >
      <form @submit.prevent="handleCreateItem" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Item Code</label>
          <input 
            v-model="newItem.item_code"
            type="text" 
            required 
            placeholder="e.g. AID-MED-001"
            class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Item Name</label>
          <input 
            v-model="newItem.item_name"
            type="text" 
            required 
            placeholder="e.g. First Aid Emergency Kit"
            class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Item Group</label>
            <select 
              v-model="newItem.item_group"
              required
              class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20"
            >
              <option v-for="g in inventoryStore.itemGroups" :key="g.name" :value="g.name">
                {{ g.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Stock UOM</label>
            <input 
              v-model="newItem.stock_uom"
              type="text" 
              required 
              placeholder="Unit, Box, Bottle"
              class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-slate-600 mb-1">Safety Stock</label>
          <input 
            v-model.number="newItem.safety_stock"
            type="number" 
            placeholder="e.g. 50"
            class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>

        <div class="pt-2 flex justify-end gap-2">
          <button 
            type="button" 
            @click="showCreateModal = false"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            :disabled="creating"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50"
          >
            {{ creating ? 'Creating...' : 'Create Item' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { inventoryApi } from '@/api/inventory'
import StatusBadge from '@/components/common/StatusBadge.vue'
import Modal from '@/components/common/Modal.vue'
import { Search, Plus, Eye, Loader2 } from 'lucide-vue-next'

const inventoryStore = useInventoryStore()

const showDetailsModal = ref(false)
const selectedItem = ref(null)

const showCreateModal = ref(false)
const creating = ref(false)
const newItem = ref({
  item_code: '',
  item_name: '',
  item_group: 'All Item Groups',
  stock_uom: 'Unit',
  safety_stock: 0,
  is_stock_item: 1,
})

const itemWarehouseBalances = computed(() => {
  if (!selectedItem.value) return []
  return inventoryStore.stockBalances.filter(b => b.item_code === selectedItem.value.item_code)
})

function openItemDetails(item) {
  selectedItem.value = item
  showDetailsModal.value = true
}

async function handleCreateItem() {
  creating.value = true
  try {
    await inventoryApi.createItem(newItem.value)
    showCreateModal.value = false
    await inventoryStore.fetchItems()
    newItem.value = { item_code: '', item_name: '', item_group: 'All Item Groups', stock_uom: 'Unit', safety_stock: 0, is_stock_item: 1 }
  } catch (e) {
    alert(e.friendlyMessage || 'Failed to create item')
  } finally {
    creating.value = false
  }
}
</script>
