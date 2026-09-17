<template>
  <PageHeader :title="t('collection.titleCreate')" :description="t('collection.descCreate')" />
  <section class="workspace-panel">
    <div class="panel-heading"><h2>{{ t('collection.config') }}</h2><Database :size="18" /></div>
    <div class="panel-body">
      <CollectionForm ref="formRef" v-model="form" />
      <div class="form-actions">
        <el-button type="primary" :loading="saving" @click="submit"><Save :size="16" />{{ t('collection.create') }}</el-button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Database, Save } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'
import CollectionForm from '@/components/CollectionForm.vue'
import * as collectApi from '@/api/collect'

const router = useRouter()
const { t } = useI18n()
const formRef = ref()
const saving = ref(false)
const form = ref({
  namespace: '',
  collectionName: '',
  collectionComment: '',
  storageFaceInfo: true,
  sampleColumns: [],
  faceColumns: [],
})

async function submit() {
  await formRef.value.validate()
  saving.value = true
  try {
    await collectApi.create(form.value)
    ElMessage.success(t('collection.created'))
    router.push({ path: '/collections', query: { namespace: form.value.namespace } })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.form-actions { justify-content: flex-end; margin-top: 20px; }
</style>
