<template><el-tag :type="config.type" effect="plain" size="small">{{ config.label }}</el-tag></template>

<script setup>
import { translate } from '@/i18n'
import { computed } from 'vue'

const props = defineProps({ status: { type: String, default: 'pending' } })
const states = {
  pending: { label: '等待处理', type: 'info' },
  processing: { label: '生成中', type: 'warning' },
  ready: { label: '可搜索', type: 'success' },
  failed: { label: '失败', type: 'danger' },
}
const config = computed(() => {
  const state = states[props.status] || states.pending
  return { ...state, label: translate(state.label) }
})
</script>
