import { defineStore } from 'pinia'
import { authApi } from '@/api/inventory'
import { isExecutiveDirector, isLogisticsTeam, hasFullAccess } from '@/utils/permissions'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: localStorage.getItem('yrcs_user') || null,
    fullName: localStorage.getItem('yrcs_full_name') || '',
    isAuthenticated: !!localStorage.getItem('yrcs_user'),
    loading: false,
    error: null,
    company: 'Yemen Red Crescent Society',
    roles: JSON.parse(localStorage.getItem('yrcs_roles') || '[]'),
    currentEmployee: JSON.parse(localStorage.getItem('yrcs_employee') || 'null'),
    subordinates: JSON.parse(localStorage.getItem('yrcs_subordinates') || '[]'),
    subordinateEmails: JSON.parse(localStorage.getItem('yrcs_sub_emails') || '[]'),
  }),

  getters: {
    isCEO: (state) => isExecutiveDirector(state),
    isLogistics: (state) => isLogisticsTeam(state),
    hasFullAccess: (state) => hasFullAccess(state),
    isScopedStaff: (state) => !hasFullAccess(state),
    hasRole: (state) => (role) => (state.roles || []).includes(role),
  },

  actions: {
    async login(usr, pwd) {
      this.loading = true
      this.error = null
      try {
        const response = await authApi.login(usr, pwd)
        const fullName = response.data?.full_name || usr
        
        this.user = usr
        this.fullName = fullName
        this.isAuthenticated = true
        
        localStorage.setItem('yrcs_user', usr)
        localStorage.setItem('yrcs_full_name', fullName)

        // Fetch detailed profile and employee hierarchy in background
        await this.fetchProfile(usr)
        return true
      } catch (err) {
        this.error = err.friendlyMessage || 'Invalid email or password'
        throw err
      } finally {
        this.loading = false
      }
    },

    async checkAuth() {
      try {
        const res = await authApi.getLoggedUser()
        if (res.data?.message && res.data.message !== 'Guest') {
          this.user = res.data.message
          this.isAuthenticated = true
          localStorage.setItem('yrcs_user', this.user)
          await this.fetchProfile(this.user)
          return true
        } else {
          this.clearSession()
          return false
        }
      } catch (err) {
        // Session invalid
        this.clearSession()
        return false
      }
    },

    async fetchProfile(email) {
      try {
        const res = await authApi.getUserDetails(email)
        if (res.data?.data) {
          this.fullName = res.data.data.full_name || this.fullName
          localStorage.setItem('yrcs_full_name', this.fullName)
          this.roles = res.data.data.roles ? res.data.data.roles.map(r => r.role) : []
          localStorage.setItem('yrcs_roles', JSON.stringify(this.roles))
        }
      } catch (e) {
        // non-critical
      }

      // Fetch employee hierarchy
      try {
        const empRes = await authApi.getEmployees()
        const allEmps = empRes.data?.data || []
        const myEmp = allEmps.find(e => e.user_id?.toLowerCase() === email.toLowerCase())
        this.currentEmployee = myEmp || null
        
        if (myEmp) {
          // Direct subordinates: employees whose reports_to is this employee
          const subs = allEmps.filter(e => e.reports_to === myEmp.name)
          this.subordinates = subs
          this.subordinateEmails = subs.map(e => e.user_id).filter(Boolean)
        } else {
          this.subordinates = []
          this.subordinateEmails = []
        }

        localStorage.setItem('yrcs_employee', JSON.stringify(this.currentEmployee))
        localStorage.setItem('yrcs_subordinates', JSON.stringify(this.subordinates))
        localStorage.setItem('yrcs_sub_emails', JSON.stringify(this.subordinateEmails))
      } catch (err) {
        console.warn('Could not fetch employee hierarchy:', err)
      }
    },

    async logout() {
      try {
        await authApi.logout()
      } catch (e) {
        // ignore logout errors
      } finally {
        this.clearSession()
      }
    },

    clearSession() {
      this.user = null
      this.fullName = ''
      this.isAuthenticated = false
      this.roles = []
      this.currentEmployee = null
      this.subordinates = []
      this.subordinateEmails = []
      localStorage.removeItem('yrcs_user')
      localStorage.removeItem('yrcs_full_name')
      localStorage.removeItem('yrcs_roles')
      localStorage.removeItem('yrcs_employee')
      localStorage.removeItem('yrcs_subordinates')
      localStorage.removeItem('yrcs_sub_emails')
    }
  }
})
