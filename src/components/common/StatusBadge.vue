<template>
  <span 
    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border"
    :class="classes"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="dotClass"></span>
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: '' },
  label: { type: String, default: '' }
})

const normalizedStatus = computed(() => {
  return (props.status || props.label || '').toLowerCase().trim()
})

const classes = computed(() => {
  const s = normalizedStatus.value
  if (['active', 'in stock', 'submitted', 'enabled', 'completed'].includes(s)) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
  }
  if (['low stock', 'pending', 'draft', 'partially received'].includes(s)) {
    return 'bg-amber-50 text-amber-800 border-amber-200/80'
  }
  if (['out of stock', 'disabled', 'cancelled', 'stopped'].includes(s)) {
    return 'bg-rose-50 text-rose-700 border-rose-200/80'
  }
  return 'bg-slate-100 text-slate-700 border-slate-200'
})

const dotClass = computed(() => {
  const s = normalizedStatus.value
  if (['active', 'in stock', 'submitted', 'enabled', 'completed'].includes(s)) {
    return 'bg-emerald-500'
  }
  if (['low stock', 'pending', 'draft', 'partially received'].includes(s)) {
    return 'bg-amber-500'
  }
  if (['out of stock', 'disabled', 'cancelled', 'stopped'].includes(s)) {
    return 'bg-rose-500'
  }
  return 'bg-slate-400'
})
</script>
