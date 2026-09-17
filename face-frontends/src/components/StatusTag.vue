<template><el-tag :type="config.type" effect="plain" size="small">{{ config.label }}</el-tag></template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({ status: { type: String, default: 'pending' } })
const { t } = useI18n()
const states = {
  pending: { labelKey: 'status.pending', type: 'info' },
  processing: { labelKey: 'status.processing', type: 'warning' },
  ready: { labelKey: 'status.ready', type: 'success' },
  failed: { labelKey: 'status.failed', type: 'danger' },
}
const config = computed(() => {
  const state = states[props.status] || states.pending
  return { ...state, label: t(state.labelKey) }
})
</script>
