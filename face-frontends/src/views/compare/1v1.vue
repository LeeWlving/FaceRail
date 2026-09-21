<template>
  <PageHeader :title="$t('人脸比对')" :description="$t('分别提取两张图片的人脸向量，返回相似度置信分和欧氏距离。')" />
  <section class="workspace-panel">
    <div class="panel-heading"><h2>{{ $t('比对图片') }}</h2><ScanFace :size="18" /></div>
    <div class="panel-body">
      <div class="compare-images">
        <div><span class="image-label">{{ $t('图片 A') }}</span><ImageDropzone v-model="form.imageBase64A" v-model:preview-url="previewA" :label="$t('选择第一张图片')" /></div>
        <div><span class="image-label">{{ $t('图片 B') }}</span><ImageDropzone v-model="form.imageBase64B" v-model:preview-url="previewB" :label="$t('选择第二张图片')" /></div>
      </div>
      <div class="compare-controls">
        <el-collapse v-model="advancedSections" class="advanced-options">
          <el-collapse-item :title="$t('高级参数')" name="recognition">
            <div class="threshold-control"><span>{{ $t('人脸质量阈值') }} {{ form.faceScoreThreshold }}</span><el-slider v-model="form.faceScoreThreshold" :min="0" :max="100" /></div>
            <el-checkbox v-model="form.needFaceInfo">{{ $t('返回人脸位置与质量分') }}</el-checkbox>
          </el-collapse-item>
        </el-collapse>
        <el-button type="primary" :loading="loading" @click="submit"><GitCompareArrows :size="17" />{{ $t('开始比对') }}</el-button>
      </div>
    </div>
  </section>

  <section v-if="result" class="workspace-panel compare-result">
    <div class="panel-heading"><h2>{{ $t('比对结果') }}</h2><span class="result-grade">{{ grade }}</span></div>
    <div class="panel-body">
      <div class="metrics">
        <div><span>{{ $t('相似度置信分') }}</span><strong>{{ format(result.confidence) }}</strong><small>{{ $t('-100 至 100，越高越相似') }}</small></div>
        <div><span>{{ $t('向量欧氏距离') }}</span><strong>{{ format(result.distance, 4) }}</strong><small>{{ $t('距离越小越相似') }}</small></div>
      </div>
      <div v-if="result.faceInfo" class="face-previews">
        <div><FaceOverlay :image-url="previewA" :boxes="[{ ...result.faceInfo.locationA, label: `${translate('质量分')} ${format(result.faceInfo.faceScoreA)}` }]" /></div>
        <div><FaceOverlay :image-url="previewB" :boxes="[{ ...result.faceInfo.locationB, label: `${translate('质量分')} ${format(result.faceInfo.faceScoreB)}` }]" /></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { translate } from '@/i18n'
import { computed, reactive, ref } from 'vue'
import { GitCompareArrows, ScanFace } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import FaceOverlay from '@/components/FaceOverlay.vue'
import ImageDropzone from '@/components/ImageDropzone.vue'
import * as compareApi from '@/api/compare'

const previewA = ref('')
const previewB = ref('')
const loading = ref(false)
const result = ref(null)
const advancedSections = ref([])
const form = reactive({ imageBase64A: '', imageBase64B: '', faceScoreThreshold: 0, needFaceInfo: true })
const grade = computed(() => {
  if (!result.value) return ''
  if (result.value.confidence >= 80) return translate('高度相似')
  if (result.value.confidence >= 50) return translate('可能相似')
  return translate('相似度较低')
})

function format(value, digits = 2) { return Number(value || 0).toFixed(digits) }
async function submit() {
  if (!form.imageBase64A || !form.imageBase64B) {
    ElMessage.warning(translate('请选择两张待比对图片'))
    return
  }
  loading.value = true
  result.value = null
  try {
    const payload = { imageBase64A: form.imageBase64A, imageBase64B: form.imageBase64B }
    if (advancedSections.value.includes('recognition')) {
      Object.assign(payload, { faceScoreThreshold: form.faceScoreThreshold, needFaceInfo: form.needFaceInfo })
    }
    result.value = await compareApi.compare(payload)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.compare-images { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.image-label { display: block; margin-bottom: 8px; color: #4e5b57; font-size: 12px; font-weight: 700; }
.compare-controls { display: grid; grid-template-columns: minmax(260px, 1fr) auto; align-items: end; gap: 24px; margin-top: 20px; padding-top: 18px; border-top: 1px solid var(--line); }
.advanced-options { border-top: 0; border-bottom: 0; }
.advanced-options :deep(.el-collapse-item__header) { height: 34px; color: var(--muted); font-size: 12px; font-weight: 700; }
.advanced-options :deep(.el-collapse-item__wrap) { border-bottom: 0; }
.advanced-options :deep(.el-collapse-item__content) { padding: 4px 0 0; }
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
