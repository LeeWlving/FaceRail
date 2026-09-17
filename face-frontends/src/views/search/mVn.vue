<template>
  <PageHeader title="人脸搜索" description="从查询图片提取 ArcFace 向量，通过 pgvector 余弦距离返回最相似的人脸。" />
  <div class="search-layout">
    <section class="workspace-panel control-panel">
      <div class="panel-heading"><h2>查询条件</h2><SlidersHorizontal :size="18" /></div>
      <div class="panel-body">
        <ImageDropzone v-model="form.imageBase64" v-model:preview-url="previewUrl" label="选择查询图片" />
        <el-form label-position="top" class="search-form">
          <div class="form-grid">
            <el-form-item label="命名空间"><el-input v-model="form.namespace" /></el-form-item>
            <el-form-item label="集合名称"><el-input v-model="form.collectionName" /></el-form-item>
          </div>
        </el-form>
        <el-collapse v-model="advancedSections" class="advanced-options">
          <el-collapse-item title="高级参数" name="recognition">
            <div class="form-grid">
              <el-form-item label="返回数量"><el-input-number v-model="form.limit" :min="1" :max="100" /></el-form-item>
              <el-form-item label="最多检测人脸"><el-input-number v-model="form.maxFaceNum" :min="1" :max="20" /></el-form-item>
            </div>
            <div class="compact-slider"><span>最低匹配分 {{ form.confidenceThreshold }}</span><el-slider v-model="form.confidenceThreshold" :min="-100" :max="100" /></div>
            <div class="compact-slider"><span>人脸质量阈值 {{ form.faceScoreThreshold }}</span><el-slider v-model="form.faceScoreThreshold" :min="0" :max="100" /></div>
          </el-collapse-item>
        </el-collapse>
        <el-button class="search-button" type="primary" :loading="loading" @click="submit"><ScanSearch :size="17" />开始搜索</el-button>
      </div>
    </section>

    <section class="workspace-panel result-workspace">
      <div class="panel-heading"><h2>搜索结果</h2><span class="result-count">{{ results.length }} 张人脸</span></div>
      <div v-if="results.length" class="panel-body result-body">
        <FaceOverlay :image-url="previewUrl" :boxes="boxes" />
        <div class="detected-list">
          <section v-for="(face, index) in results" :key="index" class="detected-face">
            <div class="face-heading">
              <div><span>检测人脸 {{ index + 1 }}</span><strong>质量分 {{ formatScore(face.faceScore) }}</strong></div>
              <span>{{ face.match?.length || 0 }} 个匹配</span>
            </div>
            <el-table :data="face.match || []" empty-text="没有达到阈值的匹配" size="small">
              <el-table-column type="index" label="#" width="50" />
              <el-table-column prop="sampleId" label="样本 ID" min-width="150"><template #default="scope"><span class="mono">{{ scope.row.sampleId }}</span></template></el-table-column>
              <el-table-column label="匹配分" width="110"><template #default="scope"><strong class="confidence">{{ formatScore(scope.row.confidence) }}</strong></template></el-table-column>
              <el-table-column prop="faceId" label="人脸 ID" min-width="210" show-overflow-tooltip />
              <el-table-column label="样本数据" min-width="190" show-overflow-tooltip><template #default="scope">{{ summarize(scope.row.sampleData) }}</template></el-table-column>
            </el-table>
          </section>
        </div>
      </div>
      <div v-else v-loading="loading" class="empty-state"><div><ScanSearch :size="36" /><span>上传图片并开始搜索</span></div></div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ScanSearch, SlidersHorizontal } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import FaceOverlay from '@/components/FaceOverlay.vue'
import ImageDropzone from '@/components/ImageDropzone.vue'
import * as searchApi from '@/api/search'

const previewUrl = ref('')
const loading = ref(false)
const results = ref([])
const advancedSections = ref([])
const form = reactive({ namespace: '', collectionName: '', imageBase64: '', confidenceThreshold: 0, faceScoreThreshold: 0, limit: 20, maxFaceNum: 5 })
const boxes = computed(() => results.value.map((face, index) => ({
  ...face.location,
  label: face.match?.[0] ? `${face.match[0].sampleId} · ${formatScore(face.match[0].confidence)}` : `人脸 ${index + 1} · 未匹配`,
})))

function formatScore(value) { return Number(value || 0).toFixed(2) }
function summarize(pairs) { return pairs?.length ? pairs.map(({ key, value }) => `${key}: ${String(value)}`).join(' · ') : '无' }

async function submit() {
  if (!form.namespace || !form.collectionName) {
    ElMessage.warning('请输入命名空间和集合名称')
    return
  }
  if (!form.imageBase64) {
    ElMessage.warning('请选择查询图片')
    return
  }
  loading.value = true
  results.value = []
  try {
    const payload = { namespace: form.namespace, collectionName: form.collectionName, imageBase64: form.imageBase64 }
    if (advancedSections.value.includes('recognition')) {
      Object.assign(payload, {
        confidenceThreshold: form.confidenceThreshold,
        faceScoreThreshold: form.faceScoreThreshold,
        limit: form.limit,
        maxFaceNum: form.maxFaceNum,
      })
    }
    results.value = await searchApi.search(payload)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.search-layout { display: grid; grid-template-columns: minmax(330px, 390px) minmax(0, 1fr); gap: 18px; align-items: start; }
.control-panel { position: sticky; top: 80px; }
.search-form { margin-top: 18px; }
.search-form :deep(.el-input-number), .advanced-options :deep(.el-input-number) { width: 100%; }
.advanced-options { margin-top: 4px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.advanced-options :deep(.el-collapse-item__header) { height: 42px; color: var(--muted); font-size: 12px; font-weight: 700; }
.advanced-options :deep(.el-collapse-item__wrap) { border-bottom: 0; }
.advanced-options :deep(.el-collapse-item__content) { padding-bottom: 14px; }
.compact-slider + .compact-slider { margin-top: 14px; }
.compact-slider span { display: block; margin-bottom: 2px; color: #4e5b57; font-size: 11px; font-weight: 600; }
.search-button { width: 100%; margin-top: 16px; }
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
