<template>
  <PageHeader :title="t('collection.titleView')" :description="t('collection.descView')" />
  <form class="query-bar" @submit.prevent="load">
    <div class="query-field"><label for="namespace">{{ t('common.namespace') }}</label><el-input id="namespace" v-model="query.namespace" /></div>
    <div class="query-field"><label for="collectionName">{{ t('common.collectionName') }}</label><el-input id="collectionName" v-model="query.collectionName" /></div>
    <el-button native-type="submit" type="primary" :loading="loading"><Search :size="16" />{{ t('common.query') }}</el-button>
  </form>

  <section v-if="collection" class="workspace-panel">
    <div class="panel-heading">
      <h2><span class="mono">{{ collection.namespace }}/{{ collection.collectionName }}</span></h2>
      <el-button @click="openSamples"><Users :size="16" />{{ t('collection.viewSamples') }}</el-button>
    </div>
    <div class="panel-body">
      <dl class="detail-grid">
        <div><dt>{{ t('common.collectionDescription') }}</dt><dd>{{ collection.collectionComment || t('collection.notFilled') }}</dd></div>
        <div><dt>{{ t('common.storage') }}</dt><dd>{{ collection.storageEngine || 'ACTIVE_STORAGE' }}</dd></div>
        <div><dt>{{ t('collection.retainFace') }}</dt><dd>{{ t(collection.storageFaceInfo ? 'common.yes' : 'common.no') }}</dd></div>
        <div><dt>{{ t('collection.shards') }}</dt><dd>{{ collection.shardsNum || 0 }} / {{ collection.replicasNum || 0 }}</dd></div>
      </dl>

      <h3>{{ t('common.sampleFields') }}</h3>
      <el-table :data="collection.sampleColumns || []" :empty-text="t('collection.noSampleFields')" size="small">
        <el-table-column prop="name" :label="t('common.fieldName')" min-width="160" />
        <el-table-column prop="dataType" :label="t('common.fieldType')" width="140" />
        <el-table-column prop="comment" :label="t('common.fieldDescription')" min-width="220" />
      </el-table>

      <h3>{{ t('common.faceFields') }}</h3>
      <el-table :data="collection.faceColumns || []" :empty-text="t('collection.noFaceFields')" size="small">
        <el-table-column prop="name" :label="t('common.fieldName')" min-width="160" />
        <el-table-column prop="dataType" :label="t('common.fieldType')" width="140" />
        <el-table-column prop="comment" :label="t('common.fieldDescription')" min-width="220" />
      </el-table>
    </div>
  </section>
  <div v-else class="empty-state"><div><Database :size="34" /><span>{{ t('collection.emptyDetails') }}</span></div></div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Database, Search, Users } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'
import * as collectApi from '@/api/collect'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const query = reactive({ namespace: String(route.query.namespace || ''), collectionName: String(route.query.collectionName || '') })
const collection = ref(null)
const loading = ref(false)

async function load() {
  if (!query.namespace || !query.collectionName) {
    ElMessage.warning(t('common.inputNamespaceCollection'))
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
