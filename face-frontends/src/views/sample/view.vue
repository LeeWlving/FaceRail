<template>
  <PageHeader title="查看样本" description="更新样本扩展数据，并管理该样本下的人脸记录。">
    <el-button v-if="sample" type="primary" @click="openFaceCreate"><ScanFace :size="16" />添加人脸</el-button>
  </PageHeader>

  <form class="query-bar" @submit.prevent="load">
    <div class="query-field"><label for="namespace">命名空间</label><el-input id="namespace" v-model="query.namespace" /></div>
    <div class="query-field"><label for="collectionName">集合名称</label><el-input id="collectionName" v-model="query.collectionName" /></div>
    <div class="query-field"><label for="sampleId">样本 ID</label><el-input id="sampleId" v-model="query.sampleId" /></div>
    <el-button native-type="submit" type="primary" :loading="loading"><Search :size="16" />查询</el-button>
  </form>

  <section v-if="sample" class="workspace-panel">
    <div class="panel-heading"><h2>样本信息</h2><StatusTag :status="aggregateStatus" /></div>
    <div class="panel-body">
      <SampleForm ref="formRef" v-model="sample" readonly-identity />
      <div class="form-actions"><el-button type="primary" :loading="saving" @click="save"><Save :size="16" />保存扩展数据</el-button></div>
      <hr class="section-divider" />
      <div class="subheading"><h3>人脸记录</h3><span>{{ sample.faces?.length || 0 }} 条</span></div>
      <el-table :data="sample.faces || []" empty-text="尚未录入人脸" size="small">
        <el-table-column prop="faceId" label="人脸 ID" min-width="220"><template #default="{ row }"><span class="mono">{{ row.faceId }}</span></template></el-table-column>
        <el-table-column prop="faceScore" label="质量分" width="100" />
        <el-table-column label="向量状态" width="120"><template #default="{ row }"><StatusTag :status="row.embeddingStatus" /></template></el-table-column>
        <el-table-column prop="embeddingError" label="错误信息" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="90" fixed="right"><template #default="{ row }"><el-button link type="danger" @click="removeFace(row)"><Trash2 :size="15" />删除</el-button></template></el-table-column>
      </el-table>
    </div>
  </section>
  <div v-else class="empty-state"><div><Users :size="34" /><span>输入样本标识查看详情</span></div></div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Save, ScanFace, Search, Trash2, Users } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import SampleForm from '@/components/SampleForm.vue'
import StatusTag from '@/components/StatusTag.vue'
import * as faceApi from '@/api/face'
import * as sampleApi from '@/api/sample'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const query = reactive({ namespace: String(route.query.namespace || ''), collectionName: String(route.query.collectionName || ''), sampleId: String(route.query.sampleId || '') })
const sample = ref(null)
const loading = ref(false)
const saving = ref(false)
let pollTimer
const aggregateStatus = computed(() => {
  const statuses = sample.value?.faces?.map((face) => face.embeddingStatus) || []
  if (statuses.includes('failed')) return 'failed'
  if (statuses.includes('processing')) return 'processing'
  if (statuses.includes('pending')) return 'pending'
  return statuses.length ? 'ready' : 'pending'
})

function schedulePoll() {
  clearTimeout(pollTimer)
  const active = sample.value?.faces?.some((face) => ['pending', 'processing'].includes(face.embeddingStatus))
  if (active) pollTimer = setTimeout(() => fetchSample(false), 1500)
}
async function fetchSample(showLoading = true) {
  if (!query.namespace || !query.collectionName || !query.sampleId) {
    ElMessage.warning('请输入完整的样本标识')
    return
  }
  if (showLoading) loading.value = true
  try {
    sample.value = await sampleApi.view(query)
    router.replace({ query: { ...query } })
  } finally {
    if (showLoading) loading.value = false
    schedulePoll()
  }
}
function load() { fetchSample() }
async function save() {
  await formRef.value.validate()
  saving.value = true
  try {
    await sampleApi.update(sample.value)
    ElMessage.success('样本已更新')
  } finally {
    saving.value = false
  }
}
async function removeFace(face) {
  await ElMessageBox.confirm(`确认删除人脸 ${face.faceId}？`, '删除人脸', { type: 'warning' })
  await faceApi.remove({ ...query, faceId: face.faceId })
  ElMessage.success('人脸已删除')
  await load()
}
function openFaceCreate() { router.push({ path: '/faces/create', query: { ...query } }) }

if (query.namespace && query.collectionName && query.sampleId) load()
onBeforeUnmount(() => clearTimeout(pollTimer))
</script>

<style scoped>
.form-actions { justify-content: flex-end; margin-top: 20px; }
.subheading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.subheading h3 { margin: 0; font-size: 13px; }
.subheading span { color: var(--muted); font-size: 11px; }
</style>
