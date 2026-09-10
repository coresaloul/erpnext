import apiClient from './client'

export const authApi = {
  login(usr, pwd) {
    return apiClient.post('/api/method/login', { usr, pwd })
  },
  logout() {
    return apiClient.post('/api/method/logout')
  },
  getLoggedUser() {
    return apiClient.get('/api/method/frappe.auth.get_logged_user')
  },
  getUserDetails(email) {
    return apiClient.get(`/api/resource/User/${encodeURIComponent(email)}`)
  },
  getBootInfo() {
    return apiClient.get('/api/method/frappe.boot.get_bootinfo')
  }
}

export const inventoryApi = {
  // Items
  getItems({ limit = 50, start = 0, search = '', itemGroup = '' } = {}) {
    const filters = []
    if (search) {
      filters.push(['item_name', 'like', `%${search}%`])
    }
    if (itemGroup) {
      filters.push(['item_group', '=', itemGroup])
    }

    const params = {
      fields: JSON.stringify([
        'name',
        'item_code',
        'item_name',
        'item_group',
        'stock_uom',
        'disabled',
        'is_stock_item',
        'valuation_rate',
        'standard_rate',
        'safety_stock',
        'image',
        'description',
        'modified'
      ]),
      limit_page_length: limit,
      limit_start: start,
      order_by: 'modified desc'
    }

    if (filters.length > 0) {
      params.filters = JSON.stringify(filters)
    }

    return apiClient.get('/api/resource/Item', { params })
  },

  getItem(itemCode) {
    return apiClient.get(`/api/resource/Item/${encodeURIComponent(itemCode)}`)
  },

  createItem(itemData) {
    return apiClient.post('/api/resource/Item', itemData)
  },

  // Warehouses
  getWarehouses({ company = 'Yemen Red Crescent Society' } = {}) {
    const params = {
      fields: JSON.stringify([
        'name',
        'warehouse_name',
        'company',
        'is_group',
        'parent_warehouse',
        'disabled'
      ]),
      filters: JSON.stringify([
        ['disabled', '=', 0]
      ]),
      limit_page_length: 100,
      order_by: 'warehouse_name asc'
    }
    return apiClient.get('/api/resource/Warehouse', { params })
  },

  // Stock Balances (Bin)
  getStockBalances({ warehouse = '', itemCode = '', limit = 100 } = {}) {
    const filters = []
    if (warehouse) {
      filters.push(['warehouse', '=', warehouse])
    }
    if (itemCode) {
      filters.push(['item_code', '=', itemCode])
    }

    const params = {
      fields: JSON.stringify([
        'name',
        'item_code',
        'warehouse',
        'actual_qty',
        'reserved_qty',
        'ordered_qty',
        'projected_qty',
        'valuation_rate',
        'stock_uom',
        'stock_value'
      ]),
      limit_page_length: limit,
      order_by: 'actual_qty desc'
    }

    if (filters.length > 0) {
      params.filters = JSON.stringify(filters)
    }

    return apiClient.get('/api/resource/Bin', { params })
  },

  // Item Groups
  getItemGroups() {
    const params = {
      fields: JSON.stringify(['name', 'item_group_name', 'is_group']),
      limit_page_length: 50,
      order_by: 'item_group_name asc'
    }
    return apiClient.get('/api/resource/Item Group', { params })
  },

  // Material Requests (Requisitions / Movement)
  getMaterialRequests({ limit = 50, filters = [] } = {}) {
    const defaultFields = [
      'name',
      'workflow_state',
      'material_request_type',
      'status',
      'transaction_date',
      'schedule_date',
      'company',
      'owner',
      'modified',
      'creation',
      '_assign',
      'custom_budget_holder_user',
      'custom_branch',
      'custom_cost_center',
      'custom_priority',
      'custom_pr_currency',
      'custom_total_cost_in_pr_currency'
    ]

    const params = {
      fields: JSON.stringify(defaultFields),
      limit_page_length: limit,
      order_by: 'modified desc'
    }

    if (filters.length > 0) {
      params.filters = JSON.stringify(filters)
    }

    return apiClient.get('/api/resource/Material Request', { params })
  },

  getRequisitionDetails(name) {
    return apiClient.get(`/api/resource/Material Request/${encodeURIComponent(name)}`)
  },

  applyWorkflowAction(doc, action) {
    return apiClient.post('/api/method/frappe.model.workflow.apply_workflow', {
      doc,
      action
    })
  },

  createMaterialRequest(requestData) {
    return apiClient.post('/api/resource/Material Request', requestData)
  },

  // Stock Entries (Dispatches / Receipts)
  getStockEntries({ limit = 30 } = {}) {
    const params = {
      fields: JSON.stringify([
        'name',
        'stock_entry_type',
        'posting_date',
        'posting_time',
        'from_warehouse',
        'to_warehouse',
        'total_amount',
        'docstatus',
        'purpose'
      ]),
      limit_page_length: limit,
      order_by: 'posting_date desc'
    }
    return apiClient.get('/api/resource/Stock Entry', { params })
  }
}
