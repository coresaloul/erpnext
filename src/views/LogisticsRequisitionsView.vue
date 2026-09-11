<template>
  <div class="space-y-6">
    <!-- Top Executive Header -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5 mb-1">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200/60">
            YRCS Supply Chain & Logistics
          </span>
          <span v-if="logisticsStore.overdueCount > 0" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white animate-pulse">
            <AlertCircle class="w-3 h-3" />
            {{ logisticsStore.overdueCount }} متأخرة > 24 ساعة
          </span>
        </div>
        <h2 class="text-xl font-bold text-slate-900 tracking-tight">لوحة متابعة الطلبات اللوجستية (Logistics Requisitions)</h2>
        <p class="text-xs text-slate-500 mt-0.5">
          متابعة دورة العمل والاعتمادات (Workflow)، رصد المتأخرات، وإدارة سلاسل الإمداد والمساعدات الإنسانية
        </p>
      </div>

      <!-- Action Controls -->
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Device Notification Toggle Button -->
        <button 
          @click="toggleDeviceNotifications"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all shadow-xs"
          :class="[
            logisticsStore.notificationsEnabled 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          ]"
          :title="logisticsStore.notificationsEnabled ? 'تنبيهات الجهاز مفعلة' : 'اضغط لتفعيل تنبيهات الجهاز'"
        >
          <Bell :class="['w-4 h-4', logisticsStore.notificationsEnabled ? 'text-emerald-600' : 'text-slate-400']" />
          <span>{{ logisticsStore.notificationsEnabled ? 'تنبيهات الجهاز: مفعلة' : 'تفعيل تنبيهات الجهاز' }}</span>
        </button>

        <!-- Export CSV Button -->
        <button 
          @click="exportCsv"
          class="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          title="تصدير كملف CSV"
        >
          <Download class="w-4 h-4" />
          <span class="hidden sm:inline">تصدير CSV</span>
        </button>

        <!-- Refresh Button -->
        <button 
          @click="loadData"
          :disabled="logisticsStore.loading"
          class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-colors shadow-xs"
          title="تحديث البيانات من الخادم"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin text-red-600': logisticsStore.loading }" />
        </button>
      </div>
    </div>

    <!-- User Authority & Access Scope Banner -->
    <div 
      class="p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs transition-all"
      :class="scopeDescriptor.badgeClass"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-2xs border border-black/5">
          <ShieldCheck class="w-5 h-5" :class="scopeDescriptor.iconColor" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-xs text-slate-900">{{ scopeDescriptor.title }}</h3>
            <span v-if="scopeDescriptor.isFull" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
              صلاحية شاملة
            </span>
            <span v-else class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-blue-800 border border-blue-200 shadow-2xs">
              عرض مقيد بالهيكل
            </span>
          </div>
          <p class="text-[11px] text-slate-600 mt-0.5">{{ scopeDescriptor.subtitle }}</p>
        </div>
      </div>

      <!-- Scope Filter Tabs (All / My Own / My Subordinates / Pending Action) -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
        <button 
          @click="logisticsStore.filterScope = 'all'"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="[logisticsStore.filterScope === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200']"
        >
          <span>الكل المتاح</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="[logisticsStore.filterScope === 'all' ? 'bg-white/20' : 'bg-slate-100']">
            {{ logisticsStore.requisitions.length }}
          </span>
        </button>

        <button 
          @click="logisticsStore.filterScope = 'my_own'"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="[logisticsStore.filterScope === 'my_own' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200']"
        >
          <span>طلباتي المباشرة</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="[logisticsStore.filterScope === 'my_own' ? 'bg-white/20' : 'bg-slate-100']">
            {{ logisticsStore.myOwnCount }}
          </span>
        </button>

        <button 
          v-if="authStore.subordinates.length > 0 || scopeDescriptor.isFull"
          @click="logisticsStore.filterScope = 'subordinates'"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="[logisticsStore.filterScope === 'subordinates' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200']"
        >
          <span>طلبات موظفي إدارتي</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="[logisticsStore.filterScope === 'subordinates' ? 'bg-white/20' : 'bg-slate-100']">
            {{ logisticsStore.subordinatesCount }}
          </span>
        </button>

        <button 
          @click="logisticsStore.filterScope = 'pending_my_action'"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          :class="[logisticsStore.filterScope === 'pending_my_action' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200']"
        >
          <span>تنتظر اعتمادي</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="[logisticsStore.filterScope === 'pending_my_action' ? 'bg-white/20' : 'bg-slate-100']">
            {{ logisticsStore.pendingMyActionCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- KPI Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard 
        title="إجمالي الطلبات"
        :value="logisticsStore.requisitions.length"
        subtitle="جميع الطلبات اللوجستية المسجلة"
        :icon="FileText"
        variant="slate"
      />
      
      <StatCard 
        title="قيد المراجعة والاعتماد"
        :value="logisticsStore.pendingApprovalsCount"
        subtitle="بانتظار موافقة الموازنة/المالية/المدير"
        :icon="Clock"
        variant="blue"
        badge="مرحلة الاعتماد"
      />

      <StatCard 
        title="طلبات متأخرة (> 24 ساعة)"
        :value="logisticsStore.overdueCount"
        subtitle="تجاوزت يوم عمل دون اتخاذ إجراء"
        :icon="AlertTriangle"
        variant="red"
        :badge="logisticsStore.overdueCount > 0 ? 'تتطلب تدخلاً عاجلاً' : 'منضبطة'"
        :badgeVariant="logisticsStore.overdueCount > 0 ? 'danger' : 'success'"
      />

      <StatCard 
        title="تم الاستلام والتوريد"
        :value="logisticsStore.receivedCount"
        subtitle="وصلت المخازن وتم استلامها بنجاح"
        :icon="CheckCircle2"
        variant="emerald"
        badge="مكتملة"
        badgeVariant="success"
      />
    </div>

    <!-- Workflow Pipeline Navigation Bar -->
    <div class="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-soft">
      <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <!-- All Filter -->
        <button 
          @click="selectStage('')"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2"
          :class="[!logisticsStore.selectedStage && !logisticsStore.filterOverdueOnly ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
        >
          <span>الكل (All)</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{{ logisticsStore.requisitions.length }}</span>
        </button>

        <!-- Overdue Filter Toggle -->
        <button 
          @click="toggleOverdueFilter"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2"
          :class="[logisticsStore.filterOverdueOnly ? 'bg-rose-600 text-white shadow-sm' : 'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100']"
        >
          <span class="w-2 h-2 rounded-full bg-rose-500" :class="{ 'animate-ping': logisticsStore.overdueCount > 0 }"></span>
          <span>متأخرة لأكثر من يوم</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200/50">{{ logisticsStore.overdueCount }}</span>
        </button>

        <div class="h-5 w-px bg-slate-200 shrink-0 mx-1"></div>

        <!-- Stages -->
        <button 
          v-for="stage in logisticsStore.allStages"
          :key="stage.id"
          @click="selectStage(stage.id)"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5"
          :class="[
            logisticsStore.selectedStage === stage.id && !logisticsStore.filterOverdueOnly
              ? 'bg-red-600 text-white shadow-xs' 
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
          ]"
        >
          <span>{{ stage.label }}</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px]" :class="[logisticsStore.selectedStage === stage.id ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-700']">
            {{ logisticsStore.stageCounts[stage.id] || 0 }}
          </span>
        </button>
      </div>
    </div>

    <!-- Search and Controls Bar -->
    <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-soft flex flex-wrap items-center justify-between gap-4">
      <div class="relative w-full sm:w-80">
        <Search class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input 
          v-model="logisticsStore.searchQuery"
          type="text" 
          placeholder="بحث برقم الطلب، الحالة، أو المسؤول..."
          class="w-full pr-9 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 placeholder-slate-400"
        />
      </div>

      <div class="text-xs text-slate-500 font-medium">
        عرض <span class="font-bold text-slate-900">{{ logisticsStore.filteredRequisitions.length }}</span> من إجمالي {{ logisticsStore.requisitions.length }} طلب
      </div>
    </div>

    <!-- Requisitions Data Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
      <div v-if="logisticsStore.loading" class="py-20 flex flex-col justify-center items-center gap-3 text-slate-400">
        <Loader2 class="w-8 h-8 animate-spin text-red-600" />
        <span class="text-xs font-medium">جاري تحميل وتحديث الطلبات اللوجستية...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="logisticsStore.error" class="py-16 text-center text-rose-600 space-y-3 px-4">
        <AlertTriangle class="w-10 h-10 mx-auto text-rose-500" />
        <h3 class="text-sm font-bold text-slate-900">تعذر تحميل الطلبات اللوجستية</h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto">{{ logisticsStore.error }}</p>
        <button 
          @click="loadData" 
          class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span>إعادة المحاولة</span>
        </button>
      </div>

      <div v-else-if="logisticsStore.filteredRequisitions.length === 0" class="py-20 text-center text-slate-400 text-sm">
        <PackageX class="w-10 h-10 mx-auto text-slate-300 mb-2" />
        لا توجد طلبات مطابقة للفلتر المحدد.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-right text-xs">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <th class="py-3.5 px-6">رقم الطلب (ID)</th>
              <th class="py-3.5 px-6">مرحلة دورة العمل (Workflow State)</th>
              <th class="py-3.5 px-6">حالة التأخير (SLA Overdue)</th>
              <th class="py-3.5 px-6">تاريخ الطلب</th>
              <th class="py-3.5 px-6">تاريخ الاستحقاق</th>
              <th class="py-3.5 px-6">مقدم الطلب (Requester)</th>
              <th class="py-3.5 px-6 text-left">التفاصيل والمسار</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
            <tr 
              v-for="req in logisticsStore.filteredRequisitions" 
              :key="req.name"
              class="hover:bg-slate-50/70 transition-colors"
              :class="{ 'bg-rose-50/20': req.isOverdue }"
            >
              <!-- Name / ID -->
              <td class="py-4 px-6 font-mono font-bold text-slate-900">
                <router-link :to="'/logistics/' + req.name" class="hover:text-red-600 font-bold block">
                  {{ req.name }}
                </router-link>
                <span class="block text-[11px] font-normal text-slate-400 mt-0.5">
                  {{ req.material_request_type || 'Material Transfer' }}
                </span>
                <div class="flex items-center gap-1.5 mt-1">
                  <span 
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-2xs"
                    :class="getRelation(req).badgeClass"
                  >
                    {{ getRelation(req).label }}
                  </span>
                </div>
              </td>

              <!-- Workflow Stage Badge & Current Assignee -->
              <td class="py-4 px-6">
                <div class="space-y-1.5">
                  <!-- Stage Pill -->
                  <div class="flex items-center gap-1.5">
                    <span 
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-2xs"
                      :class="getStageClass(req.workflow_state)"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" :class="getStageDot(req.workflow_state)"></span>
                      {{ req.workflow_state || req.status }}
                    </span>
                  </div>

                  <!-- Requirement 1: User / Assignee who holds the workflow state -->
                  <div class="flex items-center gap-1.5 text-[11px] text-slate-700 bg-slate-100/90 px-2.5 py-1 rounded-lg w-fit border border-slate-200/70 shadow-2xs">
                    <UserCheck class="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span class="text-slate-400 font-medium">عند:</span>
                    <span class="font-bold text-slate-900 truncate max-w-[160px]" :title="getAssignee(req).name">
                      {{ getAssignee(req).name }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Overdue SLA Indicator -->
              <td class="py-4 px-6">
                <span 
                  v-if="req.isOverdue"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shadow-2xs"
                >
                  <Clock class="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  متأخر ({{ req.daysOverdue }} يوم)
                </span>
                <span v-else class="text-xs text-slate-400 font-normal">
                  ضمن المدة
                </span>
              </td>

              <!-- Transaction Date -->
              <td class="py-4 px-6 text-slate-600 font-mono text-xs">{{ req.transaction_date }}</td>

              <!-- Schedule Date -->
              <td class="py-4 px-6 text-slate-600 font-mono text-xs">{{ req.schedule_date || '—' }}</td>

              <!-- Requirement 3: Requester Name and Email -->
              <td class="py-4 px-6">
                <div class="space-y-0.5">
                  <div class="font-bold text-slate-900 text-xs leading-tight">
                    {{ getUserFullName(req.owner) }}
                  </div>
                  <div class="text-[11px] text-slate-400 font-mono truncate max-w-[160px]" :title="req.owner">
                    {{ req.owner }}
                  </div>
                </div>
              </td>

              <!-- Requirement 2: Independent Page Link & Print -->
              <td class="py-4 px-6 text-left">
                <div class="flex items-center justify-start gap-1.5">
                  <router-link 
                    :to="'/logistics/' + req.name"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>عرض المسار</span>
                  </router-link>

                  <router-link
                    :to="'/logistics/' + req.name"
                    class="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    title="طباعة الطلب"
                  >
                    <Printer class="w-3.5 h-3.5" />
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Requisition Comprehensive Inspector Modal -->
    <Modal 
      v-model="showInspector"
      :title="`الطلب اللوجستي: ${currentDetails?.name || ''}`"
      :subtitle="currentDetails?.workflow_state || ''"
      size="xl"
    >
      <div v-if="logisticsStore.detailsLoading" class="py-16 flex justify-center items-center text-slate-400">
        <Loader2 class="w-8 h-8 animate-spin text-red-600" />
      </div>

      <div v-else-if="currentDetails" class="space-y-6">
        <!-- Top Info Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
          <div>
            <span class="text-slate-400 block font-medium">القطاع / المركز</span>
            <span class="font-bold text-slate-900 mt-0.5 block">{{ currentDetails.cost_center || currentDetails.sector || 'NSD - YRCS' }}</span>
          </div>
          <div>
            <span class="text-slate-400 block font-medium">المشروع والمانح</span>
            <span class="font-bold text-slate-900 mt-0.5 block">
              {{ currentDetails.items?.[0]?.custom_project_name || currentDetails.project || 'IFRC' }}
            </span>
          </div>
          <div>
            <span class="text-slate-400 block font-medium">تاريخ الإنشاء</span>
            <span class="font-bold text-slate-900 mt-0.5 block">{{ currentDetails.creation?.split(' ')[0] }}</span>
          </div>
          <div>
            <span class="text-slate-400 block font-medium">مقدم الطلب</span>
            <span class="font-bold text-slate-900 mt-0.5 block truncate">{{ currentDetails.owner }}</span>
          </div>
        </div>

        <!-- Overdue Banner inside Modal if applicable -->
        <div 
          v-if="currentDetailsOverdue"
          class="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-900 font-semibold"
        >
          <AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
          <span>تنبيه تأخير: هذا الطلب متأخر في مرحلته الحالية لأكثر من 24 ساعة ويتطلب اتخاذ إجراء لاستكمال دورة العمل.</span>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex border-b border-slate-200 text-xs font-semibold gap-6">
          <button 
            @click="activeTab = 'items'"
            class="pb-3 border-b-2 transition-all"
            :class="[activeTab === 'items' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-400 hover:text-slate-700']"
          >
            المواد المطلوبة ({{ currentDetails.items?.length || 0 }} أصناف)
          </button>
          
          <button 
            @click="activeTab = 'workflow'"
            class="pb-3 border-b-2 transition-all flex items-center gap-1.5"
            :class="[activeTab === 'workflow' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-400 hover:text-slate-700']"
          >
            <span>سجل ومسار الموافقات (Workflow Audit Trail)</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
              {{ currentDetails.custom_workflow_audit_log?.length || 0 }}
            </span>
          </button>
        </div>

        <!-- Tab 1: Items List -->
        <div v-if="activeTab === 'items'" class="space-y-4">
          <div class="rounded-xl border border-slate-100 overflow-hidden">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th class="p-3">رمز واسم المادة</th>
                  <th class="p-3">الكمية</th>
                  <th class="p-3">الوحدة</th>
                  <th class="p-3">السعر التقديري</th>
                  <th class="p-3">المخزن المستهدف</th>
                  <th class="p-3 text-right">الإجمالي</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
                <tr v-for="it in currentDetails.items" :key="it.name" class="hover:bg-slate-50/50">
                  <td class="p-3 font-semibold text-slate-900">
                    <div>{{ it.item_name }}</div>
                    <div class="font-mono text-[10px] text-slate-400">{{ it.item_code }}</div>
                  </td>
                  <td class="p-3 font-bold text-slate-900">{{ it.qty }}</td>
                  <td class="p-3 text-slate-500">{{ it.uom || it.stock_uom }}</td>
                  <td class="p-3 text-slate-600">{{ it.custom_rate_in_pr_currency || it.rate || '—' }} {{ it.custom_pr_currency || 'USD' }}</td>
                  <td class="p-3 text-slate-600 truncate max-w-[140px]">{{ it.warehouse }}</td>
                  <td class="p-3 text-right font-bold text-slate-900">
                    {{ it.custom_amount_in_pr_currency || it.amount || '—' }} {{ it.custom_pr_currency || 'USD' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 2: Workflow Audit Trail Timeline -->
        <div v-if="activeTab === 'workflow'" class="space-y-4">
          <div v-if="!currentDetails.custom_workflow_audit_log || currentDetails.custom_workflow_audit_log.length === 0" class="py-8 text-center text-xs text-slate-400">
            لا توجد سجلات موافقة مسجلة بعد لهذا الطلب.
          </div>

          <div v-else class="relative pr-6 space-y-6 before:absolute before:right-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            <div 
              v-for="(log, idx) in currentDetails.custom_workflow_audit_log" 
              :key="log.name || idx"
              class="relative flex items-start gap-4 text-xs"
            >
              <!-- Timeline Dot -->
              <div class="absolute -right-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shrink-0 shadow-xs">
                <Check class="w-3 h-3 text-emerald-600" />
              </div>

              <!-- Content Card -->
              <div class="flex-1 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                <div class="flex items-center justify-between">
                  <div class="font-bold text-slate-900 text-sm">{{ log.user_full_name || log.employee_name || log.user }}</div>
                  <span class="text-[11px] font-mono text-slate-400">{{ log.action_datetime || (log.action_date + ' ' + log.action_time) }}</span>
                </div>

                <div class="mt-1 text-slate-500 flex items-center gap-2">
                  <span class="font-medium text-slate-700">{{ log.designation }}</span>
                  <span>&bull;</span>
                  <span>{{ log.department }}</span>
                </div>

                <div class="mt-2.5 pt-2.5 border-t border-slate-200/60 flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200/70 text-slate-700">
                    من: {{ log.from_state }}
                  </span>
                  <ArrowLeft class="w-3 h-3 text-slate-400" />
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    إلى: {{ log.to_state }}
                  </span>
                  <span class="mr-auto font-semibold text-emerald-700">
                    الإجراء: {{ log.workflow_action }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Workflow Action Buttons -->
        <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div class="text-xs text-slate-400">
            الحالة الحالية: <span class="font-bold text-slate-900">{{ currentDetails.workflow_state }}</span>
          </div>

          <div class="flex items-center gap-2">
            <button 
              type="button"
              @click="showInspector = false"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLogisticsStore } from '@/stores/logistics'
import { useAuthStore } from '@/stores/auth'
import { getUserFullName, getWorkflowAssignee } from '@/utils/users'
import { getUserScopeDescriptor, getRequisitionRelation } from '@/utils/permissions'
import StatCard from '@/components/common/StatCard.vue'
import Modal from '@/components/common/Modal.vue'
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Bell, 
  RefreshCw, 
  Search, 
  Download, 
  Eye, 
  AlertCircle,
  PackageX,
  Loader2,
  Check,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Printer,
  ShieldCheck
} from 'lucide-vue-next'

const logisticsStore = useLogisticsStore()
const authStore = useAuthStore()

const scopeDescriptor = computed(() => getUserScopeDescriptor(authStore))

function getRelation(req) {
  return getRequisitionRelation(req, authStore)
}

function getAssignee(req) {
  return getWorkflowAssignee(req)
}

const showInspector = ref(false)
const activeTab = ref('items')

onMounted(async () => {
  if (authStore.user && (!authStore.roles || authStore.roles.length === 0)) {
    await authStore.fetchProfile(authStore.user)
  }
  loadData()
})

function loadData() {
  logisticsStore.fetchRequisitions()
}

function selectStage(stageId) {
  logisticsStore.filterOverdueOnly = false
  logisticsStore.selectedStage = stageId
}

function toggleOverdueFilter() {
  logisticsStore.filterOverdueOnly = !logisticsStore.filterOverdueOnly
}

async function toggleDeviceNotifications() {
  if (logisticsStore.notificationsEnabled) {
    logisticsStore.disableDeviceNotifications()
  } else {
    await logisticsStore.enableDeviceNotifications()
  }
}

async function openInspector(name) {
  showInspector.value = true
  activeTab.value = 'items'
  await logisticsStore.fetchDetails(name)
}

const currentDetails = computed(() => {
  return logisticsStore.selectedRequisition
})

const currentDetailsOverdue = computed(() => {
  if (!currentDetails.value) return false
  const now = new Date().getTime()
  const oneDayMs = 24 * 60 * 60 * 1000
  const actionTime = new Date(currentDetails.value.modified || currentDetails.value.creation).getTime()
  return (now - actionTime) >= oneDayMs && !['Closed', 'Cancel', 'Received'].includes(currentDetails.value.workflow_state)
})

function getStageClass(state) {
  switch (state) {
    case 'Pending at Requester': return 'bg-slate-100 text-slate-700 border-slate-200'
    case 'Pending at Budget.H': return 'bg-amber-50 text-amber-800 border-amber-200'
    case 'Pending at Finance': return 'bg-blue-50 text-blue-800 border-blue-200'
    case 'Pending at CEO': return 'bg-purple-50 text-purple-800 border-purple-200'
    case 'Approved': return 'bg-indigo-50 text-indigo-800 border-indigo-200'
    case 'In Progress': return 'bg-sky-50 text-sky-800 border-sky-200'
    case 'Received': return 'bg-emerald-50 text-emerald-800 border-emerald-200'
    case 'Closed': return 'bg-slate-100 text-slate-600 border-slate-200'
    case 'Cancel': return 'bg-rose-50 text-rose-800 border-rose-200'
    default: return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

function getStageDot(state) {
  switch (state) {
    case 'Pending at Budget.H': return 'bg-amber-500'
    case 'Pending at Finance': return 'bg-blue-500'
    case 'Pending at CEO': return 'bg-purple-500'
    case 'Approved': return 'bg-indigo-500'
    case 'In Progress': return 'bg-sky-500'
    case 'Received': return 'bg-emerald-500'
    case 'Cancel': return 'bg-rose-500'
    default: return 'bg-slate-400'
  }
}

function exportCsv() {
  const items = logisticsStore.filteredRequisitions
  if (!items.length) return

  const headers = ['ID', 'Workflow State', 'Status', 'Transaction Date', 'Schedule Date', 'Requester', 'Is Overdue', 'Days Overdue']
  const rows = items.map(r => [
    r.name,
    r.workflow_state || '',
    r.status || '',
    r.transaction_date || '',
    r.schedule_date || '',
    r.owner || '',
    r.isOverdue ? 'Yes' : 'No',
    r.daysOverdue || 0
  ])

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `YRCS_Logistics_Requisitions_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
