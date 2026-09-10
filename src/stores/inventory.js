import { defineStore } from 'pinia'
import { inventoryApi } from '@/api/inventory'

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    items: [],
    itemGroups: [],
    warehouses: [],
    stockBalances: [],
    materialRequests: [],
    loading: false,
    error: null,
    selectedWarehouse: '',
    searchQuery: '',
    selectedGroup: '',
    lastUpdated: null,
  }),

  getters: {
    totalItemCount: (state) => state.items.length,
    
    totalWarehousesCount: (state) => state.warehouses.filter(w => !w.is_group).length,

    totalStockValue: (state) => {
      return state.stockBalances.reduce((sum, b) => sum + (Number(b.stock_value) || (Number(b.actual_qty) * Number(b.valuation_rate)) || 0), 0)
    },

    totalActualQty: (state) => {
      return state.stockBalances.reduce((sum, b) => sum + (Number(b.actual_qty) || 0), 0)
    },

    lowStockItems: (state) => {
      // Items where total actual qty <= safety_stock (and safety_stock > 0)
      return state.items.filter(item => {
        const safety = Number(item.safety_stock) || 0
        if (safety === 0) return false
        const totalQty = state.stockBalances
          .filter(b => b.item_code === item.item_code)
          .reduce((sum, b) => sum + Number(b.actual_qty || 0), 0)
        return totalQty > 0 && totalQty <= safety
      })
    },

    outOfStockCount: (state) => {
      return state.items.filter(item => {
        const totalQty = state.stockBalances
          .filter(b => b.item_code === item.item_code)
          .reduce((sum, b) => sum + Number(b.actual_qty || 0), 0)
        return totalQty <= 0
      }).length
    },

    filteredItems: (state) => {
      return state.items.filter(item => {
        const matchesSearch = !state.searchQuery || 
          item.item_name?.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          item.item_code?.toLowerCase().includes(state.searchQuery.toLowerCase())
        const matchesGroup = !state.selectedGroup || item.item_group === state.selectedGroup
        return matchesSearch && matchesGroup
      })
    },

    stockByWarehouse: (state) => {
      const map = {}
      state.stockBalances.forEach(b => {
        if (!map[b.warehouse]) {
          map[b.warehouse] = {
            warehouse: b.warehouse,
            totalItems: 0,
            totalQty: 0,
            totalValue: 0
          }
        }
        map[b.warehouse].totalItems += 1
        map[b.warehouse].totalQty += Number(b.actual_qty) || 0
        map[b.warehouse].totalValue += Number(b.stock_value) || (Number(b.actual_qty) * Number(b.valuation_rate)) || 0
      })
      return Object.values(map)
    }
  },

  actions: {
    async fetchItems() {
      try {
        const res = await inventoryApi.getItems({ limit: 100 })
        this.items = res.data?.data || []
      } catch (err) {
        console.error('Failed to fetch items:', err)
        throw err
      }
    },

    async fetchWarehouses() {
      try {
        const res = await inventoryApi.getWarehouses()
        this.warehouses = res.data?.data || []
      } catch (err) {
        console.error('Failed to fetch warehouses:', err)
      }
    },

    async fetchStockBalances() {
      try {
        const res = await inventoryApi.getStockBalances({ limit: 200 })
        this.stockBalances = res.data?.data || []
      } catch (err) {
        console.error('Failed to fetch stock balances:', err)
      }
    },

    async fetchItemGroups() {
      try {
        const res = await inventoryApi.getItemGroups()
        this.itemGroups = res.data?.data || []
      } catch (err) {
        console.error('Failed to fetch item groups:', err)
      }
    },

    async fetchMaterialRequests() {
      try {
        const res = await inventoryApi.getMaterialRequests({ limit: 50 })
        this.materialRequests = res.data?.data || []
      } catch (err) {
        console.error('Failed to fetch material requests:', err)
      }
    },

    async loadAll() {
      this.loading = true
      this.error = null
      try {
        await Promise.allSettled([
          this.fetchItems(),
          this.fetchWarehouses(),
          this.fetchStockBalances(),
          this.fetchItemGroups(),
          this.fetchMaterialRequests(),
        ])
        this.lastUpdated = new Date()
      } catch (err) {
        this.error = err.friendlyMessage || 'Failed to load inventory data'
      } finally {
        this.loading = false
      }
    }
  }
})
