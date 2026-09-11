<template>
  <div class="space-y-6">
    <!-- Non-print Navigation Bar -->
    <div class="no-print bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <router-link 
          to="/logistics"
          class="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors inline-flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowRight class="w-4 h-4" />
          <span>العودة للطلبات اللوجستية</span>
        </router-link>

        <div class="h-5 w-px bg-slate-200"></div>

        <div>
          <span class="font-mono text-sm font-bold text-slate-900">{{ id }}</span>
          <span class="text-xs text-slate-400 mr-2">| تفاصيل ومسار دورة العمل والطباعة الرسمية</span>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <!-- Print Button -->
        <button 
          @click="triggerPrint"
          class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <Printer class="w-4 h-4" />
          <span>طباعة الطلب بالكامل</span>
        </button>

        <!-- Open in ERPNext Desk -->
        <a 
          :href="`http://13.140.163.199/app/material-request/${id}`"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
        >
          <ExternalLink class="w-3.5 h-3.5" />
          <span>فتح في ERPNext</span>
        </a>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-24 flex flex-col justify-center items-center gap-3 text-slate-400 bg-white rounded-2xl border border-slate-200/80 shadow-soft">
      <Loader2 class="w-8 h-8 animate-spin text-red-600" />
      <span class="text-xs font-medium">جاري تحميل بيانات الطلب والمسار الزمني...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-soft space-y-3">
      <AlertCircle class="w-10 h-10 text-red-500 mx-auto" />
      <h3 class="text-base font-bold text-slate-900">تعذر تحميل بيانات الطلب</h3>
      <p class="text-xs text-slate-500 max-w-md mx-auto">{{ error }}</p>
      <router-link to="/logistics" class="inline-block mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl">
        العودة للقائمة
      </router-link>
    </div>

    <!-- Access Denied State -->
    <div v-else-if="isAccessDenied" class="p-10 text-center bg-white rounded-2xl border border-rose-200 shadow-soft space-y-3">
      <ShieldAlert class="w-12 h-12 text-rose-500 mx-auto" />
      <h3 class="text-base font-bold text-slate-900">غير مصرح بالاطلاع على هذا الطلب</h3>
      <p class="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
        هذا الطلب خارج نطاق صلاحيات حسابك. بصفتك موظفاً، تقتصر صلاحية الاطلاع على طلباتك الشخصية، أو طلبات موظفي إدارتك، أو الطلبات المكلف باعتمادها ضمن دورة العمل.
      </p>
      <router-link to="/logistics" class="inline-block mt-3 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors">
        العودة إلى قائمة طلباتي
      </router-link>
    </div>

    <!-- Printable Official Document Card -->
    <div v-else-if="doc" class="printable-document bg-white rounded-2xl border border-slate-200/80 shadow-soft p-8 sm:p-10 space-y-8">
      <!-- Official Header with Logo & Typography -->
      <div class="flex flex-col sm:flex-row items-center justify-between pb-6 border-b-2 border-slate-900/80 gap-4">
        <!-- Right: YRCS Arabic & English Title & Official Emblem -->
        <div class="flex items-center gap-4 text-right">
          <div class="w-18 h-18 rounded-full bg-white border-2 border-red-100 p-0.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
            <img src="@/assets/yrcs-logo.png" alt="YRCS" class="w-full h-full object-contain" />
          </div>
          <div>
            <h1 class="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">جمعية الهلال الأحمر اليمني</h1>
            <p class="text-xs font-bold text-red-600 font-mono tracking-wide">YEMEN RED CRESCENT SOCIETY</p>
            <p class="text-[11px] text-slate-500 mt-0.5 font-medium">إدارة سلاسل الإمداد والمشتريات والخدمات اللوجستية</p>
          </div>
        </div>

        <!-- Center: Title & ID -->
        <div class="text-center px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
          <h2 class="text-sm font-extrabold text-slate-900">طلب مواد / طلبية لوجستية</h2>
          <p class="text-[11px] text-slate-500 font-mono">Logistics Requisition</p>
          <p class="font-mono text-xs font-bold text-red-700 mt-1">{{ doc.name }}</p>
        </div>

        <!-- Left: Dates & Status -->
        <div class="text-left text-xs space-y-1">
          <div><span class="text-slate-400">تاريخ الطلب: </span><span class="font-bold text-slate-900 font-mono">{{ doc.transaction_date }}</span></div>
          <div><span class="text-slate-400">تاريخ الحاجة: </span><span class="font-bold text-slate-900 font-mono">{{ doc.schedule_date || '—' }}</span></div>
          <div class="pt-1">
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border" :class="getStageBadgeClass(doc.workflow_state)">
              {{ doc.workflow_state || doc.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Overdue Banner (Visible if delayed > 24h) -->
      <div v-if="isOverdue" class="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 font-semibold no-print">
        <Clock class="w-4 h-4 text-rose-600 shrink-0" />
        <span>تنبيه تأخير: تجاوز هذا الطلب فترة 24 ساعة دون تحويله للمرحلة التالية في دورة العمل.</span>
      </div>

      <!-- Key Metadata Box -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-xs">
        <div>
          <span class="text-slate-400 block font-medium">مقدم الطلب (Requester)</span>
          <span class="font-bold text-slate-900 mt-1 block text-sm">{{ requesterName }}</span>
          <span class="text-[11px] text-slate-500 font-mono truncate block">{{ doc.owner }}</span>
        </div>

        <div>
          <span class="text-slate-400 block font-medium">المعني الحالي بالمرحلة</span>
          <span class="font-bold text-red-700 mt-1 block text-sm">{{ assigneeInfo.name }}</span>
          <span class="text-[11px] text-slate-500 block">{{ assigneeInfo.role }}</span>
        </div>

        <div>
          <span class="text-slate-400 block font-medium">القطاع / مركز التكلفة</span>
          <span class="font-bold text-slate-900 mt-1 block text-sm">{{ doc.cost_center || doc.custom_cost_center || 'NSD - YRCS' }}</span>
          <span class="text-[11px] text-slate-500 block">{{ doc.custom_branch || doc.branch || 'المركز الرئيسي' }}</span>
        </div>

        <div>
          <span class="text-slate-400 block font-medium">المشروع والمانح</span>
          <span class="font-bold text-slate-900 mt-1 block text-sm">
            {{ doc.items?.[0]?.custom_project_name || doc.project || 'IFRC Relief' }}
          </span>
          <span class="text-[11px] text-slate-500 block">
            المانح: {{ doc.items?.[0]?.custom_donor_name || 'الاتحاد الدولي للصليب والهلال الأحمر' }}
          </span>
        </div>
      </div>

      <!-- Requested Items Table -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>الأصناف والمواد المطلوبة</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {{ doc.items?.length || 0 }} أصناف
            </span>
          </h3>

          <div v-if="totalCostAmount > 0" class="text-xs font-semibold text-slate-700">
            الإجمالي التقديري: <span class="text-sm font-extrabold text-red-700 font-mono">{{ totalCostFormatted }} {{ doc.custom_pr_currency || 'USD' }}</span>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 overflow-hidden">
          <table class="w-full text-right text-xs">
            <thead class="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th class="py-3 px-4 w-10 text-center">#</th>
                <th class="py-3 px-4">رمز المادة (Item Code)</th>
                <th class="py-3 px-4">اسم المادة والمواصفات</th>
                <th class="py-3 px-4 text-center">الكمية</th>
                <th class="py-3 px-4 text-center">الوحدة</th>
                <th class="py-3 px-4 text-left">السعر التقديري</th>
                <th class="py-3 px-4 text-left">الإجمالي</th>
                <th class="py-3 px-4">المخزن المستهدف</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-800 font-medium">
              <tr v-for="(it, idx) in doc.items" :key="it.name || idx" class="hover:bg-slate-50/50">
                <td class="py-3 px-4 text-center text-slate-400 font-mono">{{ idx + 1 }}</td>
                <td class="py-3 px-4 font-mono font-bold text-slate-900">{{ it.item_code }}</td>
                <td class="py-3 px-4">
                  <div class="font-bold text-slate-900">{{ it.item_name }}</div>
                  <div v-if="it.description && it.description !== it.item_name" class="text-[11px] text-slate-500 mt-0.5 line-clamp-2" v-html="it.description"></div>
                </td>
                <td class="py-3 px-4 text-center font-bold text-slate-900 font-mono">{{ it.qty }}</td>
                <td class="py-3 px-4 text-center text-slate-600">{{ it.uom || it.stock_uom }}</td>
                <td class="py-3 px-4 text-left font-mono text-slate-700">
                  {{ it.custom_rate_in_pr_currency || it.rate || '0.00' }}
                </td>
                <td class="py-3 px-4 text-left font-bold text-slate-900 font-mono">
                  {{ (it.custom_amount_in_pr_currency || it.amount || 0).toLocaleString() }}
                </td>
                <td class="py-3 px-4 text-slate-600 text-[11px]">{{ it.warehouse || 'المخزن الرئيسي - YRCS' }}</td>
              </tr>
            </tbody>
            <!-- Table Footer -->
            <tfoot class="bg-slate-50 border-t-2 border-slate-200 font-bold text-xs">
              <tr>
                <td colspan="6" class="py-3 px-4 text-left text-slate-600">المجموع الكلي التقديري:</td>
                <td class="py-3 px-4 text-left text-red-700 font-mono text-sm">{{ totalCostFormatted }} {{ doc.custom_pr_currency || 'USD' }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Chronological Workflow Audit Trail -->
      <div class="space-y-4 pt-4 border-t border-slate-200">
        <h3 class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <span>سجل مسار الاعتمادات والموافقات (Workflow Audit Trail)</span>
          <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {{ doc.custom_workflow_audit_log?.length || 0 }} اعتمادات
          </span>
        </h3>

        <div v-if="!doc.custom_workflow_audit_log || doc.custom_workflow_audit_log.length === 0" class="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
          لا توجد اعتمادات مدونة بعد في سجل المراجعة لهذا الطلب.
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="(log, idx) in doc.custom_workflow_audit_log"
            :key="log.name || idx"
            class="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <!-- Approver Details -->
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 border border-emerald-200">
                <Check class="w-4 h-4" />
              </div>
              <div>
                <p class="font-bold text-slate-900 text-sm">{{ log.user_full_name || log.employee_name || log.user }}</p>
                <p class="text-slate-500 text-[11px]">{{ log.designation }} &bull; {{ log.department }}</p>
              </div>
            </div>

            <!-- Stage Transition (Right to Left in Arabic) -->
            <div class="flex items-center gap-2 font-medium">
              <span class="px-2.5 py-1 rounded-md bg-slate-200/80 text-slate-700 text-[11px]">{{ log.from_state }}</span>
              <ArrowLeft class="w-3.5 h-3.5 text-slate-400" />
              <span class="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">{{ log.to_state }}</span>
            </div>

            <!-- Date & Time -->
            <div class="text-left font-mono text-slate-400 text-[11px] shrink-0">
              {{ log.action_datetime || (log.action_date + ' ' + log.action_time) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Official Signatures Box (Essential for Official Humanitarian Archiving & Print) -->
      <div class="pt-6 border-t-2 border-slate-900/80 space-y-4">
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-700 text-center">
          صندوق التوقيعات والاعتمادات الرسمية (Official Authorizations & Signatures)
        </h4>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
          <!-- 1. Requester -->
          <div class="p-3.5 rounded-xl border border-slate-200 bg-white space-y-4 min-h-[120px] flex flex-col justify-between">
            <div>
              <p class="font-bold text-slate-900">1. مقدم الطلب (Requester)</p>
              <p class="text-[11px] text-slate-500 mt-1">{{ requesterName }}</p>
            </div>
            <div class="border-t border-dashed border-slate-300 pt-2 text-[10px] text-slate-400">
              التوقيع والتاريخ: ____________
            </div>
          </div>

          <!-- 2. Budget Holder -->
          <div class="p-3.5 rounded-xl border border-slate-200 bg-white space-y-4 min-h-[120px] flex flex-col justify-between">
            <div>
              <p class="font-bold text-slate-900">2. مسؤول الموازنة (Budget.H)</p>
              <p class="text-[11px] text-slate-500 mt-1">{{ getAuditApprover('Pending at Budget.H') || 'معتمد' }}</p>
            </div>
            <div class="border-t border-dashed border-slate-300 pt-2 text-[10px] text-slate-400">
              التوقيع والتاريخ: ____________
            </div>
          </div>

          <!-- 3. Finance -->
          <div class="p-3.5 rounded-xl border border-slate-200 bg-white space-y-4 min-h-[120px] flex flex-col justify-between">
            <div>
              <p class="font-bold text-slate-900">3. المراجعة المالية (Finance)</p>
              <p class="text-[11px] text-slate-500 mt-1">{{ getAuditApprover('Pending at Finance') || 'معتمد' }}</p>
            </div>
            <div class="border-t border-dashed border-slate-300 pt-2 text-[10px] text-slate-400">
              التوقيع والتاريخ: ____________
            </div>
          </div>

          <!-- 4. CEO -->
          <div class="p-3.5 rounded-xl border border-slate-200 bg-white space-y-4 min-h-[120px] flex flex-col justify-between">
            <div>
              <p class="font-bold text-slate-900">4. اعتماد الإدارة العليا (CEO)</p>
              <p class="text-[11px] text-slate-500 mt-1">{{ getAuditApprover('Pending at CEO') || 'معتمد' }}</p>
            </div>
            <div class="border-t border-dashed border-slate-300 pt-2 text-[10px] text-slate-400">
              التوقيع والتاريخ: ____________
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { inventoryApi } from '@/api/inventory'
import { useAuthStore } from '@/stores/auth'
import { getUserFullName, getWorkflowAssignee } from '@/utils/users'
import { canAccessRequisition } from '@/utils/permissions'
import { 
  ArrowLeft, 
  Printer, 
  ExternalLink, 
  AlertCircle, 
  Check, 
  Clock, 
  ArrowRight, 
  Loader2,
  ShieldAlert
} from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()
const id = computed(() => route.params.id)

const doc = ref(null)
const loading = ref(true)
const error = ref(null)
const isAccessDenied = ref(false)

onMounted(async () => {
  if (authStore.user && (!authStore.roles || authStore.roles.length === 0)) {
    await authStore.fetchProfile(authStore.user)
  }
  await fetchDoc()
})

async function fetchDoc() {
  loading.value = true
  error.value = null
  isAccessDenied.value = false
  try {
    const res = await inventoryApi.getRequisitionDetails(id.value)
    const fetchedDoc = res.data?.data || null
    if (fetchedDoc && !canAccessRequisition(fetchedDoc, authStore)) {
      isAccessDenied.value = true
      doc.value = null
    } else {
      doc.value = fetchedDoc
    }
  } catch (err) {
    console.error('Failed to load requisition:', err)
    error.value = err.friendlyMessage || 'لم يتم العثور على هذا الطلب أو ليس لديك صلاحية الوصول إليه.'
  } finally {
    loading.value = false
  }
}

const requesterName = computed(() => {
  if (!doc.value?.owner) return '—'
  return getUserFullName(doc.value.owner)
})

const assigneeInfo = computed(() => {
  return getWorkflowAssignee(doc.value)
})

const isOverdue = computed(() => {
  if (!doc.value) return false
  const now = new Date().getTime()
  const oneDayMs = 24 * 60 * 60 * 1000
  const actionTime = new Date(doc.value.modified || doc.value.creation).getTime()
  return (now - actionTime) >= oneDayMs && !['Closed', 'Cancel', 'Received'].includes(doc.value.workflow_state)
})

const totalCostAmount = computed(() => {
  if (!doc.value?.items) return 0
  return doc.value.items.reduce((sum, it) => sum + Number(it.custom_amount_in_pr_currency || it.amount || 0), 0)
})

const totalCostFormatted = computed(() => {
  return totalCostAmount.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

function getAuditApprover(fromState) {
  if (!doc.value?.custom_workflow_audit_log) return ''
  const entry = doc.value.custom_workflow_audit_log.find(l => l.from_state === fromState)
  return entry ? (entry.user_full_name || entry.employee_name) : ''
}

function getStageBadgeClass(state) {
  switch (state) {
    case 'Pending at Budget.H': return 'bg-amber-50 text-amber-800 border-amber-200'
    case 'Pending at Finance': return 'bg-blue-50 text-blue-800 border-blue-200'
    case 'Pending at CEO': return 'bg-purple-50 text-purple-800 border-purple-200'
    case 'Approved': return 'bg-indigo-50 text-indigo-800 border-indigo-200'
    case 'In Progress': return 'bg-sky-50 text-sky-800 border-sky-200'
    case 'Received': return 'bg-emerald-50 text-emerald-800 border-emerald-200'
    case 'Closed': return 'bg-slate-100 text-slate-700 border-slate-200'
    case 'Cancel': return 'bg-rose-50 text-rose-800 border-rose-200'
    default: return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

function triggerPrint() {
  window.print()
}
</script>

<style>
@media print {
  /* Hide sidebar, headers, and navigation */
  aside,
  header,
  footer,
  .no-print {
    display: none !important;
  }

  body, html {
    background: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .ml-64 {
    margin-left: 0 !important;
  }

  main {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .printable-document {
    border: none !important;
    box-shadow: none !important;
    padding: 10mm !important;
  }

  /* Page break rules */
  table {
    page-break-inside: auto;
  }
  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
}
</style>
