<template>
  <div class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-soft hover:shadow-card transition-all duration-200">
    <div class="flex items-center justify-between">
      <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">{{ title }}</p>
      <div 
        class="w-10 h-10 rounded-lg flex items-center justify-center"
        :class="iconBgClass"
      >
        <component :is="icon" class="w-5 h-5" :class="iconColorClass" />
      </div>
    </div>

    <div class="mt-3 flex items-baseline justify-between">
      <h3 class="text-2xl font-bold tracking-tight text-slate-900">{{ formattedValue }}</h3>
      <span 
        v-if="badge" 
        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
        :class="badgeClass"
      >
        {{ badge }}
      </span>
    </div>

    <p v-if="subtitle" class="mt-1 text-xs text-slate-500">{{ subtitle }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [Number, String], required: true },
  subtitle: { type: String, default: '' },
  icon: { type: Object, required: true },
  variant: { type: String, default: 'red' }, // red, blue, emerald, amber, slate
  badge: { type: String, default: '' },
  badgeVariant: { type: String, default: 'neutral' }
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})

const iconBgClass = computed(() => {
  switch (props.variant) {
    case 'red': return 'bg-red-50 text-red-600 border border-red-100'
    case 'emerald': return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
    case 'amber': return 'bg-amber-50 text-amber-600 border border-amber-100'
    case 'blue': return 'bg-blue-50 text-blue-600 border border-blue-100'
    default: return 'bg-slate-100 text-slate-700'
  }
})

const iconColorClass = computed(() => {
  switch (props.variant) {
    case 'red': return 'text-red-600'
    case 'emerald': return 'text-emerald-600'
    case 'amber': return 'text-amber-600'
    case 'blue': return 'text-blue-600'
    default: return 'text-slate-600'
  }
})

const badgeClass = computed(() => {
  switch (props.badgeVariant) {
    case 'success': return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
    case 'warning': return 'bg-amber-50 text-amber-700 border border-amber-200/60'
    case 'danger': return 'bg-red-50 text-red-700 border border-red-200/60'
    default: return 'bg-slate-100 text-slate-700 border border-slate-200'
  }
})
</script>
