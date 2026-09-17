<template>
  <PageHeader title="样本列表" description="浏览集合中的身份样本和人脸向量处理状态。">
    <el-button type="primary" @click="createSample"><Plus :size="16" />新建样本</el-button>
  </PageHeader>

  <form class="query-bar sample-query" @submit.prevent="load">
    <div class="query-field"><label for="namespace">命名空间</label><el-input id="namespace" v-model="query.namespace" /></div>
    <div class="query-field"><label for="collectionName">集合名称</label><el-input id="collectionName" v-model="query.collectionName" /></div>
    <div class="query-field"><label for="limit">每页数量</label><el-input-number id="limit" v-model="query.limit" :min="1" :max="100" /></div>
    <div class="query-field"><label for="order">排序</label><el-select id="order" v-model="query.order"><el-option label="最早创建" value="asc" /><el-option label="最近创建" value="desc" /></el-select></div>
    <el-button native-type="submit" type="primary" :loading="loading"><Search :size="16" />查询</el-button>
  </form>

  <section class="workspace-panel">
    <div class="panel-heading">
      <h2>样本</h2>
      <div class="inline-actions">
        <el-button :disabled="query.offset === 0" @click="previous"><ChevronLeft :size="16" />上一页</el-button>
        <span class="offset-label">偏移 {{ query.offset }}</span>
        <el-button :disabled="samples.length < query.limit" @click="next">下一页<ChevronRight :size="16" /></el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="samples" empty-text="暂无样本" stripe row-key="sampleId">
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="face-table">
            <el-table :data="row.faces || []" empty-text="该样本尚未录入人脸" size="small">
              <el-table-column prop="faceId" label="人脸 ID" min-width="210"><template #default="scope"><span class="mono">{{ scope.row.faceId }}</span></template></el-table-column>
              <el-table-column prop="faceScore" label="质量分" width="100" />
              <el-table-column label="向量状态" width="120"><template #default="scope"><StatusTag :status="scope.row.embeddingStatus" /></template></el-table-column>
              <el-table-column prop="embeddingError" label="错误信息" min-width="180" show-overflow-tooltip />
              <el-table-column label="人脸数据" min-width="180"><template #default="scope">{{ summarize(scope.row.faceData) }}</template></el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="sampleId" label="样本 ID" min-width="170"><template #default="{ row }"><span class="mono">{{ row.sampleId }}</span></template></el-table-column>
      <el-table-column label="扩展数据" min-width="260" show-overflow-tooltip><template #default="{ row }">{{ summarize(row.sampleData) }}</template></el-table-column>
      <el-table-column label="人脸数" width="90" align="center"><template #default="{ row }">{{ row.faces?.length || 0 }}</template></el-table-column>
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="open(row)"><Eye :size="15" />查看</el-button>
          <el-button link type="danger" @click="remove(row)"><Trash2 :size="15" />删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, Eye, Plus, Search, Trash2 } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import StatusTag from '@/components/StatusTag.vue'
import * as sampleApi from '@/api/sample'

const route = useRoute()
const router = useRouter()
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
  if (!pairs?.length) return '无'
  return pairs.map(({ key, value }) => `${key}: ${String(value)}`).join(' · ')
}
function identity(row) { return { namespace: row.namespace, collectionName: row.collectionName, sampleId: row.sampleId } }
function open(row) { router.push({ path: '/samples/view', query: identity(row) }) }
function remove(row) { router.push({ path: '/samples/remove', query: identity(row) }) }
function createSample() { router.push({ path: '/samples/create', query: { namespace: query.namespace, collectionName: query.collectionName } }) }

async function load() {
  if (!query.namespace || !query.collectionName) {
    ElMessage.warning('请输入命名空间和集合名称')
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
