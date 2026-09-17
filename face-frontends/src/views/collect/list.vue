<template>
  <PageHeader title="集合列表" description="按命名空间查看人脸集合及字段规模。">
    <el-button type="primary" @click="router.push('/collections/create')"><Plus :size="16" />新建集合</el-button>
  </PageHeader>

  <form class="query-bar collection-query" @submit.prevent="load">
    <div class="query-field">
      <label for="namespace">命名空间</label>
      <el-input id="namespace" v-model="namespace" placeholder="例如 production" clearable />
    </div>
    <el-button native-type="submit" type="primary" :loading="loading"><Search :size="16" />查询</el-button>
  </form>

  <section class="workspace-panel">
    <div class="panel-heading"><h2>集合</h2><span class="result-count">{{ collections.length }} 条</span></div>
    <el-table v-loading="loading" :data="collections" empty-text="输入命名空间后查询" stripe>
      <el-table-column prop="collectionName" label="集合名称" min-width="170">
        <template #default="{ row }"><span class="mono">{{ row.collectionName }}</span></template>
      </el-table-column>
      <el-table-column prop="collectionComment" label="描述" min-width="220" show-overflow-tooltip />
      <el-table-column label="保留图片" width="100">
        <template #default="{ row }"><el-tag :type="row.storageFaceInfo ? 'success' : 'info'" effect="plain">{{ row.storageFaceInfo ? '是' : '否' }}</el-tag></template>
      </el-table-column>
      <el-table-column label="样本字段" width="100" align="center"><template #default="{ row }">{{ row.sampleColumns?.length || 0 }}</template></el-table-column>
      <el-table-column label="人脸字段" width="100" align="center"><template #default="{ row }">{{ row.faceColumns?.length || 0 }}</template></el-table-column>
      <el-table-column label="操作" width="190" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="open(row)"><Eye :size="15" />查看</el-button>
          <el-button link type="danger" @click="remove(row)"><Trash2 :size="15" />删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Eye, Plus, Search, Trash2 } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import * as collectApi from '@/api/collect'

const route = useRoute()
const router = useRouter()
const namespace = ref(String(route.query.namespace || ''))
const collections = ref([])
const loading = ref(false)

async function load() {
  if (!namespace.value.trim()) {
    ElMessage.warning('请输入命名空间')
    return
  }
  loading.value = true
  try {
    collections.value = await collectApi.list({ namespace: namespace.value.trim() })
    router.replace({ query: { namespace: namespace.value.trim() } })
  } finally {
    loading.value = false
  }
}

function target(path, row) {
  return { path, query: { namespace: row.namespace, collectionName: row.collectionName } }
}
function open(row) { router.push(target('/collections/view', row)) }
function remove(row) { router.push(target('/collections/remove', row)) }

onMounted(() => { if (namespace.value) load() })
</script>

<style scoped>
.collection-query { grid-template-columns: minmax(240px, 480px) auto; justify-content: start; }
.result-count { color: var(--muted); font-size: 12px; }
@media (max-width: 620px) { .collection-query { grid-template-columns: 1fr; } }
</style>
