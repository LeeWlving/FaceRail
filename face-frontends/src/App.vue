<template>
  <el-config-provider :locale="elementLocale">
    <RouterView />
  </el-config-provider>
</template>

<script setup>
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { usePreferences } from '@/composables/usePreferences'

const { locale } = usePreferences()
const elementLocale = computed(() => locale.value === 'en' ? en : zhCn)
</script>
