<template>
  <aside 
    class="fixed inset-y-0 right-0 z-30 flex flex-col bg-white border-l border-slate-200/80 transition-all duration-300 select-none shadow-sm"
    :class="[uiStore.isSidebarCollapsed ? 'w-20' : 'w-64']"
  >
    <!-- Branding & Official Logo -->
    <div class="h-16 px-4 flex items-center justify-between border-b border-slate-100">
      <router-link to="/" class="flex items-center gap-3 overflow-hidden">
        <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border-2 border-red-100 shadow-sm p-0.5 overflow-hidden">
          <img src="@/assets/yrcs-logo.png" alt="YRCS" class="w-full h-full object-contain" />
        </div>
        <div v-if="!uiStore.isSidebarCollapsed" class="flex flex-col overflow-hidden text-right">
          <span class="font-bold text-xs text-slate-900 tracking-tight leading-tight truncate">جمعية الهلال الأحمر اليمني</span>
          <span class="text-[10px] text-red-600 font-bold leading-none mt-1 truncate">YRCS Supply Chain & Logistics</span>
        </div>
      </router-link>

      <button 
        @click="uiStore.toggleSidebar()"
        class="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
        title="طي / توسيع القائمة"
      >
        <ChevronRight v-if="!uiStore.isSidebarCollapsed" class="w-4 h-4" />
        <ChevronLeft v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- Navigation Links -->
    <div class="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
      <p v-if="!uiStore.isSidebarCollapsed" class="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
        {{ authStore.hasFullAccess ? 'إدارة سلاسل الإمداد والمخازن' : 'الطلبات والخدمات اللوجستية' }}
      </p>

      <!-- Logistics Requisitions (Featured) -->
      <router-link 
        to="/logistics"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group"
        :class="[
          $route.path.startsWith('/logistics')
            ? 'bg-red-600 text-white shadow-sm' 
            : 'text-slate-700 hover:bg-red-50 hover:text-red-700'
        ]"
      >
        <ClipboardCheck class="w-5 h-5 shrink-0" :class="[$route.path.startsWith('/logistics') ? 'text-white' : 'text-red-600']" />
        <span v-if="!uiStore.isSidebarCollapsed" class="truncate">
          {{ authStore.hasFullAccess ? 'الطلبات اللوجستية' : 'طلباتي والطلبات اللوجستية' }}
        </span>
        
        <span 
          v-if="!uiStore.isSidebarCollapsed && logisticsStore.overdueCount > 0"
          class="mr-auto px-2 py-0.5 text-[10px] font-bold rounded-full"
          :class="[$route.path.startsWith('/logistics') ? 'bg-white text-red-700' : 'bg-rose-100 text-rose-700 animate-pulse border border-rose-200']"
          title="طلبات متأخرة > 24 ساعة"
        >
          {{ logisticsStore.overdueCount }} متأخر
        </span>
      </router-link>

      <router-link 
        v-for="item in navItems" 
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group"
        :class="[
          $route.path === item.to 
            ? 'bg-red-50 text-red-700 font-bold shadow-2xs border border-red-100' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        ]"
      >
        <component 
          :is="item.icon" 
          class="w-5 h-5 shrink-0 transition-colors"
          :class="[$route.path === item.to ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-600']"
        />
        <span v-if="!uiStore.isSidebarCollapsed" class="truncate">{{ item.label }}</span>
      </router-link>

      <div class="pt-4 mt-4 border-t border-slate-100">
        <p v-if="!uiStore.isSidebarCollapsed" class="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          الأنظمة الخارجية
        </p>

        <a 
          href="http://13.140.163.199/app" 
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group"
        >
          <ExternalLink class="w-5 h-5 text-slate-400 group-hover:text-slate-600 shrink-0" />
          <span v-if="!uiStore.isSidebarCollapsed" class="truncate">مكتب ERPNext المكتبي</span>
        </a>
      </div>
    </div>

    <!-- Server Status Indicator -->
    <div class="px-3 py-2.5 bg-slate-50/80 border-t border-slate-100">
      <div class="flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-semibold text-slate-600">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
        <span v-if="!uiStore.isSidebarCollapsed" class="truncate text-[11px] font-mono">ERPNext v15 Live (13.140.163.199)</span>
      </div>
    </div>

    <!-- User Profile & Logout -->
    <div class="p-3 border-t border-slate-100 bg-white">
      <div class="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
        <div class="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
          {{ userInitials }}
        </div>
        
        <div v-if="!uiStore.isSidebarCollapsed" class="flex-1 min-w-0 overflow-hidden text-right">
          <p class="text-xs font-bold text-slate-900 truncate leading-tight">{{ authStore.fullName || 'المستخدم' }}</p>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span 
              class="text-[10px] font-bold px-1.5 py-0.2 rounded"
              :class="userRoleBadge.badgeClass"
            >
              {{ userRoleBadge.label }}
            </span>
          </div>
        </div>

        <button 
          v-if="!uiStore.isSidebarCollapsed"
          @click="handleLogout"
          class="mr-auto p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="تسجيل الخروج"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLogisticsStore } from '@/stores/logistics'
import { useUiStore } from '@/stores/ui'
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  Layers, 
  ClipboardCheck, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Send,
  Lock
} from 'lucide-vue-next'

const authStore = useAuthStore()
const logisticsStore = useLogisticsStore()
const uiStore = useUiStore()
const router = useRouter()

const navItems = computed(() => {
  if (authStore.hasFullAccess) {
    return [
      { label: 'لوحة المؤشرات العامة', to: '/', icon: LayoutDashboard },
      { label: 'دليل الأصناف والمواد', to: '/items', icon: Package },
      { label: 'المخازن ومراكز التوزيع', to: '/warehouses', icon: Warehouse },
      { label: 'أرصدة المخزون الحية', to: '/balances', icon: Layers },
      { label: 'طلبات الصرف والتحويل', to: '/requests', icon: Send },
    ]
  } else {
    return [
      { label: 'دليل الأصناف لطلب المواد', to: '/items', icon: Package },
      { label: 'المخازن ومراكز التوزيع', to: '/warehouses', icon: Warehouse },
      { label: 'طلبات الصرف الخاصة بي', to: '/requests', icon: Send },
    ]
  }
})

const userRoleBadge = computed(() => {
  if (authStore.isCEO) {
    return { label: 'المدير التنفيذي (CEO)', badgeClass: 'bg-purple-100 text-purple-800' }
  }
  if (authStore.isLogistics) {
    return { label: 'إدارة اللوجستيك', badgeClass: 'bg-emerald-100 text-emerald-800' }
  }
  const dept = authStore.currentEmployee?.department || ''
  return { 
    label: dept ? dept.replace(' - YRCS', '') : 'موظف الجمعية', 
    badgeClass: 'bg-blue-100 text-blue-800' 
  }
})

const userInitials = computed(() => {
  const name = authStore.fullName || authStore.user || 'Y'
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>
