import { defineStore } from 'pinia'
import { inventoryApi } from '@/api/inventory'

export const useLogisticsStore = defineStore('logistics', {
  state: () => ({
    requisitions: [],
    selectedRequisition: null,
    loading: false,
    detailsLoading: false,
    error: null,
    selectedStage: '',
    filterOverdueOnly: false,
    searchQuery: '',
    notificationsEnabled: localStorage.getItem('yrcs_notifications_enabled') === 'true',
    lastNotificationTimestamp: 0,
  }),

  getters: {
    // Stage classification
    allStages: () => [
      { id: 'Pending at Requester', label: 'مقدم الطلب (Requester)', badgeClass: 'bg-slate-100 text-slate-700' },
      { id: 'Pending at Budget.H', label: 'مسؤول الموازنة (Budget.H)', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
      { id: 'Pending at Finance', label: 'المالية (Finance)', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
      { id: 'Pending at CEO', label: 'المدير العام (CEO)', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
      { id: 'Approved', label: 'معتمد (Approved)', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      { id: 'In Progress', label: 'قيد التوريد (In Progress)', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200' },
      { id: 'Received', label: 'تم الاستلام (Received)', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { id: 'Closed', label: 'مغلق (Closed)', badgeClass: 'bg-slate-100 text-slate-600' },
      { id: 'Cancel', label: 'ملغي (Cancel)', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
    ],

    // Overdue check (> 24 hours / > 1 day in non-terminal state)
    overdueList: (state) => {
      const now = new Date().getTime()
      const oneDayMs = 24 * 60 * 60 * 1000

      return state.requisitions.filter(req => {
        const stateName = req.workflow_state || req.status
        if (['Closed', 'Cancel', 'Received'].includes(stateName)) {
          return false
        }
        const lastActionDate = new Date(req.modified || req.creation).getTime()
        return (now - lastActionDate) >= oneDayMs
      })
    },

    overdueCount: (state) => {
      return state.overdueList.length
    },

    stageCounts: (state) => {
      const counts = {}
      state.requisitions.forEach(req => {
        const s = req.workflow_state || 'Unknown'
        counts[s] = (counts[s] || 0) + 1
      })
      return counts
    },

    pendingApprovalsCount: (state) => {
      return state.requisitions.filter(req => {
        const s = req.workflow_state || ''
        return s.startsWith('Pending')
      }).length
    },

    receivedCount: (state) => {
      return state.requisitions.filter(req => {
        return (req.workflow_state === 'Received' || req.workflow_state === 'Closed')
      }).length
    },

    filteredRequisitions: (state) => {
      let list = state.requisitions

      // Overdue filter
      if (state.filterOverdueOnly) {
        const overdueNames = new Set(state.overdueList.map(r => r.name))
        list = list.filter(r => overdueNames.has(r.name))
      }

      // Stage filter
      if (state.selectedStage) {
        list = list.filter(r => (r.workflow_state || r.status) === state.selectedStage)
      }

      // Search filter
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase()
        list = list.filter(r => 
          r.name?.toLowerCase().includes(q) ||
          r.owner?.toLowerCase().includes(q) ||
          r.workflow_state?.toLowerCase().includes(q) ||
          r.status?.toLowerCase().includes(q)
        )
      }

      return list
    }
  },

  actions: {
    async fetchRequisitions() {
      this.loading = true
      this.error = null
      try {
        const res = await inventoryApi.getMaterialRequests({ limit: 100 })
        const list = res.data?.data || []
        
        // Enrich with overdue metadata
        const now = new Date().getTime()
        const oneDayMs = 24 * 60 * 60 * 1000

        this.requisitions = list.map(req => {
          const actionTime = new Date(req.modified || req.creation).getTime()
          const diffMs = now - actionTime
          const isOverdue = diffMs >= oneDayMs && !['Closed', 'Cancel', 'Received'].includes(req.workflow_state || req.status)
          const daysOverdue = Math.floor(diffMs / oneDayMs)
          const hoursOverdue = Math.floor(diffMs / (60 * 60 * 1000))

          return {
            ...req,
            isOverdue,
            daysOverdue,
            hoursOverdue
          }
        })

        // Trigger device notification if new overdue requests exist
        this.checkAndTriggerDeviceAlert()
      } catch (err) {
        console.error('Failed to fetch requisitions:', err)
        this.error = err.friendlyMessage || 'Failed to load Logistics Requisitions'
      } finally {
        this.loading = false
      }
    },

    async fetchDetails(name) {
      this.detailsLoading = true
      this.selectedRequisition = null
      try {
        const res = await inventoryApi.getRequisitionDetails(name)
        this.selectedRequisition = res.data?.data || null
      } catch (err) {
        console.error('Failed to fetch requisition details:', err)
        throw err
      } finally {
        this.detailsLoading = false
      }
    },

    async submitWorkflowAction(action) {
      if (!this.selectedRequisition) return
      try {
        await inventoryApi.applyWorkflowAction(this.selectedRequisition, action)
        // Refresh details & list
        await this.fetchDetails(this.selectedRequisition.name)
        await this.fetchRequisitions()
      } catch (err) {
        console.error('Workflow action failed:', err)
        throw err
      }
    },

    // Device notification setup
    async enableDeviceNotifications() {
      if (!('Notification' in window)) {
        alert('Your browser does not support desktop notifications.')
        return false
      }

      try {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          this.notificationsEnabled = true
          localStorage.setItem('yrcs_notifications_enabled', 'true')
          this.sendDeviceNotification(
            'تم تفعيل التنبيهات بنجاح | YRCS Notifications',
            'سيتم إشعارك فورياً بالطلبات اللوجستية المتأخرة لأكثر من يوم والطلبات العاجلة.'
          )
          return true
        } else {
          this.notificationsEnabled = false
          localStorage.setItem('yrcs_notifications_enabled', 'false')
          return false
        }
      } catch (e) {
        console.error('Notification permission error:', e)
        return false
      }
    },

    disableDeviceNotifications() {
      this.notificationsEnabled = false
      localStorage.setItem('yrcs_notifications_enabled', 'false')
    },

    sendDeviceNotification(title, body) {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return
      }

      try {
        const n = new Notification(title, {
          body,
          icon: '/yrcs-logo.png',
          badge: '/yrcs-logo.png',
          tag: 'yrcs-logistics-alert',
          silent: false
        })

        n.onclick = () => {
          window.focus()
          n.close()
        }

        // Play subtle pleasant chime
        this.playNotificationChime()
      } catch (e) {
        console.error('Failed to dispatch notification:', e)
      }
    },

    playNotificationChime() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1) // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.3)
      } catch (e) {
        // audio context optional
      }
    },

    checkAndTriggerDeviceAlert() {
      if (!this.notificationsEnabled) return

      const now = Date.now()
      // Only notify at most once every 10 minutes to prevent harassment
      if (now - this.lastNotificationTimestamp < 10 * 60 * 1000) return

      const overdueCount = this.overdueCount
      if (overdueCount > 0) {
        this.lastNotificationTimestamp = now
        this.sendDeviceNotification(
          `⚠️ تنبيه لوجستي: يوجد ${overdueCount} طلب متأخر`,
          `يوجد ${overdueCount} طلب لوجستي تجاوزت فترة الانتظار أكثر من 24 ساعة دون استكمال دورة العمل.`
        )
      }
    }
  }
})
