<template>
  <div class="space-y-6 pb-16">
    <!-- Top Action Bar & Breadcrumbs -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
      <div class="flex items-center gap-4">
        <router-link 
          to="/logistics"
          class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-2xs shrink-0"
          title="العودة إلى قائمة الطلبات"
        >
          <ArrowRight class="w-5 h-5" />
        </router-link>

        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
              طلب لوجستي جديد
            </span>
            <span class="text-xs text-slate-400 font-mono">MAT-MR-.YYYY.-</span>
          </div>
          <h1 class="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
            إنشاء وتعميد طلب مواد وتوريد لوجستي (Material Request)
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-2.5 shrink-0">
        <router-link 
          to="/logistics"
          class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
        >
          إلغاء
        </router-link>

        <button 
          @click="submitRequisition(false)"
          :disabled="submitting"
          class="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
        >
          <Save class="w-4 h-4 text-slate-500" />
          <span>حفظ كمسودة</span>
        </button>

        <button 
          @click="submitRequisition(true)"
          :disabled="submitting"
          class="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2"
        >
          <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
          <Send v-else class="w-4 h-4" />
          <span>تقديم الطلب للاعتماد</span>
        </button>
      </div>
    </div>

    <!-- Alert / Validation Banner if any error -->
    <div v-if="errorMessage" class="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800 shadow-2xs">
      <AlertCircle class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
      <div class="flex-1">
        <p class="font-bold">يرجى استكمال الحقول المطلوبة قبل إرسال الطلب:</p>
        <p class="mt-0.5 text-rose-700">{{ errorMessage }}</p>
      </div>
      <button @click="errorMessage = ''" class="text-rose-400 hover:text-rose-700">
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Form Container -->
    <form @submit.prevent="submitRequisition(true)" class="space-y-6">

      <!-- SECTION 1: الغرض والبيانات العامة -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">1</span>
            <h2 class="text-xs sm:text-sm font-bold text-slate-900">بيانات الطلب الأساسية والغرض (General Purpose)</h2>
          </div>
          <span class="text-[11px] text-slate-400">* الحقول المشار إليها بإشارة النجمة إلزامية</span>
        </div>

        <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <!-- Purpose / Type -->
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">
              الغرض من الطلب (Purpose) <span class="text-red-500">*</span>
            </label>
            <select 
              v-model="form.material_request_type" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              required
            >
              <option value="Purchase">طلب شراء مواد وأصناف (Purchase)</option>
              <option value="Material Transfer">طلب نقل وتحويل مواد بين المخازن (Material Transfer)</option>
              <option value="Material Issue">طلب صرف مواد لمشروع / مركز (Material Issue)</option>
              <option value="Manufacture">طلب تصنيع (Manufacture)</option>
              <option value="Customer Provided">مواد موردة من العميل (Customer Provided)</option>
            </select>
          </div>

          <!-- Title -->
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">
              عنوان الطلب (Title) <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.title" 
              type="text" 
              placeholder="مثال: طلب شراء مواد إيوائية لمشروع IFRC"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              required
            />
          </div>

          <!-- Priority -->
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">
              درجة الأهمية (Priority) <span class="text-red-500">*</span>
            </label>
            <select 
              v-model="form.custom_priority" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              required
            >
              <option value="Normal">عادي (Normal)</option>
              <option value="Urgent">عاجل (Urgent)</option>
              <option value="Very Urgent">عاجل جداً (Very Urgent)</option>
            </select>
          </div>

          <!-- Transaction Date -->
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">
              تاريخ تحرير الطلب (LR Date) <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.transaction_date" 
              type="date" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              required
            />
          </div>

          <!-- Required By Date -->
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">
              تاريخ الاحتياج الأقصى (Required By) <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.schedule_date" 
              type="date" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              required
            />
          </div>

          <!-- Item Group -->
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">
              مجموعة الأصناف الرئيسية (Item Group) <span class="text-red-500">*</span>
            </label>
            <select 
              v-model="form.custom_item_group" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              required
            >
              <option v-for="g in itemGroups" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>

          <!-- Supplier Group -->
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">
              مجموعة الموردين (Supplier Group) <span class="text-red-500">*</span>
            </label>
            <select 
              v-model="form.custom_supplier_group" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              required
            >
              <option v-for="sg in supplierGroups" :key="sg" :value="sg">{{ sg }}</option>
            </select>
          </div>

          <!-- Company -->
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">الجهة / الجمعية (Company)</label>
            <input 
              v-model="form.company" 
              type="text" 
              readonly
              class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-600 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <!-- SECTION 2: الفرع وعناوين التسليم والمخزن الافتراضي -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">2</span>
            <h2 class="text-xs sm:text-sm font-bold text-slate-900">الفرع وعناوين المستلم والتسليم (Locations & Delivery)</h2>
          </div>
        </div>

        <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <!-- Branch -->
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">
              الفرع الطالب (Branch) <span class="text-red-500">*</span>
            </label>
            <select 
              v-model="form.custom_branch" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              required
            >
              <option v-for="b in branches" :key="b" :value="b">{{ b }}</option>
            </select>
          </div>

          <!-- Consignee Name and Address -->
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">
              اسم وعنوان المستلم (Consignee) <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.custom_consignee_address" 
              type="text" 
              placeholder="مثال: المركز الرئيسي - صنعاء"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              required
            />
          </div>

          <!-- Delivery Address -->
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">
              عنوان وموقع التسليم (Delivery Address) <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.custom_dellivery_address" 
              type="text" 
              placeholder="مثال: مخازن الجمعية المركزية - التلفزيون"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              required
            />
          </div>

          <!-- Default Target Warehouse -->
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">
              المخزن المستهدف الافتراضي (Target Warehouse) <span class="text-red-500">*</span>
            </label>
            <select 
              v-model="form.default_warehouse" 
              @change="applyDefaultWarehouseToItems"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              required
            >
              <option v-for="w in warehousesList" :key="w.name" :value="w.name">{{ w.warehouse_name || w.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- SECTION 3: المالية والعملة ومسؤول الموازنة -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">3</span>
            <h2 class="text-xs sm:text-sm font-bold text-slate-900">المالية والعملة ومسؤول الموازنة (Financials & Budget)</h2>
          </div>
        </div>

        <div class="p-6 grid grid-cols-1 md:grid-cols-4 gap-5 text-xs">
          <!-- Requisition Currency -->
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">
              عملة الطلب (PR Currency) <span class="text-red-500">*</span>
            </label>
            <select 
              v-model="form.custom_pr_currency" 
              @change="updateExchangeRate"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              required
            >
              <option value="USD">دولار أمريكي (USD)</option>
              <option value="YER">ريال يمني (YER)</option>
              <option value="SAR">ريال سعودي (SAR)</option>
              <option value="EUR">يورو (EUR)</option>
            </select>
          </div>

          <!-- Exchange Rate -->
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">
              سعر الصرف (Exchange Rate) <span class="text-red-500">*</span>
            </label>
            <input 
              v-model.number="form.custom_exchange_rate" 
              type="number" 
              step="any"
              min="0.0001"
              @input="recalculateItemRates"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              required
            />
          </div>

          <!-- Cost Center -->
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">
              مركز التكلفة / القطاع (Cost Center) <span class="text-red-500">*</span>
            </label>
            <select 
              v-model="form.cost_center" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              required
            >
              <option v-for="cc in costCenters" :key="cc" :value="cc">{{ cc }}</option>
            </select>
          </div>

          <!-- Budget Holder User -->
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">
              مسؤول الموازنة المعين للاعتماد (Budget Holder)
            </label>
            <select 
              v-model="form.custom_budget_holder_user" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            >
              <option value="">-- اختياري أو اختر مسؤول الموازنة --</option>
              <option v-for="u in budgetHoldersList" :key="u.email" :value="u.email">
                {{ u.name }} ({{ u.email }})
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- SECTION 4: جدول المواد والأصناف المطلوبة (Items Child Table) -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">4</span>
            <div>
              <h2 class="text-xs sm:text-sm font-bold text-slate-900">جدول المواد والأصناف المطلوبة (Requisition Items)</h2>
              <p class="text-[11px] text-slate-500 mt-0.5">إجمالي البنود المضافة: {{ form.items.length }} صنف</p>
            </div>
          </div>

          <button 
            type="button" 
            @click="addItemRow"
            class="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Plus class="w-4 h-4" />
            <span>إضافة صنف جديد</span>
          </button>
        </div>

        <!-- Items Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs">
            <thead class="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th class="py-3 px-3 w-10 text-center">#</th>
                <th class="py-3 px-3 min-w-[220px]">الصنف والرمز (Item Code & Name) *</th>
                <th class="py-3 px-3 min-w-[160px]">المواصفات والوصف</th>
                <th class="py-3 px-3 w-28 text-center">الكمية *</th>
                <th class="py-3 px-3 w-28">الوحدة *</th>
                <th class="py-3 px-3 w-32 text-left">السعر التقديري ({{ form.custom_pr_currency }}) *</th>
                <th class="py-3 px-3 w-32 text-left">إجمالي التكلفة</th>
                <th class="py-3 px-3 min-w-[140px]">المشروع (Project) *</th>
                <th class="py-3 px-3 min-w-[140px]">المانح (Donor)</th>
                <th class="py-3 px-3 w-12 text-center">حذف</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="form.items.length === 0">
                <td colspan="10" class="py-12 text-center text-slate-400 bg-slate-50/50">
                  <Package class="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p class="font-bold">لا توجد مواد مضافة بعد في الطلبية</p>
                  <p class="text-[11px] mt-1">انقر على زر "إضافة صنف جديد" لإدراج المواد المطلوبة</p>
                </td>
              </tr>

              <tr 
                v-for="(it, idx) in form.items" 
                :key="idx" 
                class="hover:bg-slate-50/70 transition-colors"
              >
                <!-- Index -->
                <td class="py-3 px-3 text-center text-slate-400 font-mono font-bold">{{ idx + 1 }}</td>

                <!-- Item Code & Name Selector -->
                <td class="py-3 px-3">
                  <select 
                    v-model="it.item_code" 
                    @change="onItemSelect(it)"
                    class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs"
                    required
                  >
                    <option value="" disabled>-- اختر الصنف من الدليل --</option>
                    <option v-for="item in availableItems" :key="item.item_code" :value="item.item_code">
                      {{ item.item_code }} - {{ item.item_name }}
                    </option>
                  </select>
                  <span v-if="it.item_name" class="block text-[10px] text-slate-500 mt-0.5 truncate">
                    {{ it.item_name }}
                  </span>
                </td>

                <!-- Description -->
                <td class="py-3 px-3">
                  <input 
                    v-model="it.description" 
                    type="text" 
                    placeholder="مواصفات إضافية..."
                    class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </td>

                <!-- Quantity -->
                <td class="py-3 px-3">
                  <input 
                    v-model.number="it.qty" 
                    type="number" 
                    min="1" 
                    step="any"
                    @input="recalculateRow(it)"
                    class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-mono font-bold text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </td>

                <!-- Unit of Measure -->
                <td class="py-3 px-3">
                  <input 
                    v-model="it.uom" 
                    type="text" 
                    class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs text-center font-medium focus:outline-none"
                    required
                  />
                </td>

                <!-- Unit Rate in PR Currency -->
                <td class="py-3 px-3">
                  <input 
                    v-model.number="it.custom_rate_in_pr_currency" 
                    type="number" 
                    step="any"
                    min="0"
                    @input="recalculateRow(it)"
                    class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-left font-mono font-bold text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </td>

                <!-- Total Amount in PR Currency -->
                <td class="py-3 px-3 text-left font-mono font-bold text-slate-900 text-xs">
                  {{ (it.custom_amount_in_pr_currency || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </td>

                <!-- Project -->
                <td class="py-3 px-3">
                  <select 
                    v-model="it.project" 
                    class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
                    required
                  >
                    <option v-for="p in projects" :key="p.name" :value="p.name">
                      {{ p.name }} {{ p.project_name ? `(${p.project_name})` : '' }}
                    </option>
                  </select>
                </td>

                <!-- Donor -->
                <td class="py-3 px-3">
                  <select 
                    v-model="it.donor" 
                    class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="">-- اختياري --</option>
                    <option v-for="d in donors" :key="d" :value="d">{{ d }}</option>
                  </select>
                </td>

                <!-- Delete Row Action -->
                <td class="py-3 px-3 text-center">
                  <button 
                    type="button" 
                    @click="removeItemRow(idx)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="حذف هذا الصنف"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>

            <!-- Table Totals Footer -->
            <tfoot v-if="form.items.length > 0" class="bg-slate-50 border-t-2 border-slate-200 font-bold text-xs">
              <tr>
                <td colspan="5" class="py-3 px-4 text-left text-slate-700 font-extrabold">المجموع الإجمالي التقديري للطلب:</td>
                <td class="py-3 px-3 text-left font-mono text-sm text-red-700 font-extrabold" colspan="2">
                  {{ totalCostInPrCurrency.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} {{ form.custom_pr_currency }}
                </td>
                <td colspan="3" class="py-3 px-3 text-slate-500 font-normal text-[11px]">
                  (يعادل تقريباً: {{ totalCostInCompanyCurrency.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} USD)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- SECTION 5: شريط الملخص والتقديم النهائي -->
      <div class="p-6 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-soft">
        <div class="space-y-1">
          <h3 class="text-sm font-bold flex items-center gap-2 text-white">
            <CheckCircle2 class="w-5 h-5 text-emerald-400" />
            <span>جاهزية الطلب ومراجعته النهائية</span>
          </h3>
          <p class="text-xs text-slate-300">
            سيتم إنشاء الطلب برقم تسلسلي رسمي وسيدخل تلقائياً في مسار دورة العمل للاعتماد والمراجعة.
          </p>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <button 
            type="button" 
            @click="submitRequisition(false)"
            :disabled="submitting"
            class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors border border-slate-700"
          >
            حفظ كمسودة
          </button>

          <button 
            type="submit" 
            :disabled="submitting || form.items.length === 0"
            class="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
            <Send v-else class="w-4 h-4" />
            <span>اعتماد وتقديم الطلب اللوجستي</span>
          </button>
        </div>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { inventoryApi, authApi } from '@/api/inventory'
import { useAuthStore } from '@/stores/auth'
import { useInventoryStore } from '@/stores/inventory'
import { 
  ArrowRight, 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Package 
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const inventoryStore = useInventoryStore()

const submitting = ref(false)
const errorMessage = ref('')

// Master Data Dropdown Lists
const branches = ref(['المركز الرئيسي- HQ', 'Amran Branch', 'Raymah Branch'])
const itemGroups = ref(['NFIs', 'Food Items', 'Medical Equipment', 'المواد الخام', 'الخدمات', 'مستهلك'])
const supplierGroups = ref(['NFIs', 'Food', 'معدات طبية', 'الأدوية والمستلزمات الطبية', 'الخدمات', 'المواد الخام', 'مقاولين'])
const costCenters = ref(['NSD - YRCS', 'Health - YRCS', 'DM - YRCS', 'WASH - YRCS', 'Communication - YRCS', 'PMER - YRCS', 'Main - YRCS'])
const projects = ref([
  { name: 'PROJ-0002', project_name: 'IFRC Humanitarian Response' },
  { name: 'PROJ-0004', project_name: 'ICRC Support' },
  { name: 'PROJ-0006', project_name: 'German Red Cross' },
  { name: 'PROJ-0012', project_name: 'Emergency Appeal' }
])
const donors = ref(['muhammad.bilal@ifrc.org', 'san_coopns_unit_group@icrc.org', 'w.abbas@drk.de', 'info@NoRC.org', 'alssi@rodekors.dk'])
const budgetHoldersList = ref([
  { email: 'abdelkareem@yemenredcrescent.org', name: 'عبدالكريم السلول (منسق NSD ومسؤول الموازنة)' },
  { email: 'log-co@yemenredcrescent.org', name: 'منسق اللوجستيك وسلاسل الإمداد' },
  { email: 'executive-director@yemenredcrescent.org', name: 'المدير التنفيذي (CEO)' }
])

// Helper to format date YYYY-MM-DD
function getTodayString() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

function getFutureDateString(days = 7) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

// Main Form Model
const form = ref({
  naming_series: 'MAT-MR-.YYYY.-',
  title: 'طلب شراء مواد وأصناف',
  material_request_type: 'Purchase',
  company: 'Yemen Red Crescent Society',
  transaction_date: getTodayString(),
  schedule_date: getFutureDateString(7),
  custom_priority: 'Normal',
  custom_branch: 'المركز الرئيسي- HQ',
  custom_consignee_address: 'المركز الرئيسي - صنعاء',
  custom_dellivery_address: 'مخازن الجمعية المركزية - التلفزيون',
  default_warehouse: 'المخزن الرئيسي - YRCS',
  custom_pr_currency: 'USD',
  custom_exchange_rate: 1.0,
  custom_item_group: 'NFIs',
  custom_supplier_group: 'NFIs',
  cost_center: 'NSD - YRCS',
  custom_budget_holder_user: 'abdelkareem@yemenredcrescent.org',
  items: []
})

const availableItems = computed(() => {
  return inventoryStore.items || []
})

const warehousesList = computed(() => {
  return inventoryStore.warehouses || [
    { name: 'المخزن الرئيسي - YRCS', warehouse_name: 'المخزن الرئيسي - YRCS' },
    { name: 'مخزن التلفزيون - YRCS', warehouse_name: 'مخزن التلفزيون - YRCS' },
    { name: 'مخزن صرف - YRCS', warehouse_name: 'مخزن صرف - YRCS' }
  ]
})

onMounted(async () => {
  // Ensure items and warehouses are loaded
  if (inventoryStore.items.length === 0) {
    inventoryStore.fetchItems({ limit: 100 })
  }
  if (inventoryStore.warehouses.length === 0) {
    inventoryStore.fetchWarehouses()
  }

  // Load active master data from backend
  try {
    const [bRes, gRes, sgRes, pRes, dRes, ccRes] = await Promise.allSettled([
      inventoryApi.getBranches(),
      inventoryApi.getItemGroups(),
      inventoryApi.getSupplierGroups(),
      inventoryApi.getProjects(),
      inventoryApi.getDonors(),
      inventoryApi.getCostCenters()
    ])

    if (bRes.status === 'fulfilled' && bRes.value.data?.data) {
      branches.value = bRes.value.data.data.map(b => b.name)
    }
    if (gRes.status === 'fulfilled' && gRes.value.data?.data) {
      itemGroups.value = gRes.value.data.data.map(g => g.name)
    }
    if (sgRes.status === 'fulfilled' && sgRes.value.data?.data) {
      supplierGroups.value = sgRes.value.data.data.map(sg => sg.name)
    }
    if (pRes.status === 'fulfilled' && pRes.value.data?.data) {
      projects.value = pRes.value.data.data
    }
    if (dRes.status === 'fulfilled' && dRes.value.data?.data) {
      donors.value = dRes.value.data.data.map(d => d.name)
    }
    if (ccRes.status === 'fulfilled' && ccRes.value.data?.data) {
      costCenters.value = ccRes.value.data.data.map(c => c.name)
    }
  } catch (e) {
    // defaults are already populated
  }

  // Initialize with 1 empty item row
  if (form.value.items.length === 0) {
    addItemRow()
  }
})

function addItemRow() {
  form.value.items.push({
    item_code: '',
    item_name: '',
    description: '',
    schedule_date: form.value.schedule_date || getFutureDateString(7),
    qty: 1,
    uom: 'Nos',
    stock_uom: 'Nos',
    conversion_factor: 1.0,
    warehouse: form.value.default_warehouse || 'المخزن الرئيسي - YRCS',
    custom_pr_currency: form.value.custom_pr_currency || 'USD',
    custom_rate_in_pr_currency: 0,
    rate: 0,
    custom_amount_in_pr_currency: 0,
    amount: 0,
    branch: form.value.custom_branch || 'المركز الرئيسي- HQ',
    project: projects.value[0]?.name || 'PROJ-0002',
    donor: donors.value[0] || 'muhammad.bilal@ifrc.org',
    cost_center: form.value.cost_center || 'NSD - YRCS'
  })
}

function removeItemRow(idx) {
  form.value.items.splice(idx, 1)
}

function onItemSelect(row) {
  const found = availableItems.value.find(it => it.item_code === row.item_code)
  if (found) {
    row.item_name = found.item_name || found.item_code
    row.description = found.description || found.item_name
    row.stock_uom = found.stock_uom || 'Nos'
    row.uom = found.stock_uom || 'Nos'
    row.custom_rate_in_pr_currency = Number(found.standard_rate || found.valuation_rate || 0)
    recalculateRow(row)
  }
}

function recalculateRow(row) {
  const qty = Number(row.qty) || 0
  const rateInPr = Number(row.custom_rate_in_pr_currency) || 0
  const exRate = Number(form.value.custom_exchange_rate) || 1.0

  row.custom_amount_in_pr_currency = qty * rateInPr
  row.rate = rateInPr * exRate
  row.amount = qty * row.rate
}

function recalculateItemRates() {
  form.value.items.forEach(it => recalculateRow(it))
}

function applyDefaultWarehouseToItems() {
  form.value.items.forEach(it => {
    it.warehouse = form.value.default_warehouse
  })
}

function updateExchangeRate() {
  if (form.value.custom_pr_currency === 'USD') {
    form.value.custom_exchange_rate = 1.0
  } else if (form.value.custom_pr_currency === 'YER') {
    form.value.custom_exchange_rate = 0.0019 // Example rate or leave editable
  } else if (form.value.custom_pr_currency === 'SAR') {
    form.value.custom_exchange_rate = 0.27
  }
  form.value.items.forEach(it => {
    it.custom_pr_currency = form.value.custom_pr_currency
  })
  recalculateItemRates()
}

const totalCostInPrCurrency = computed(() => {
  return form.value.items.reduce((sum, it) => sum + (Number(it.custom_amount_in_pr_currency) || 0), 0)
})

const totalCostInCompanyCurrency = computed(() => {
  return form.value.items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0)
})

async function submitRequisition(isSubmitForApproval = true) {
  errorMessage.value = ''

  // Validations
  if (!form.value.items || form.value.items.length === 0) {
    errorMessage.value = 'يجب إضافة صنف واحد على الأقل في جدول المواد.'
    return
  }

  for (let i = 0; i < form.value.items.length; i++) {
    const it = form.value.items[i]
    if (!it.item_code) {
      errorMessage.value = `يرجى اختيار الصنف في السطر رقم (${i + 1}).`
      return
    }
    if (!it.qty || it.qty <= 0) {
      errorMessage.value = `الكمية غير صالحة للصنف في السطر رقم (${i + 1}).`
      return
    }
  }

  submitting.value = true

  try {
    const payload = {
      doctype: 'Material Request',
      naming_series: form.value.naming_series || 'MAT-MR-.YYYY.-',
      title: form.value.title || form.value.material_request_type,
      material_request_type: form.value.material_request_type,
      company: form.value.company || 'Yemen Red Crescent Society',
      transaction_date: form.value.transaction_date,
      schedule_date: form.value.schedule_date,
      custom_branch: form.value.custom_branch,
      custom_consignee_address: form.value.custom_consignee_address,
      custom_dellivery_address: form.value.custom_dellivery_address,
      custom_priority: form.value.custom_priority,
      custom_pr_currency: form.value.custom_pr_currency,
      custom_exchange_rate: Number(form.value.custom_exchange_rate) || 1.0,
      custom_item_group: form.value.custom_item_group,
      custom_supplier_group: form.value.custom_supplier_group,
      cost_center: form.value.cost_center,
      custom_budget_holder_user: form.value.custom_budget_holder_user || undefined,
      custom_total_cost_in_pr_currency: totalCostInPrCurrency.value,
      custom_total_cost_in_company_currency: totalCostInCompanyCurrency.value,
      items: form.value.items.map(it => ({
        doctype: 'Material Request Item',
        item_code: it.item_code,
        item_name: it.item_name,
        description: it.description || it.item_name,
        schedule_date: it.schedule_date || form.value.schedule_date,
        qty: Number(it.qty) || 1,
        stock_uom: it.stock_uom || 'Nos',
        uom: it.uom || it.stock_uom || 'Nos',
        conversion_factor: Number(it.conversion_factor) || 1.0,
        warehouse: it.warehouse || form.value.default_warehouse,
        custom_pr_currency: form.value.custom_pr_currency,
        custom_rate_in_pr_currency: Number(it.custom_rate_in_pr_currency) || 0,
        rate: Number(it.rate) || 0,
        custom_amount_in_pr_currency: Number(it.custom_amount_in_pr_currency) || 0,
        amount: Number(it.amount) || 0,
        branch: it.branch || form.value.custom_branch,
        project: it.project || undefined,
        donor: it.donor || undefined,
        cost_center: it.cost_center || form.value.cost_center
      }))
    }

    const res = await inventoryApi.createMaterialRequest(payload)
    const newDoc = res.data?.data

    if (newDoc?.name) {
      // If user chose to submit for approval, apply workflow action if applicable
      if (isSubmitForApproval) {
        try {
          await inventoryApi.applyWorkflowAction(newDoc, 'Submit')
        } catch (wfErr) {
          console.warn('Initial workflow trigger info:', wfErr)
        }
      }

      // Navigate to detail view
      router.push(`/logistics/${newDoc.name}`)
    } else {
      router.push('/logistics')
    }
  } catch (err) {
    console.error('Failed to create Material Request:', err)
    errorMessage.value = err.response?.data?._server_messages 
      ? JSON.parse(err.response.data._server_messages).map(m => JSON.parse(m).message).join(' - ')
      : err.friendlyMessage || err.message || 'حدث خطأ أثناء حفظ الطلب في النظام.'
  } finally {
    submitting.value = false
  }
}
</script>
