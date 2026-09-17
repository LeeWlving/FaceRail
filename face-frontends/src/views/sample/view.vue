<template>
  <PageHeader :title="t('sample.titleView')" :description="t('sample.descView')">
    <el-button v-if="sample" type="primary" @click="openFaceCreate"><ScanFace :size="16" />{{ t('nav.faceCreate') }}</el-button>
  </PageHeader>

  <form class="query-bar" @submit.prevent="load">
    <div class="query-field"><label for="namespace">{{ t('common.namespace') }}</label><el-input id="namespace" v-model="query.namespace" /></div>
    <div class="query-field"><label for="collectionName">{{ t('common.collectionName') }}</label><el-input id="collectionName" v-model="query.collectionName" /></div>
    <div class="query-field"><label for="sampleId">{{ t('common.sampleId') }}</label><el-input id="sampleId" v-model="query.sampleId" /></div>
    <el-button native-type="submit" type="primary" :loading="loading"><Search :size="16" />{{ t('common.query') }}</el-button>
  </form>

  <section v-if="sample" class="workspace-panel">
    <div class="panel-heading"><h2>{{ t('sample.info') }}</h2><StatusTag :status="aggregateStatus" /></div>
    <div class="panel-body">
      <SampleForm ref="formRef" v-model="sample" readonly-identity />
      <div class="form-actions"><el-button type="primary" :loading="saving" @click="save"><Save :size="16" />{{ t('sample.saveData') }}</el-button></div>
      <hr class="section-divider" />
      <div class="subheading"><h3>{{ t('sample.records') }}</h3><span>{{ t('common.records', { count: sample.faces?.length || 0 }) }}</span></div>
      <el-table :data="sample.faces || []" :empty-text="t('sample.emptyFaces')" size="small">
        <el-table-column prop="faceId" :label="t('common.faceId')" min-width="220"><template #default="{ row }"><span class="mono">{{ row.faceId }}</span></template></el-table-column>
        <el-table-column prop="faceScore" :label="t('common.quality')" width="100" />
        <el-table-column :label="t('sample.embeddingStatus')" width="130"><template #default="{ row }"><StatusTag :status="row.embeddingStatus" /></template></el-table-column>
        <el-table-column prop="embeddingError" :label="t('common.errorInfo')" min-width="180" show-overflow-tooltip />
        <el-table-column :label="t('common.actions')" width="100" fixed="right"><template #default="{ row }"><el-button link type="danger" @click="removeFace(row)"><Trash2 :size="15" />{{ t('common.delete') }}</el-button></template></el-table-column>
      </el-table>
    </div>
  </section>
  <div v-else class="empty-state"><div><Users :size="34" /><span>{{ t('sample.empty') }}</span></div></div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Save, ScanFace, Search, Trash2, Users } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'
import SampleForm from '@/components/SampleForm.vue'
import StatusTag from '@/components/StatusTag.vue'
import * as faceApi from '@/api/face'
import * as sampleApi from '@/api/sample'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const formRef = ref()
const query = reactive({ namespace: String(route.query.namespace || ''), collectionName: String(route.query.collectionName || ''), sampleId: String(route.query.sampleId || '') })
const sample = ref(null)
const loading = ref(false)
const saving = ref(false)
const aggregateStatus = computed(() => {
  const statuses = sample.value?.faces?.map((face) => face.embeddingStatus) || []
  if (statuses.includes('failed')) return 'failed'
  if (statuses.includes('processing')) return 'processing'
  if (statuses.includes('pending')) return 'pending'
  return statuses.length ? 'ready' : 'pending'
})

async function load() {
  if (!query.namespace || !query.collectionName || !query.sampleId) {
    ElMessage.warning(t('common.inputCompleteIdentity'))
    return
  }
  loading.value = true
  try {
    sample.value = await sampleApi.view(query)
    router.replace({ query: { ...query } })
  } finally {
    loading.value = false
  }
}
async function save() {
  await formRef.value.validate()
  saving.value = true
  try {
    await sampleApi.update(sample.value)
    ElMessage.success(t('sample.updated'))
  } finally {
    saving.value = false
  }
}
async function removeFace(face) {
  await ElMessageBox.confirm(t('sample.faceConfirm', { id: face.faceId }), t('sample.faceConfirmTitle'), { type: 'warning' })
  await faceApi.remove({ ...query, faceId: face.faceId })
  ElMessage.success(t('sample.faceRemoved'))
  await load()
}
function openFaceCreate() { router.push({ path: '/faces/create', query: { ...query } }) }

if (query.namespace && query.collectionName && query.sampleId) load()
</script>

<style scoped>
.form-actions { justify-content: flex-end; margin-top: 20px; }
.subheading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.subheading h3 { margin: 0; font-size: 13px; }
.subheading span { color: var(--muted); font-size: 11px; }
</style>
