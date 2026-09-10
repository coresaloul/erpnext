<template>
  <div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
    <!-- Subtle Background Accents -->
    <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-red-100/50 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-slate-200/50 blur-3xl pointer-events-none"></div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
      <!-- Official Brand Emblem -->
      <div class="flex justify-center">
        <div class="w-20 h-20 rounded-full bg-white p-1 shadow-card border-2 border-red-100 flex items-center justify-center overflow-hidden">
          <img src="@/assets/yrcs-logo.png" alt="جمعية الهلال الأحمر اليمني" class="w-full h-full object-contain" />
        </div>
      </div>

      <h2 class="mt-4 text-center text-2xl font-extrabold tracking-tight text-slate-900">
        جمعية الهلال الأحمر اليمني
      </h2>
      <p class="text-center text-xs font-bold text-red-600 mt-0.5 tracking-wide">
        YEMEN RED CRESCENT SOCIETY
      </p>
      <p class="mt-1 text-center text-xs text-slate-500 font-medium">
        بوابة إدارة سلاسل الإمداد والمخازن والطلبات اللوجستية
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <div class="bg-white py-8 px-6 shadow-card rounded-2xl sm:px-10 border border-slate-200/80">
        <form class="space-y-5" @submit.prevent="handleLogin">
          <!-- Error Alert -->
          <div 
            v-if="errorMessage" 
            class="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-start gap-2.5"
          >
            <AlertCircle class="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Email / Username -->
          <div>
            <label for="email" class="block text-xs font-bold text-slate-700">
              البريد الإلكتروني أو اسم المستخدم
            </label>
            <div class="mt-1.5 relative">
              <input 
                id="email" 
                v-model="email"
                type="text" 
                required 
                placeholder="user@yemenredcrescent.org"
                class="block w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white text-slate-900 placeholder-slate-400 transition-all font-mono text-left"
                dir="ltr"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="block text-xs font-bold text-slate-700">
                كلمة المرور
              </label>
            </div>
            <div class="mt-1.5 relative">
              <input 
                id="password" 
                v-model="password"
                :type="showPassword ? 'text' : 'password'" 
                required 
                placeholder="••••••••"
                class="block w-full pr-3.5 pl-10 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white text-slate-900 placeholder-slate-400 transition-all font-mono"
                dir="ltr"
              />
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title="إظهار / إخفاء كلمة المرور"
              >
                <Eye v-if="!showPassword" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button 
              type="submit" 
              :disabled="loading"
              class="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-xs font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
              <span>{{ loading ? 'جاري التحقق وتسجيل الدخول...' : 'تسجيل الدخول إلى النظام' }}</span>
            </button>
          </div>
        </form>

        <!-- Server Status Card -->
        <div class="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-mono text-[11px]">13.140.163.199</span>
          </div>
          <span class="font-semibold text-slate-400">نظام ERPNext v15</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// Default with verified user for quick login convenience
const email = ref('abdelkareem@yemenredcrescent.org')
const password = ref('abdelkareem@123')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  loading.value = true
  errorMessage.value = ''
  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (err) {
    errorMessage.value = err.friendlyMessage || 'Failed to sign in. Please verify your credentials.'
  } finally {
    loading.value = false
  }
}
</script>
