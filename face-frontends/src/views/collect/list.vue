<template>
  <PageHeader :title="t('collection.titleList')" :description="t('collection.descList')">
    <el-button type="primary" @click="router.push('/collections/create')"><Plus :size="16" />{{ t('collection.new') }}</el-button>
  </PageHeader>

  <form class="query-bar collection-query" @submit.prevent="load">
    <div class="query-field">
      <label for="namespace">{{ t('common.namespace') }}</label>
      <el-input id="namespace" v-model="namespace" :placeholder="t('common.example')" clearable />
    </div>
    <el-button native-type="submit" type="primary" :loading="loading"><Search :size="16" />{{ t('common.query') }}</el-button>
  </form>

  <section class="workspace-panel">
    <div class="panel-heading"><h2>{{ t('collection.list') }}</h2><span class="result-count">{{ t('common.records', { count: collections.length }) }}</span></div>
    <el-table v-loading="loading" :data="collections" :empty-text="t('collection.empty')" stripe>
      <el-table-column prop="collectionName" :label="t('common.collectionName')" min-width="170">
        <template #default="{ row }"><span class="mono">{{ row.collectionName }}</span></template>
      </el-table-column>
      <el-table-column prop="collectionComment" :label="t('common.description')" min-width="220" show-overflow-tooltip />
      <el-table-column :label="t('common.retainImage')" width="110">
        <template #default="{ row }"><el-tag :type="row.storageFaceInfo ? 'success' : 'info'" effect="plain">{{ t(row.storageFaceInfo ? 'common.yes' : 'common.no') }}</el-tag></template>
      </el-table-column>
      <el-table-column :label="t('common.sampleFields')" width="110" align="center"><template #default="{ row }">{{ row.sampleColumns?.length || 0 }}</template></el-table-column>
      <el-table-column :label="t('common.faceFields')" width="110" align="center"><template #default="{ row }">{{ row.faceColumns?.length || 0 }}</template></el-table-column>
      <el-table-column :label="t('common.actions')" width="190" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="open(row)"><Eye :size="15" />{{ t('common.view') }}</el-button>
          <el-button link type="danger" @click="remove(row)"><Trash2 :size="15" />{{ t('common.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Eye, Plus, Search, Trash2 } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'
import * as collectApi from '@/api/collect'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const namespace = ref(String(route.query.namespace || ''))
const collections = ref([])
const loading = ref(false)

async function load() {
  if (!namespace.value.trim()) {
    ElMessage.warning(t('common.inputNamespace'))
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
