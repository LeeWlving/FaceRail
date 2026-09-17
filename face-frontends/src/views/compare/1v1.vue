<template>
  <PageHeader :title="t('compare.title')" :description="t('compare.description')" />
  <section class="workspace-panel">
    <div class="panel-heading"><h2>{{ t('compare.images') }}</h2><ScanFace :size="18" /></div>
    <div class="panel-body">
      <div class="compare-images">
        <div><span class="image-label">{{ t('compare.imageA') }}</span><ImageDropzone v-model="form.imageBase64A" v-model:preview-url="previewA" :label="t('image.chooseFirst')" /></div>
        <div><span class="image-label">{{ t('compare.imageB') }}</span><ImageDropzone v-model="form.imageBase64B" v-model:preview-url="previewB" :label="t('image.chooseSecond')" /></div>
      </div>
      <div class="compare-controls">
        <div class="threshold-control"><span>{{ t('compare.threshold', { value: form.faceScoreThreshold }) }}</span><el-slider v-model="form.faceScoreThreshold" :min="0" :max="100" /></div>
        <el-checkbox v-model="form.needFaceInfo">{{ t('compare.faceInfo') }}</el-checkbox>
        <el-button type="primary" :loading="loading" @click="submit"><GitCompareArrows :size="17" />{{ t('compare.start') }}</el-button>
      </div>
    </div>
  </section>

  <section v-if="result" class="workspace-panel compare-result">
    <div class="panel-heading"><h2>{{ t('compare.result') }}</h2><span class="result-grade">{{ grade }}</span></div>
    <div class="panel-body">
      <div class="metrics">
        <div><span>{{ t('compare.confidence') }}</span><strong>{{ format(result.confidence) }}</strong><small>{{ t('compare.confidenceHint') }}</small></div>
        <div><span>{{ t('compare.distance') }}</span><strong>{{ format(result.distance, 4) }}</strong><small>{{ t('compare.distanceHint') }}</small></div>
      </div>
      <div v-if="result.faceInfo" class="face-previews">
        <div><FaceOverlay :image-url="previewA" :boxes="[{ ...result.faceInfo.locationA, label: `${t('common.quality')} ${format(result.faceInfo.faceScoreA)}` }]" /></div>
        <div><FaceOverlay :image-url="previewB" :boxes="[{ ...result.faceInfo.locationB, label: `${t('common.quality')} ${format(result.faceInfo.faceScoreB)}` }]" /></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { GitCompareArrows, ScanFace } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'
import FaceOverlay from '@/components/FaceOverlay.vue'
import ImageDropzone from '@/components/ImageDropzone.vue'
import * as compareApi from '@/api/compare'
import { usePreferences } from '@/composables/usePreferences'
import { compareEmbeddings, extractFaces } from '@/ml/faceEngine'

const { t } = useI18n()
const { inferenceMode } = usePreferences()
const previewA = ref('')
const previewB = ref('')
const loading = ref(false)
const result = ref(null)
const form = reactive({ imageBase64A: '', imageBase64B: '', faceScoreThreshold: 0, needFaceInfo: true })
const grade = computed(() => {
  if (!result.value) return ''
  if (result.value.confidence >= 80) return t('compare.high')
  if (result.value.confidence >= 50) return t('compare.possible')
  return t('compare.low')
})

function format(value, digits = 2) { return Number(value || 0).toFixed(digits) }
async function submit() {
  if (!form.imageBase64A || !form.imageBase64B) {
    ElMessage.warning(t('validation.twoImages'))
    return
  }
  loading.value = true
  result.value = null
  try {
    if (inferenceMode.value === 'cloud') {
      result.value = await compareApi.compare(form)
    } else {
      const [leftFaces, rightFaces] = await Promise.all([
        extractFaces(previewA.value, { scoreThreshold: form.faceScoreThreshold, limit: 1 }),
        extractFaces(previewB.value, { scoreThreshold: form.faceScoreThreshold, limit: 1 }),
      ])
      if (!leftFaces[0] || !rightFaces[0]) throw Object.assign(new Error(t('ml.noFace')), { code: 'ml.noFace' })
      result.value = compareEmbeddings(leftFaces[0], rightFaces[0], form.needFaceInfo)
    }
  } catch (error) {
    if (error.code?.startsWith('ml.')) ElMessage.error(t(error.code))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.compare-images { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.image-label { display: block; margin-bottom: 8px; color: #4e5b57; font-size: 12px; font-weight: 700; }
.compare-controls { display: grid; grid-template-columns: minmax(260px, 1fr) auto auto; align-items: end; gap: 24px; margin-top: 20px; padding-top: 18px; border-top: 1px solid var(--line); }
.threshold-control span { display: block; margin-bottom: 4px; color: #4e5b57; font-size: 11px; font-weight: 600; }
.compare-result { margin-top: 18px; }
.result-grade { color: var(--accent); font-size: 12px; font-weight: 700; }
.metrics { display: grid; grid-template-columns: repeat(2, 1fr); border: 1px solid var(--line); border-radius: 6px; }
.metrics > div { padding: 22px; }
.metrics > div + div { border-left: 1px solid var(--line); }
.metrics span, .metrics strong, .metrics small { display: block; }
.metrics span { color: var(--muted); font-size: 11px; font-weight: 700; }
.metrics strong { margin: 7px 0 4px; color: var(--accent); font-size: 30px; }
.metrics small { color: var(--muted); font-size: 11px; }
.face-previews { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: 18px; }
@media (max-width: 760px) { .compare-images, .face-previews, .metrics { grid-template-columns: 1fr; } .compare-controls { grid-template-columns: 1fr; } .metrics > div + div { border-top: 1px solid var(--line); border-left: 0; } }
</style>
