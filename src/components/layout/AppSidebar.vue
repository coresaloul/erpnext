<template>
  <aside 
    class="fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 select-none shadow-sm"
    :class="[isCollapsed ? 'w-20' : 'w-64']"
  >
    <!-- Branding & Logo -->
    <div class="h-16 px-4 flex items-center justify-between border-b border-slate-100">
      <router-link to="/" class="flex items-center gap-3 overflow-hidden">
        <div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100 shadow-sm p-1.5">
          <img src="@/assets/logo.svg" alt="YRCS" class="w-full h-full object-contain" />
        </div>
        <div v-if="!isCollapsed" class="flex flex-col overflow-hidden">
          <span class="font-bold text-sm text-slate-900 tracking-tight leading-tight truncate">YRCS Inventory</span>
          <span class="text-[11px] text-red-600 font-medium leading-none mt-0.5 truncate">الهلال الأحمر اليمني</span>
        </div>
      </router-link>

      <button 
        @click="isCollapsed = !isCollapsed"
        class="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
        title="Toggle Sidebar"
      >
        <ChevronLeft v-if="!isCollapsed" class="w-4 h-4" />
        <ChevronRight v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- Navigation Links -->
    <div class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
      <p v-if="!isCollapsed" class="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
        العمليات والطلبات اللوجستية
      </p>

      <!-- Logistics Requisitions (Featured) -->
      <router-link 
        to="/logistics"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group"
        :class="[
          $route.path === '/logistics' 
            ? 'bg-red-600 text-white shadow-sm' 
            : 'text-slate-700 hover:bg-red-50 hover:text-red-700'
        ]"
      >
        <ClipboardCheck class="w-5 h-5 shrink-0" :class="[$route.path === '/logistics' ? 'text-white' : 'text-red-600']" />
        <span v-if="!isCollapsed" class="truncate">الطلبات اللوجستية</span>
        
        <span 
          v-if="!isCollapsed && logisticsStore.overdueCount > 0"
          class="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full"
          :class="[$route.path === '/logistics' ? 'bg-white text-red-700' : 'bg-rose-100 text-rose-700 animate-pulse border border-rose-200']"
          title="طلبات متأخرة > 24 ساعة"
        >
          {{ logisticsStore.overdueCount }} متأخر
        </span>
      </router-link>

      <router-link 
        v-for="item in navItems" 
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group"
        :class="[
          $route.path === item.to 
            ? 'bg-red-50 text-red-700 font-semibold shadow-xs border border-red-100' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        ]"
      >
        <component 
          :is="item.icon" 
          class="w-5 h-5 shrink-0 transition-colors"
          :class="[$route.path === item.to ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-600']"
        />
        <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>
      </router-link>

      <div class="pt-4 mt-4 border-t border-slate-100">
        <p v-if="!isCollapsed" class="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          System Access
        </p>

        <a 
          href="http://13.140.163.199/app" 
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group"
        >
          <ExternalLink class="w-5 h-5 text-slate-400 group-hover:text-slate-600 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">ERPNext Desk</span>
        </a>
      </div>
    </div>

    <!-- Server Status Indicator -->
    <div class="px-3 py-2 bg-slate-50/70 border-t border-slate-100">
      <div class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
        <span v-if="!isCollapsed" class="truncate text-[11px]">ERPNext 15.111 Live</span>
      </div>
    </div>

    <!-- User Profile & Logout -->
    <div class="p-3 border-t border-slate-100 bg-white">
      <div class="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
        <div class="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
          {{ userInitials }}
        </div>
        
        <div v-if="!isCollapsed" class="flex-1 min-w-0 overflow-hidden">
          <p class="text-xs font-semibold text-slate-900 truncate leading-tight">{{ authStore.fullName || 'User' }}</p>
          <p class="text-[11px] text-slate-400 truncate mt-0.5">{{ authStore.user || '' }}</p>
        </div>

        <button 
          v-if="!isCollapsed"
          @click="handleLogout"
          class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Sign Out"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLogisticsStore } from '@/stores/logistics'
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  Layers, 
  ClipboardCheck, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-vue-next'

const authStore = useAuthStore()
const logisticsStore = useLogisticsStore()
const router = useRouter()
const isCollapsed = ref(false)

const navItems = [
  { label: 'لوحة المؤشرات العامة', to: '/', icon: LayoutDashboard },
  { label: 'دليل الأصناف والمواد', to: '/items', icon: Package },
  { label: 'المخازن ومراكز التوزيع', to: '/warehouses', icon: Warehouse },
  { label: 'أرصدة المخزون الحية', to: '/balances', icon: Layers },
]

const userInitials = computed(() => {
  const name = authStore.fullName || authStore.user || 'U'
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
