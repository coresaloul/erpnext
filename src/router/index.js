import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import AppLayout from '@/components/layout/AppLayout.vue'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ItemsView from '@/views/ItemsView.vue'
import WarehousesView from '@/views/WarehousesView.vue'
import StockBalanceView from '@/views/StockBalanceView.vue'
import MaterialRequestsView from '@/views/MaterialRequestsView.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true }
  },
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView,
        meta: { title: 'Operations Dashboard', subtitle: 'Yemen Red Crescent Society' }
      },
      {
        path: 'items',
        name: 'items',
        component: ItemsView,
        meta: { title: 'Stock Items Master', subtitle: 'Humanitarian supplies and items catalog' }
      },
      {
        path: 'warehouses',
        name: 'warehouses',
        component: WarehousesView,
        meta: { title: 'Warehouses & Facilities', subtitle: 'Storage facilities and distribution centers' }
      },
      {
        path: 'balances',
        name: 'balances',
        component: StockBalanceView,
        meta: { title: 'Live Stock Balances', subtitle: 'Bin quantities and available units' }
      },
      {
        path: 'requests',
        name: 'requests',
        component: MaterialRequestsView,
        meta: { title: 'Material Requests', subtitle: 'Supply transfers and purchase requisitions' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (!to.meta.public && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
