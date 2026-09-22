<template>
  <PageHeader :title="$t('创建样本')" :description="$t('创建身份样本并上传首张人脸，后台会自动生成可搜索的 ArcFace 向量。')" />
  <div class="sample-create-layout">
    <section class="workspace-panel">
      <div class="panel-heading"><h2>{{ $t('样本信息') }}</h2><UserRoundPlus :size="18" /></div>
      <div class="panel-body">
        <SampleForm ref="formRef" v-model="form" />
      </div>
    </section>

    <section class="workspace-panel">
      <div class="panel-heading"><h2>{{ $t('首张人脸') }}</h2><ScanFace :size="18" /></div>
      <div class="panel-body">
        <ImageDropzone v-model="form.imageBase64" v-model:preview-url="previewUrl" :label="$t('选择样本人脸图片')" />
        <div class="face-data"><FieldEditor v-model="form.faceData" mode="values" /></div>
        <el-collapse v-model="advancedSections" class="advanced-options">
          <el-collapse-item :title="$t('高级参数')" name="recognition">
            <div class="slider-field">
              <div><strong>{{ $t('人脸质量阈值') }}</strong><span>{{ $t('模型默认') }}</span></div>
              <el-slider v-model="form.faceScoreThreshold" :min="0" :max="100" show-input />
            </div>
            <div class="slider-field">
              <div><strong>{{ $t('同样本最低相似度') }}</strong><span>{{ $t('默认关闭') }}</span></div>
              <el-slider v-model="form.minConfidenceThresholdWithThisSample" :min="0" :max="100" show-input />
            </div>
            <div class="slider-field">
              <div><strong>{{ $t('异样本最高相似度') }}</strong><span>{{ $t('默认关闭') }}</span></div>
              <el-slider v-model="form.maxConfidenceThresholdWithOtherSample" :min="0" :max="100" show-input />
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </section>
  </div>
  <div class="form-actions">
    <el-button type="primary" :loading="saving" @click="submit"><Save :size="16" />{{ $t('创建样本') }}</el-button>
  </div>
</template>

<script setup>
import { translate } from '@/i18n'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Save, ScanFace, UserRoundPlus } from '@lucide/vue'
import FieldEditor from '@/components/FieldEditor.vue'
import ImageDropzone from '@/components/ImageDropzone.vue'
import PageHeader from '@/components/PageHeader.vue'
import SampleForm from '@/components/SampleForm.vue'
import * as sampleApi from '@/api/sample'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const saving = ref(false)
const previewUrl = ref('')
const advancedSections = ref([])
const form = ref({
  namespace: String(route.query.namespace || ''),
  collectionName: String(route.query.collectionName || ''),
  sampleId: '',
  sampleData: [],
  imageBase64: '',
  faceData: [],
  faceScoreThreshold: 0,
  minConfidenceThresholdWithThisSample: 0,
  maxConfidenceThresholdWithOtherSample: 0,
})

async function submit() {
  await formRef.value.validate()
  if (!form.value.imageBase64) {
    ElMessage.warning(translate('请选择样本人脸图片'))
    return
  }
  saving.value = true
  try {
    const payload = {
      namespace: form.value.namespace,
      collectionName: form.value.collectionName,
      sampleId: form.value.sampleId,
      sampleData: form.value.sampleData,
      imageBase64: form.value.imageBase64,
      faceData: form.value.faceData,
    }
    if (advancedSections.value.includes('recognition')) {
      Object.assign(payload, {
        faceScoreThreshold: form.value.faceScoreThreshold,
        minConfidenceThresholdWithThisSample: form.value.minConfidenceThresholdWithThisSample,
        maxConfidenceThresholdWithOtherSample: form.value.maxConfidenceThresholdWithOtherSample,
      })
    }
    await sampleApi.create(payload)
    ElMessage.success(translate('样本已创建，正在生成人脸向量'))
    router.push({ path: '/samples/view', query: { namespace: form.value.namespace, collectionName: form.value.collectionName, sampleId: form.value.sampleId } })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.sample-create-layout { display: grid; grid-template-columns: minmax(440px, 1fr) minmax(390px, 0.9fr); gap: 18px; align-items: start; }
.sample-create-layout > .workspace-panel { min-width: 0; }
.face-data { margin-top: 22px; }
.advanced-options { margin-top: 22px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.advanced-options :deep(.el-collapse-item__header) { height: 42px; color: var(--muted); font-size: 12px; font-weight: 700; }
.advanced-options :deep(.el-collapse-item__wrap) { border-bottom: 0; }
.advanced-options :deep(.el-collapse-item__content) { padding-bottom: 18px; }
.slider-field + .slider-field { margin-top: 22px; }
.slider-field > div { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
.slider-field strong { font-size: 12px; }
.slider-field span { color: var(--muted); font-size: 11px; }
.form-actions { justify-content: flex-end; margin-top: 20px; }
@media (max-width: 1050px) { .sample-create-layout { grid-template-columns: 1fr; } }
</style>
