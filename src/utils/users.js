import usersList from '@/assets/users.json'

const usersMap = new Map()

usersList.forEach(u => {
  if (u.name) {
    usersMap.set(u.name.toLowerCase(), u.full_name || u.name)
  }
  if (u.email) {
    usersMap.set(u.email.toLowerCase(), u.full_name || u.name)
  }
})

/**
 * Get human-readable full name from user email/id
 */
export function getUserFullName(identifier) {
  if (!identifier) return '—'
  const key = identifier.toLowerCase().trim()
  if (usersMap.has(key)) {
    return usersMap.get(key)
  }
  
  // Clean fallback: capitalize email prefix
  const prefix = identifier.split('@')[0]
  return prefix
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * Determine the current responsible person or role for the workflow state
 */
export function getWorkflowAssignee(req) {
  if (!req) return { name: '—', role: '', isUser: false }

  const state = req.workflow_state || req.status || ''

  // 1. Check direct ToDo assignments (_assign)
  if (req._assign) {
    try {
      const parsed = typeof req._assign === 'string' ? JSON.parse(req._assign) : req._assign
      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          name: getUserFullName(parsed[0]),
          email: parsed[0],
          role: 'المكلف الحالي',
          isUser: true
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // 2. State-specific responsibility in YRCS
  switch (state) {
    case 'Pending at Requester':
      return {
        name: getUserFullName(req.owner),
        email: req.owner,
        role: 'مقدم الطلب',
        isUser: true
      }

    case 'Pending at Budget.H':
      if (req.custom_budget_holder_user) {
        return {
          name: getUserFullName(req.custom_budget_holder_user),
          email: req.custom_budget_holder_user,
          role: 'مسؤول الموازنة',
          isUser: true
        }
      }
      return {
        name: 'مسؤول الموازنة (Budget Holder)',
        role: 'Budget Holder',
        isUser: false
      }

    case 'Pending at Finance':
      return {
        name: 'الإدارة المالية (Finance Review)',
        role: 'Accounts Manager',
        isUser: false
      }

    case 'Pending at CEO':
      return {
        name: 'المدير العام / الأمين العام (CEO)',
        role: 'CEO / Secretary General',
        isUser: false
      }

    case 'Approved':
      return {
        name: 'إدارة المشتريات واللوجستيك',
        role: 'Procurement & Logistics',
        isUser: false
      }

    case 'In Progress':
      return {
        name: 'مسؤول المشتريات والتوريد',
        role: 'Purchasing Officer',
        isUser: false
      }

    case 'Received':
      return {
        name: 'أمين المخزن (Warehouse)',
        role: 'Warehouse Custodian',
        isUser: false
      }

    case 'Closed':
      return {
        name: 'مكتمل ومغلق (Archived)',
        role: 'Completed',
        isUser: false
      }

    case 'Cancel':
      return {
        name: 'ملغي (Cancelled)',
        role: 'Cancelled',
        isUser: false
      }

    default:
      return {
        name: req.owner ? getUserFullName(req.owner) : '—',
        role: state,
        isUser: false
      }
  }
}
