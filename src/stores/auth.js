import { defineStore } from 'pinia'
import { authApi } from '@/api/inventory'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: localStorage.getItem('yrcs_user') || null,
    fullName: localStorage.getItem('yrcs_full_name') || '',
    isAuthenticated: !!localStorage.getItem('yrcs_user'),
    loading: false,
    error: null,
    company: 'Yemen Red Crescent Society',
    roles: [],
  }),

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

        // Fetch detailed profile in background
        this.fetchProfile(usr)
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
        }
      } catch (e) {
        // non-critical
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
      localStorage.removeItem('yrcs_user')
      localStorage.removeItem('yrcs_full_name')
    }
  }
})
