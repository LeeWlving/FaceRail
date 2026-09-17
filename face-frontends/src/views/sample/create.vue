<template>
  <PageHeader :title="t('sample.titleCreate')" :description="t('sample.descCreate')" />
  <section class="workspace-panel">
    <div class="panel-heading"><h2>{{ t('sample.info') }}</h2><UserRoundPlus :size="18" /></div>
    <div class="panel-body">
      <SampleForm ref="formRef" v-model="form" />
      <div class="form-actions">
        <el-button type="primary" :loading="saving" @click="submit"><Save :size="16" />{{ t('sample.create') }}</el-button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Save, UserRoundPlus } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'
import SampleForm from '@/components/SampleForm.vue'
import * as sampleApi from '@/api/sample'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const formRef = ref()
const saving = ref(false)
const form = ref({
  namespace: String(route.query.namespace || ''),
  collectionName: String(route.query.collectionName || ''),
  sampleId: '',
  sampleData: [],
})

async function submit() {
  await formRef.value.validate()
  saving.value = true
  try {
    await sampleApi.create(form.value)
    ElMessage.success(t('sample.created'))
    router.push({ path: '/samples/view', query: { namespace: form.value.namespace, collectionName: form.value.collectionName, sampleId: form.value.sampleId } })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.form-actions { justify-content: flex-end; margin-top: 20px; }
</style>
