<template>
  <PageHeader :title="t('search.title')" :description="t('search.description')" />
  <div class="search-layout">
    <section class="workspace-panel control-panel">
      <div class="panel-heading"><h2>{{ t('search.conditions') }}</h2><SlidersHorizontal :size="18" /></div>
      <div class="panel-body">
        <ImageDropzone v-model="form.imageBase64" v-model:preview-url="previewUrl" :label="t('image.chooseQuery')" />
        <el-form label-position="top" class="search-form">
          <div class="form-grid">
            <el-form-item :label="t('common.namespace')"><el-input v-model="form.namespace" /></el-form-item>
            <el-form-item :label="t('common.collectionName')"><el-input v-model="form.collectionName" /></el-form-item>
            <el-form-item :label="t('search.limit')"><el-input-number v-model="form.limit" :min="1" :max="100" /></el-form-item>
            <el-form-item :label="t('search.maxFaces')"><el-input-number v-model="form.maxFaceNum" :min="1" :max="20" /></el-form-item>
          </div>
        </el-form>
        <div class="compact-slider"><span>{{ t('search.confidenceThreshold', { value: form.confidenceThreshold }) }}</span><el-slider v-model="form.confidenceThreshold" :min="-100" :max="100" /></div>
        <div class="compact-slider"><span>{{ t('search.faceThreshold', { value: form.faceScoreThreshold }) }}</span><el-slider v-model="form.faceScoreThreshold" :min="0" :max="100" /></div>
        <div class="inference-status"><component :is="inferenceMode === 'device' ? Laptop : Cloud" :size="15" /><span>{{ t(inferenceMode === 'device' ? 'ml.deviceReady' : 'ml.cloudReady') }}</span></div>
        <el-button class="search-button" type="primary" :loading="loading" @click="submit"><ScanSearch :size="17" />{{ t('search.start') }}</el-button>
      </div>
    </section>

    <section class="workspace-panel result-workspace">
      <div class="panel-heading"><h2>{{ t('search.result') }}</h2><span class="result-count">{{ t('common.faces', { count: results.length }) }}</span></div>
      <div v-if="results.length" class="panel-body result-body">
        <FaceOverlay :image-url="previewUrl" :boxes="boxes" />
        <div class="detected-list">
          <section v-for="(face, index) in results" :key="index" class="detected-face">
            <div class="face-heading">
              <div><span>{{ t('search.detected', { index: index + 1 }) }}</span><strong>{{ t('common.quality') }} {{ formatScore(face.faceScore) }}</strong></div>
              <span>{{ t('common.matches', { count: face.match?.length || 0 }) }}</span>
            </div>
            <el-table :data="face.match || []" :empty-text="t('search.emptyMatch')" size="small">
              <el-table-column type="index" label="#" width="50" />
              <el-table-column prop="sampleId" :label="t('common.sampleId')" min-width="150"><template #default="scope"><span class="mono">{{ scope.row.sampleId }}</span></template></el-table-column>
              <el-table-column :label="t('search.matchScore')" width="110"><template #default="scope"><strong class="confidence">{{ formatScore(scope.row.confidence) }}</strong></template></el-table-column>
              <el-table-column prop="faceId" :label="t('common.faceId')" min-width="210" show-overflow-tooltip />
              <el-table-column :label="t('common.sampleData')" min-width="190" show-overflow-tooltip><template #default="scope">{{ summarize(scope.row.sampleData) }}</template></el-table-column>
            </el-table>
          </section>
        </div>
      </div>
      <div v-else v-loading="loading" :element-loading-text="inferenceMode === 'device' ? t('ml.loading') : ''" class="empty-state"><div><ScanSearch :size="36" /><span>{{ t('search.empty') }}</span></div></div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { Cloud, Laptop, ScanSearch, SlidersHorizontal } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'
import FaceOverlay from '@/components/FaceOverlay.vue'
import ImageDropzone from '@/components/ImageDropzone.vue'
import * as searchApi from '@/api/search'
import { usePreferences } from '@/composables/usePreferences'
import { extractFaces } from '@/ml/faceEngine'

const { t } = useI18n()
const { inferenceMode } = usePreferences()
const previewUrl = ref('')
const loading = ref(false)
const results = ref([])
const form = reactive({ namespace: '', collectionName: '', imageBase64: '', confidenceThreshold: 0, faceScoreThreshold: 0, limit: 20, maxFaceNum: 5 })
const boxes = computed(() => results.value.map((face, index) => ({
  ...face.location,
  label: face.match?.[0] ? `${face.match[0].sampleId} · ${formatScore(face.match[0].confidence)}` : `${t('search.detected', { index: index + 1 })} · ${t('search.noMatch')}`,
})))

function formatScore(value) { return Number(value || 0).toFixed(2) }
function summarize(pairs) { return pairs?.length ? pairs.map(({ key, value }) => `${key}: ${String(value)}`).join(' · ') : t('common.none') }

async function submit() {
  if (!form.namespace || !form.collectionName) {
    ElMessage.warning(t('common.inputNamespaceCollection'))
    return
  }
  if (!form.imageBase64) {
    ElMessage.warning(t('common.selectImage'))
    return
  }
  loading.value = true
  results.value = []
  try {
    if (inferenceMode.value === 'cloud') {
      results.value = await searchApi.search(form)
    } else {
      const faces = await extractFaces(previewUrl.value, { scoreThreshold: form.faceScoreThreshold, limit: form.maxFaceNum })
      if (!faces.length) throw Object.assign(new Error(t('ml.noFace')), { code: 'ml.noFace' })
      results.value = await searchApi.searchEmbedding({
        namespace: form.namespace,
        collectionName: form.collectionName,
        confidenceThreshold: form.confidenceThreshold,
        limit: form.limit,
        faces,
      })
    }
  } catch (error) {
    if (error.code?.startsWith('ml.')) ElMessage.error(t(error.code))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.search-layout { display: grid; grid-template-columns: minmax(330px, 390px) minmax(0, 1fr); gap: 18px; align-items: start; }
.control-panel { position: sticky; top: 80px; }
.search-form { margin-top: 18px; }
.search-form :deep(.el-input-number) { width: 100%; }
.compact-slider + .compact-slider { margin-top: 14px; }
.compact-slider span { display: block; margin-bottom: 2px; color: #4e5b57; font-size: 11px; font-weight: 600; }
.search-button { width: 100%; margin-top: 16px; }
.inference-status { display: flex; align-items: center; gap: 7px; margin-top: 12px; color: var(--muted); font-size: 11px; }
.inference-status svg { flex: 0 0 auto; color: var(--accent); }
.result-count { color: var(--muted); font-size: 12px; }
.result-body { display: grid; gap: 22px; }
.detected-face + .detected-face { margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--line); }
.face-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 10px; }
.face-heading div span, .face-heading div strong { display: block; }
.face-heading div span { color: var(--muted); font-size: 11px; }
.face-heading div strong { margin-top: 4px; font-size: 13px; }
.face-heading > span { color: var(--muted); font-size: 11px; }
.confidence { color: var(--accent); }
@media (max-width: 1080px) { .search-layout { grid-template-columns: 1fr; } .control-panel { position: static; } }
</style>
