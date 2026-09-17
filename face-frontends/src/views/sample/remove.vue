<template>
  <PageHeader :title="t('sample.titleRemove')" :description="t('sample.descRemove')" />
  <section class="workspace-panel danger-panel">
    <div class="panel-heading"><h2>{{ t('common.dangerAction') }}</h2><TriangleAlert :size="18" /></div>
    <div class="panel-body">
      <el-alert :title="t('sample.confirmUnused')" type="error" :closable="false" show-icon />
      <el-form label-position="top" class="remove-form">
        <div class="form-grid">
          <el-form-item :label="t('common.namespace')"><el-input v-model="form.namespace" /></el-form-item>
          <el-form-item :label="t('common.collectionName')"><el-input v-model="form.collectionName" /></el-form-item>
          <el-form-item :label="t('common.sampleId')"><el-input v-model="form.sampleId" /></el-form-item>
        </div>
      </el-form>
      <div class="form-actions"><el-button type="danger" :loading="removing" @click="submit"><Trash2 :size="16" />{{ t('common.permanentDelete') }}</el-button></div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Trash2, TriangleAlert } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'
import * as sampleApi from '@/api/sample'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const removing = ref(false)
const form = reactive({ namespace: String(route.query.namespace || ''), collectionName: String(route.query.collectionName || ''), sampleId: String(route.query.sampleId || '') })

async function submit() {
  if (!form.namespace || !form.collectionName || !form.sampleId) {
    ElMessage.warning(t('common.inputCompleteIdentity'))
    return
  }
  await ElMessageBox.confirm(t('sample.confirm', { id: form.sampleId }), t('sample.confirmTitle'), { type: 'error', confirmButtonText: t('collection.confirmButton'), cancelButtonText: t('common.cancel') })
  removing.value = true
  try {
    await sampleApi.remove(form)
    ElMessage.success(t('sample.removed'))
    router.push({ path: '/samples', query: { namespace: form.namespace, collectionName: form.collectionName } })
  } finally {
    removing.value = false
  }
}
</script>

<style scoped>
.danger-panel { border-color: #e8b8b2; }
.danger-panel .panel-heading { color: var(--danger); background: #fff7f6; }
.remove-form { margin-top: 22px; }
.form-actions { justify-content: flex-end; }
</style>
