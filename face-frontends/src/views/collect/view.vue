<template>
  <PageHeader title="查看集合" description="查看集合配置及样本、人脸扩展字段。" />
  <form class="query-bar" @submit.prevent="load">
    <div class="query-field"><label for="namespace">命名空间</label><el-input id="namespace" v-model="query.namespace" /></div>
    <div class="query-field"><label for="collectionName">集合名称</label><el-input id="collectionName" v-model="query.collectionName" /></div>
    <el-button native-type="submit" type="primary" :loading="loading"><Search :size="16" />查询</el-button>
  </form>

  <section v-if="collection" class="workspace-panel">
    <div class="panel-heading">
      <h2><span class="mono">{{ collection.namespace }}/{{ collection.collectionName }}</span></h2>
      <el-button @click="openSamples"><Users :size="16" />查看样本</el-button>
    </div>
    <div class="panel-body">
      <dl class="detail-grid">
        <div><dt>集合描述</dt><dd>{{ collection.collectionComment || '未填写' }}</dd></div>
        <div><dt>存储方式</dt><dd>{{ collection.storageEngine || 'ACTIVE_STORAGE' }}</dd></div>
        <div><dt>保留人脸图片</dt><dd>{{ collection.storageFaceInfo ? '是' : '否' }}</dd></div>
        <div><dt>分片 / 副本</dt><dd>{{ collection.shardsNum || 0 }} / {{ collection.replicasNum || 0 }}</dd></div>
      </dl>

      <h3>样本字段</h3>
      <el-table :data="collection.sampleColumns || []" empty-text="未定义样本字段" size="small">
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="dataType" label="类型" width="140" />
        <el-table-column prop="comment" label="描述" min-width="220" />
      </el-table>

      <h3>人脸字段</h3>
      <el-table :data="collection.faceColumns || []" empty-text="未定义人脸字段" size="small">
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="dataType" label="类型" width="140" />
        <el-table-column prop="comment" label="描述" min-width="220" />
      </el-table>
    </div>
  </section>
  <div v-else class="empty-state"><div><Database :size="34" /><span>输入集合标识查看配置</span></div></div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Database, Search, Users } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import * as collectApi from '@/api/collect'

const route = useRoute()
const router = useRouter()
const query = reactive({ namespace: String(route.query.namespace || ''), collectionName: String(route.query.collectionName || '') })
const collection = ref(null)
const loading = ref(false)

async function load() {
  if (!query.namespace || !query.collectionName) {
    ElMessage.warning('请输入命名空间和集合名称')
    return
  }
  loading.value = true
  try {
    collection.value = await collectApi.view(query)
    router.replace({ query: { ...query } })
  } finally {
    loading.value = false
  }
}
function openSamples() { router.push({ path: '/samples', query: { ...query } }) }

if (query.namespace && query.collectionName) load()
</script>

<style scoped>
.query-bar { grid-template-columns: minmax(180px, 1fr) minmax(220px, 1fr) auto; }
.detail-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1px; margin: 0 0 24px; overflow: hidden; border: 1px solid var(--line); border-radius: 6px; background: var(--line); }
.detail-grid div { min-height: 92px; padding: 16px; background: var(--surface-soft); }
.detail-grid dt { color: var(--muted); font-size: 11px; font-weight: 700; }
.detail-grid dd { margin: 9px 0 0; word-break: break-word; }
h3 { margin: 24px 0 10px; font-size: 13px; }
@media (max-width: 900px) { .detail-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 620px) { .query-bar, .detail-grid { grid-template-columns: 1fr; } }
</style>
