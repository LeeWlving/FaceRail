<template>
  <PageHeader :title="t('face.title')" :description="t('face.description')" />
  <div class="face-create-layout">
    <section class="workspace-panel">
      <div class="panel-heading"><h2>{{ t('face.identity') }}</h2><ScanFace :size="18" /></div>
      <div class="panel-body">
        <ImageDropzone v-model="form.imageBase64" v-model:preview-url="previewUrl" :label="t('image.chooseSample')" />
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="identity-form">
          <div class="form-grid">
            <el-form-item :label="t('common.namespace')" prop="namespace"><el-input v-model="form.namespace" /></el-form-item>
            <el-form-item :label="t('common.collectionName')" prop="collectionName"><el-input v-model="form.collectionName" /></el-form-item>
            <el-form-item :label="t('common.sampleId')" prop="sampleId"><el-input v-model="form.sampleId" /></el-form-item>
          </div>
        </el-form>
      </div>
    </section>

    <section class="workspace-panel">
      <div class="panel-heading"><h2>{{ t('face.parameters') }}</h2><SlidersHorizontal :size="18" /></div>
      <div class="panel-body">
        <div class="slider-field">
          <div><strong>{{ t('face.threshold') }}</strong><span>{{ t('face.thresholdHint') }}</span></div>
          <el-slider v-model="form.faceScoreThreshold" :min="0" :max="100" show-input />
        </div>
        <div class="slider-field">
          <div><strong>{{ t('face.sameThreshold') }}</strong><span>{{ t('face.sameHint') }}</span></div>
          <el-slider v-model="form.minConfidenceThresholdWithThisSample" :min="0" :max="100" show-input />
        </div>
        <div class="slider-field">
          <div><strong>{{ t('face.otherThreshold') }}</strong><span>{{ t('face.otherHint') }}</span></div>
          <el-slider v-model="form.maxConfidenceThresholdWithOtherSample" :min="0" :max="100" show-input />
        </div>
        <div class="face-data"><FieldEditor v-model="form.faceData" mode="values" /></div>
        <div class="inference-status"><component :is="inferenceMode === 'device' ? Laptop : Cloud" :size="15" /><span>{{ t(inferenceMode === 'device' ? 'ml.deviceReady' : 'ml.cloudReady') }}</span></div>
        <div class="form-actions"><el-button type="primary" :loading="saving" @click="submit"><Upload :size="16" />{{ t('common.submit') }}</el-button></div>
      </div>
    </section>
  </div>

  <section v-if="createdFace" class="workspace-panel result-panel">
    <div class="panel-heading"><h2>{{ t(createdFace.embeddingStatus === 'ready' ? 'face.completed' : 'face.queued') }}</h2><StatusTag :status="createdFace.embeddingStatus" /></div>
    <div class="panel-body created-result">
      <div><span>{{ t('common.faceId') }}</span><strong class="mono">{{ createdFace.faceId }}</strong></div>
      <div><span>{{ t('face.sample') }}</span><strong>{{ createdFace.sampleId }}</strong></div>
      <el-button @click="openSample"><ArrowRight :size="16" />{{ t('face.viewStatus') }}</el-button>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, Cloud, Laptop, ScanFace, SlidersHorizontal, Upload } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'
import FieldEditor from '@/components/FieldEditor.vue'
import ImageDropzone from '@/components/ImageDropzone.vue'
import StatusTag from '@/components/StatusTag.vue'
import * as faceApi from '@/api/face'
import * as collectApi from '@/api/collect'
import { usePreferences } from '@/composables/usePreferences'
import { extractFaces } from '@/ml/faceEngine'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { inferenceMode } = usePreferences()
const formRef = ref()
const saving = ref(false)
const previewUrl = ref('')
const createdFace = ref(null)
const form = reactive({
  namespace: String(route.query.namespace || ''),
  collectionName: String(route.query.collectionName || ''),
  sampleId: String(route.query.sampleId || ''),
  imageBase64: '',
  faceScoreThreshold: 0,
  minConfidenceThresholdWithThisSample: 0,
  maxConfidenceThresholdWithOtherSample: 0,
  faceData: [],
})
const required = (message) => [{ required: true, message, trigger: 'blur' }]
const rules = computed(() => ({ namespace: required(t('validation.namespace')), collectionName: required(t('validation.collectionName')), sampleId: required(t('validation.sampleId')) }))

async function submit() {
  await formRef.value.validate()
  if (!form.imageBase64) {
    ElMessage.warning(t('validation.image'))
    return
  }
  saving.value = true
  try {
    if (inferenceMode.value === 'cloud') {
      createdFace.value = await faceApi.create(form)
      ElMessage.success(t('face.cloudSuccess'))
    } else {
      const [face] = await extractFaces(previewUrl.value, { scoreThreshold: form.faceScoreThreshold, limit: 1 })
      if (!face) throw Object.assign(new Error(t('ml.noFace')), { code: 'ml.noFace' })
      const collection = await collectApi.view({ namespace: form.namespace, collectionName: form.collectionName })
      createdFace.value = await faceApi.createEmbedding({
        namespace: form.namespace,
        collectionName: form.collectionName,
        sampleId: form.sampleId,
        faceScore: face.faceScore,
        location: face.location,
        embedding: face.embedding,
        faceImageBase64: collection.storageFaceInfo ? face.faceImageBase64.split(',')[1] : undefined,
        minConfidenceThresholdWithThisSample: form.minConfidenceThresholdWithThisSample,
        maxConfidenceThresholdWithOtherSample: form.maxConfidenceThresholdWithOtherSample,
        faceData: form.faceData,
      })
      ElMessage.success(t('face.deviceSuccess'))
    }
  } catch (error) {
    if (error.code?.startsWith('ml.')) ElMessage.error(t(error.code))
  } finally {
    saving.value = false
  }
}
function openSample() {
  router.push({ path: '/samples/view', query: { namespace: form.namespace, collectionName: form.collectionName, sampleId: form.sampleId } })
}
</script>

<style scoped>
.face-create-layout { display: grid; grid-template-columns: minmax(360px, 0.9fr) minmax(420px, 1.1fr); gap: 18px; align-items: start; }
.identity-form { margin-top: 20px; }
.identity-form .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.slider-field + .slider-field { margin-top: 22px; }
.slider-field > div { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
.slider-field strong { font-size: 12px; }
.slider-field span { color: var(--muted); font-size: 11px; }
.face-data { margin-top: 26px; }
.form-actions { justify-content: flex-end; margin-top: 20px; }
.inference-status { display: flex; align-items: center; justify-content: flex-end; gap: 7px; margin-top: 20px; color: var(--muted); font-size: 11px; }
.inference-status svg { color: var(--accent); }
.result-panel { margin-top: 18px; }
.created-result { display: grid; grid-template-columns: minmax(220px, 1fr) minmax(140px, 0.5fr) auto; align-items: center; gap: 20px; }
.created-result span, .created-result strong { display: block; }
.created-result span { margin-bottom: 6px; color: var(--muted); font-size: 11px; }
@media (max-width: 1050px) { .face-create-layout { grid-template-columns: 1fr; } }
@media (max-width: 620px) { .identity-form .form-grid, .created-result { grid-template-columns: 1fr; } }
</style>
