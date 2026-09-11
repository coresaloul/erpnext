/**
 * Permissions and Access Control Utility for YRCS Supply Chain & Logistics
 */

/**
 * Check if the user has General Director / Executive Director (CEO) authority
 */
export function isExecutiveDirector(authStore) {
  if (!authStore || !authStore.user) return false

  const user = authStore.user.toLowerCase()
  const roles = authStore.roles || []
  const designation = (authStore.currentEmployee?.designation || '').toLowerCase()

  if (
    user === 'executive-director@yemenredcrescent.org' ||
    user === 'administrator' ||
    roles.includes('CEO') ||
    roles.includes('System Manager') ||
    roles.includes('Administrator') ||
    designation.includes('executive director') ||
    designation.includes('general director') ||
    designation.includes('secretary general')
  ) {
    return true
  }

  return false
}

/**
 * Check if the user is the Logistics Coordinator or a member of the Logistics & Supply Chain team
 */
export function isLogisticsTeam(authStore) {
  if (!authStore || !authStore.user) return false

  const user = authStore.user.toLowerCase()
  const roles = authStore.roles || []
  const dept = (authStore.currentEmployee?.department || '').toLowerCase()
  const reportsTo = authStore.currentEmployee?.reports_to || ''
  const designation = (authStore.currentEmployee?.designation || '').toLowerCase()

  // Logistics Coordinator direct account
  if (user === 'log-co@yemenredcrescent.org') {
    return true
  }

  // Logistics specific roles
  const logisticsRoles = [
    'Stock Manager',
    'Stock User',
    'Purchase Manager',
    'Purchase Master Manager',
    'Purchase User',
    'Fleet Manager',
    'Delivery Manager',
    'Delivery User',
    'Item Manager'
  ]

  if (logisticsRoles.some(role => roles.includes(role))) {
    return true
  }

  // Logistics department or reporting to Logistics Coordinator (HR-EMP-00013)
  if (
    dept.includes('logistics') ||
    dept.includes('supply') ||
    reportsTo === 'HR-EMP-00013' ||
    designation.includes('logistics') ||
    designation.includes('logastic') ||
    designation.includes('warehouse') ||
    designation.includes('procurement') ||
    designation.includes('fleet')
  ) {
    return true
  }

  return false
}

/**
 * Check if the user has full unrestricted access to all logistics requisitions and warehouses
 */
export function hasFullAccess(authStore) {
  return isExecutiveDirector(authStore) || isLogisticsTeam(authStore)
}

/**
 * Check if an individual Material Request is visible to the given user based on:
 * 1. Full access (CEO / Logistics Team)
 * 2. Own request (Owner / Requester)
 * 3. Subordinate employee's request
 * 4. User is designated Budget Holder
 * 5. Current workflow action matching user role
 * 6. User is directly assigned in _assign
 */
export function canAccessRequisition(req, authStore) {
  if (!req || !authStore) return false

  // 1. Full access
  if (hasFullAccess(authStore)) return true

  const currentUser = (authStore.user || '').toLowerCase()
  const reqOwner = (req.owner || '').toLowerCase()
  const budgetHolder = (req.custom_budget_holder_user || '').toLowerCase()

  // 2. Own request
  if (reqOwner === currentUser) return true

  // 3. Subordinates in employee hierarchy
  const subEmails = (authStore.subordinateEmails || []).map(e => e.toLowerCase())
  if (subEmails.includes(reqOwner)) return true

  // 4. Designated Budget Holder
  if (budgetHolder && budgetHolder === currentUser) return true

  // 5. Direct ToDo assignment in _assign
  if (req._assign) {
    try {
      const assigned = typeof req._assign === 'string' ? JSON.parse(req._assign) : req._assign
      if (Array.isArray(assigned) && assigned.some(a => a.toLowerCase() === currentUser)) {
        return true
      }
    } catch (e) {
      // ignore
    }
  }

  // 6. Workflow stage matching user role
  const state = req.workflow_state || req.status || ''
  const roles = authStore.roles || []

  if (state === 'Pending at Budget.H' && (roles.includes('Budget Holder') || budgetHolder === currentUser)) {
    return true
  }

  if (state === 'Pending at Finance' && (roles.includes('Accounts Manager') || roles.includes('Accounts User'))) {
    return true
  }

  if (state === 'Pending at CEO' && isExecutiveDirector(authStore)) {
    return true
  }

  if (state === 'Pending at Requester' && (reqOwner === currentUser || subEmails.includes(reqOwner))) {
    return true
  }

  return false
}

/**
 * Determine the user's relationship / role relative to a specific requisition
 */
export function getRequisitionRelation(req, authStore) {
  if (!req || !authStore) return { type: 'NONE', label: 'غير محدد' }

  const currentUser = (authStore.user || '').toLowerCase()
  const reqOwner = (req.owner || '').toLowerCase()
  const budgetHolder = (req.custom_budget_holder_user || '').toLowerCase()
  const subEmails = (authStore.subordinateEmails || []).map(e => e.toLowerCase())

  if (reqOwner === currentUser) {
    return { type: 'OWN', label: 'طلبك الشخصي', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' }
  }

  if (subEmails.includes(reqOwner)) {
    return { type: 'SUBORDINATE', label: 'طلب موظف تابع لك', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  }

  if (budgetHolder && budgetHolder === currentUser) {
    return { type: 'BUDGET_HOLDER', label: 'مسؤول الموازنة المعين', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' }
  }

  const state = req.workflow_state || req.status || ''
  const roles = authStore.roles || []
  if (state === 'Pending at Budget.H' && roles.includes('Budget Holder')) {
    return { type: 'WORKFLOW_ACTION', label: 'بانتظار اعتماد الموازنة', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' }
  }

  if (hasFullAccess(authStore)) {
    return { type: 'ADMIN', label: 'صلاحية إدارة اللوجستيك', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' }
  }

  return { type: 'SCOPED', label: 'ضمن صلاحياتك', badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' }
}

/**
 * Describe overall access scope for user interface banners
 */
export function getUserScopeDescriptor(authStore) {
  if (!authStore) return { type: 'SCOPED', title: 'صلاحية عادية', subtitle: '' }

  if (isExecutiveDirector(authStore)) {
    return {
      type: 'CEO',
      title: 'صلاحية عليا: المدير العام / المدير التنفيذي',
      subtitle: 'اطلاع كامل وشامل على كافة الطلبات اللوجستية وعمليات سلاسل الإمداد والمخازن في الجمعية',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      iconColor: 'text-purple-600',
      isFull: true
    }
  }

  if (isLogisticsTeam(authStore)) {
    return {
      type: 'LOGISTICS',
      title: 'صلاحية كاملة: إدارة سلاسل الإمداد واللوجستيك',
      subtitle: 'اطلاع وإدارة شاملة لجميع الطلبات اللوجستية والمخازن ومراكز التوزيع والأرصدة',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconColor: 'text-emerald-600',
      isFull: true
    }
  }

  const dept = authStore.currentEmployee?.department || 'إدارتك'
  const subCount = (authStore.subordinates || []).length

  return {
    type: 'SCOPED',
    title: `عرض مقيد: طلباتي وموظفي الإدارة (${dept})`,
    subtitle: `يتم عرض الطلبات المنشأة بواسطتك أو موظفيك (${subCount} موظف تابع) والطلبات المكلف باعتمادها فقط`,
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    iconColor: 'text-blue-600',
    isFull: false
  }
}
