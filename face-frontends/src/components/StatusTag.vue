<template><el-tag :type="config.type" effect="plain" size="small">{{ config.label }}</el-tag></template>

<script setup>
import { translate } from '@/i18n'
import { computed } from 'vue'

const props = defineProps({ status: { type: String, default: 'pending' } })
const states = {
  pending: { label: translate('等待处理'), type: 'info' },
  processing: { label: translate('生成中'), type: 'warning' },
  ready: { label: translate('可搜索'), type: 'success' },
  failed: { label: translate('失败'), type: 'danger' },
}
const config = computed(() => states[props.status] || states.pending)
</script>
