<template>
  <PageHeader :title="$t('录入人脸')" :description="$t('上传样本图片后，后台任务会检测人脸并生成 ArcFace 向量。')" />
  <div class="face-create-layout">
    <section class="workspace-panel">
      <div class="panel-heading"><h2>{{ $t('图片与归属') }}</h2><ScanFace :size="18" /></div>
      <div class="panel-body">
        <ImageDropzone v-model="form.imageBase64" v-model:preview-url="previewUrl" :label="$t('选择样本人脸图片')" />
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="identity-form">
          <div class="form-grid">
            <el-form-item :label="$t('命名空间')" prop="namespace"><el-input v-model="form.namespace" /></el-form-item>
            <el-form-item :label="$t('集合名称')" prop="collectionName"><el-input v-model="form.collectionName" /></el-form-item>
            <el-form-item :label="$t('样本 ID')" prop="sampleId"><el-input v-model="form.sampleId" /></el-form-item>
          </div>
        </el-form>
      </div>
    </section>

    <section class="workspace-panel">
      <div class="panel-heading"><h2>{{ $t('人脸数据') }}</h2><SlidersHorizontal :size="18" /></div>
      <div class="panel-body">
        <FieldEditor v-model="form.faceData" mode="values" />
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
        <div class="form-actions"><el-button type="primary" :loading="saving" @click="submit"><Upload :size="16" />{{ $t('提交处理') }}</el-button></div>
      </div>
    </section>
  </div>

  <section v-if="createdFace" class="workspace-panel result-panel">
    <div class="panel-heading"><h2>{{ $t('已进入处理队列') }}</h2><StatusTag :status="createdFace.embeddingStatus" /></div>
    <div class="panel-body created-result">
      <div><span>{{ $t('人脸 ID') }}</span><strong class="mono">{{ createdFace.faceId }}</strong></div>
      <div><span>{{ $t('样本') }}</span><strong>{{ createdFace.sampleId }}</strong></div>
      <el-button @click="openSample"><ArrowRight :size="16" />{{ $t('查看处理状态') }}</el-button>
    </div>
  </section>
</template>

<script setup>
import { translate } from '@/i18n'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, ScanFace, SlidersHorizontal, Upload } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import FieldEditor from '@/components/FieldEditor.vue'
import ImageDropzone from '@/components/ImageDropzone.vue'
import StatusTag from '@/components/StatusTag.vue'
import * as faceApi from '@/api/face'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const saving = ref(false)
const previewUrl = ref('')
const createdFace = ref(null)
const advancedSections = ref([])
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
const rules = { namespace: required(translate('请输入命名空间')), collectionName: required(translate('请输入集合名称')), sampleId: required(translate('请输入样本 ID')) }

async function submit() {
  await formRef.value.validate()
  if (!form.imageBase64) {
    ElMessage.warning(translate('请选择人脸图片'))
    return
  }
  saving.value = true
  try {
    const payload = {
      namespace: form.namespace,
      collectionName: form.collectionName,
      sampleId: form.sampleId,
      imageBase64: form.imageBase64,
      faceData: form.faceData,
    }
    if (advancedSections.value.includes('recognition')) {
      Object.assign(payload, {
        faceScoreThreshold: form.faceScoreThreshold,
        minConfidenceThresholdWithThisSample: form.minConfidenceThresholdWithThisSample,
        maxConfidenceThresholdWithOtherSample: form.maxConfidenceThresholdWithOtherSample,
      })
    }
    createdFace.value = await faceApi.create(payload)
    ElMessage.success(translate('人脸已提交，正在后台生成向量'))
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
.advanced-options { margin-top: 22px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.advanced-options :deep(.el-collapse-item__header) { height: 42px; color: var(--muted); font-size: 12px; font-weight: 700; }
.advanced-options :deep(.el-collapse-item__wrap) { border-bottom: 0; }
.advanced-options :deep(.el-collapse-item__content) { padding-bottom: 18px; }
.slider-field + .slider-field { margin-top: 22px; }
.slider-field > div { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
.slider-field strong { font-size: 12px; }
.slider-field span { color: var(--muted); font-size: 11px; }
.form-actions { justify-content: flex-end; margin-top: 20px; }
.result-panel { margin-top: 18px; }
.created-result { display: grid; grid-template-columns: minmax(220px, 1fr) minmax(140px, 0.5fr) auto; align-items: center; gap: 20px; }
.created-result span, .created-result strong { display: block; }
.created-result span { margin-bottom: 6px; color: var(--muted); font-size: 11px; }
@media (max-width: 1050px) { .face-create-layout { grid-template-columns: 1fr; } }
@media (max-width: 620px) { .identity-form .form-grid, .created-result { grid-template-columns: 1fr; } }
</style>
