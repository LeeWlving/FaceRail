<template>
  <PageHeader :title="t('sample.titleList')" :description="t('sample.descList')">
    <el-button type="primary" @click="createSample"><Plus :size="16" />{{ t('sample.new') }}</el-button>
  </PageHeader>

  <form class="query-bar sample-query" @submit.prevent="load">
    <div class="query-field"><label for="namespace">{{ t('common.namespace') }}</label><el-input id="namespace" v-model="query.namespace" /></div>
    <div class="query-field"><label for="collectionName">{{ t('common.collectionName') }}</label><el-input id="collectionName" v-model="query.collectionName" /></div>
    <div class="query-field"><label for="limit">{{ t('sample.limit') }}</label><el-input-number id="limit" v-model="query.limit" :min="1" :max="100" /></div>
    <div class="query-field"><label for="order">{{ t('sample.order') }}</label><el-select id="order" v-model="query.order"><el-option :label="t('sample.oldest')" value="asc" /><el-option :label="t('sample.newest')" value="desc" /></el-select></div>
    <el-button native-type="submit" type="primary" :loading="loading"><Search :size="16" />{{ t('common.query') }}</el-button>
  </form>

  <section class="workspace-panel">
    <div class="panel-heading">
      <h2>{{ t('sample.list') }}</h2>
      <div class="inline-actions">
        <el-button :disabled="query.offset === 0" @click="previous"><ChevronLeft :size="16" />{{ t('sample.previous') }}</el-button>
        <span class="offset-label">{{ t('sample.offset', { value: query.offset }) }}</span>
        <el-button :disabled="samples.length < query.limit" @click="next">{{ t('sample.next') }}<ChevronRight :size="16" /></el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="samples" :empty-text="t('sample.emptyList')" stripe row-key="sampleId">
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="face-table">
            <el-table :data="row.faces || []" :empty-text="t('sample.emptySampleFaces')" size="small">
              <el-table-column prop="faceId" :label="t('common.faceId')" min-width="210"><template #default="scope"><span class="mono">{{ scope.row.faceId }}</span></template></el-table-column>
              <el-table-column prop="faceScore" :label="t('common.quality')" width="100" />
              <el-table-column :label="t('sample.embeddingStatus')" width="130"><template #default="scope"><StatusTag :status="scope.row.embeddingStatus" /></template></el-table-column>
              <el-table-column prop="embeddingError" :label="t('common.errorInfo')" min-width="180" show-overflow-tooltip />
              <el-table-column :label="t('common.faceData')" min-width="180"><template #default="scope">{{ summarize(scope.row.faceData) }}</template></el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="sampleId" :label="t('common.sampleId')" min-width="170"><template #default="{ row }"><span class="mono">{{ row.sampleId }}</span></template></el-table-column>
      <el-table-column :label="t('common.extendedData')" min-width="260" show-overflow-tooltip><template #default="{ row }">{{ summarize(row.sampleData) }}</template></el-table-column>
      <el-table-column :label="t('common.faceCount')" width="90" align="center"><template #default="{ row }">{{ row.faces?.length || 0 }}</template></el-table-column>
      <el-table-column :label="t('common.actions')" width="170" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="open(row)"><Eye :size="15" />{{ t('common.view') }}</el-button>
          <el-button link type="danger" @click="remove(row)"><Trash2 :size="15" />{{ t('common.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, Eye, Plus, Search, Trash2 } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'
import StatusTag from '@/components/StatusTag.vue'
import * as sampleApi from '@/api/sample'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const query = reactive({
  namespace: String(route.query.namespace || ''),
  collectionName: String(route.query.collectionName || ''),
  offset: Number(route.query.offset || 0),
  limit: Number(route.query.limit || 10),
  order: String(route.query.order || 'asc'),
})
const samples = ref([])
const loading = ref(false)

function summarize(pairs) {
  if (!pairs?.length) return t('common.none')
  return pairs.map(({ key, value }) => `${key}: ${String(value)}`).join(' · ')
}
function identity(row) { return { namespace: row.namespace, collectionName: row.collectionName, sampleId: row.sampleId } }
function open(row) { router.push({ path: '/samples/view', query: identity(row) }) }
function remove(row) { router.push({ path: '/samples/remove', query: identity(row) }) }
function createSample() { router.push({ path: '/samples/create', query: { namespace: query.namespace, collectionName: query.collectionName } }) }

async function load() {
  if (!query.namespace || !query.collectionName) {
    ElMessage.warning(t('common.inputNamespaceCollection'))
    return
  }
  loading.value = true
  try {
    samples.value = await sampleApi.list(query)
    router.replace({ query: { ...query } })
  } finally {
    loading.value = false
  }
}
function previous() { query.offset = Math.max(0, query.offset - query.limit); load() }
function next() { query.offset += query.limit; load() }

onMounted(() => { if (query.namespace && query.collectionName) load() })
</script>

<style scoped>
.sample-query { grid-template-columns: minmax(150px, 1fr) minmax(180px, 1fr) 130px 150px auto; }
.query-field :deep(.el-input-number), .query-field :deep(.el-select) { width: 100%; }
.offset-label { color: var(--muted); font-size: 11px; }
.face-table { padding: 12px 18px 18px 58px; background: #f8faf9; }
@media (max-width: 1100px) { .sample-query { grid-template-columns: repeat(2, minmax(180px, 1fr)); } }
@media (max-width: 620px) { .sample-query { grid-template-columns: 1fr; } .face-table { padding-left: 12px; } }
</style>
