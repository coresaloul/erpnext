<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-slate-900">طلبات الصرف والتحويل (Material Requests)</h2>
        <p class="text-xs text-slate-500 mt-0.5">متابعة طلبات تحويل المواد الإغاثية والطبية وصرف المساعدات بين المخازن والفروع</p>
      </div>

      <button 
        @click="showCreateModal = true"
        class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
      >
        <Plus class="w-4 h-4" />
        <span>طلب مواد جديد</span>
      </button>
    </div>

    <!-- Requests Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
      <div v-if="inventoryStore.loading" class="py-16 flex justify-center items-center text-slate-400">
        <Loader2 class="w-8 h-8 animate-spin text-red-600" />
      </div>

      <div v-else-if="inventoryStore.materialRequests.length === 0" class="py-16 text-center text-slate-400 text-sm">
        لا توجد سجلات طلبات مواد مسجلة.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-right text-xs">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <th class="py-3.5 px-6">رقم الطلب</th>
              <th class="py-3.5 px-6">النوع / الغرض</th>
              <th class="py-3.5 px-6">تاريخ الطلب</th>
              <th class="py-3.5 px-6">تاريخ الاستحقاق</th>
              <th class="py-3.5 px-6">مقدم الطلب</th>
              <th class="py-3.5 px-6 text-left">الحالة</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
            <tr 
              v-for="req in inventoryStore.materialRequests" 
              :key="req.name"
              class="hover:bg-slate-50/70 transition-colors"
            >
              <td class="py-3.5 px-6 font-mono font-bold text-slate-900">{{ req.name }}</td>
              <td class="py-3.5 px-6">
                <span class="inline-flex px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium text-[11px] border border-blue-100">
                  {{ req.material_request_type || 'Transfer' }}
                </span>
              </td>
              <td class="py-3.5 px-6 text-slate-600 font-mono">{{ req.transaction_date }}</td>
              <td class="py-3.5 px-6 text-slate-600 font-mono">{{ req.schedule_date || '—' }}</td>
              <td class="py-3.5 px-6 text-slate-500 truncate max-w-[150px]">{{ req.owner }}</td>
              <td class="py-3.5 px-6 text-left">
                <StatusBadge :status="req.status || 'Draft'" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Request Modal -->
    <Modal 
      v-model="showCreateModal" 
      title="Create Material Request"
      subtitle="Submit humanitarian supply request in ERPNext"
      size="md"
    >
      <form @submit.prevent="handleCreateRequest" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold uppercase text-slate-600 mb-1">Request Type</label>
          <select 
            v-model="newRequest.material_request_type"
            class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20"
          >
            <option value="Material Transfer">Material Transfer (Between Warehouses)</option>
            <option value="Purchase">Purchase Requisition</option>
            <option value="Material Issue">Material Issue (Relief Aid Distribution)</option>
          </select>
        </div>

        <div>
          <label class="block font-semibold uppercase text-slate-600 mb-1">Required By Date</label>
          <input 
            v-model="newRequest.schedule_date"
            type="date"
            required
            class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <div>
          <label class="block font-semibold uppercase text-slate-600 mb-1">Target Item</label>
          <select 
            v-model="selectedItemCode"
            required
            class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20"
          >
            <option value="">Select Item</option>
            <option v-for="item in inventoryStore.items" :key="item.name" :value="item.item_code">
              {{ item.item_code }} - {{ item.item_name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block font-semibold uppercase text-slate-600 mb-1">Quantity</label>
          <input 
            v-model.number="itemQty"
            type="number"
            min="1"
            required
            placeholder="e.g. 50"
            class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <div class="pt-3 flex justify-end gap-2">
          <button 
            type="button" 
            @click="showCreateModal = false"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            :disabled="creating"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-xs disabled:opacity-50"
          >
            {{ creating ? 'Submitting...' : 'Submit Request' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { inventoryApi } from '@/api/inventory'
import StatusBadge from '@/components/common/StatusBadge.vue'
import Modal from '@/components/common/Modal.vue'
import { Plus, Loader2 } from 'lucide-vue-next'

const inventoryStore = useInventoryStore()

const showCreateModal = ref(false)
const creating = ref(false)
const selectedItemCode = ref('')
const itemQty = ref(1)

const today = new Date().toISOString().split('T')[0]
const newRequest = ref({
  material_request_type: 'Material Transfer',
  schedule_date: today,
})

async function handleCreateRequest() {
  if (!selectedItemCode.value) return
  creating.value = true
  try {
    const payload = {
      material_request_type: newRequest.value.material_request_type,
      schedule_date: newRequest.value.schedule_date,
      items: [
        {
          item_code: selectedItemCode.value,
          qty: itemQty.value,
          schedule_date: newRequest.value.schedule_date
        }
      ]
    }
    await inventoryApi.createMaterialRequest(payload)
    showCreateModal.value = false
    await inventoryStore.fetchMaterialRequests()
  } catch (e) {
    alert(e.friendlyMessage || 'Failed to submit request')
  } finally {
    creating.value = false
  }
}
</script>
