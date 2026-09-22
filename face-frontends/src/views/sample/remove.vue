<template>
  <PageHeader :title="$t('删除样本')" :description="$t('删除样本会同时删除其人脸记录和已存储图片，此操作不可恢复。')" />
  <section class="workspace-panel danger-panel">
    <div class="panel-heading"><h2>{{ $t('危险操作') }}</h2><TriangleAlert :size="18" /></div>
    <div class="panel-body">
      <el-alert :title="$t('确认该身份样本已不再参与搜索')" type="error" :closable="false" show-icon />
      <el-form label-position="top" class="remove-form">
        <div class="form-grid">
          <el-form-item :label="$t('命名空间')"><el-input v-model="form.namespace" /></el-form-item>
          <el-form-item :label="$t('集合名称')"><el-input v-model="form.collectionName" /></el-form-item>
          <el-form-item :label="$t('样本 ID')"><el-input v-model="form.sampleId" /></el-form-item>
        </div>
      </el-form>
      <div class="form-actions"><el-button type="danger" :loading="removing" @click="submit"><Trash2 :size="16" />{{ $t('永久删除') }}</el-button></div>
    </div>
  </section>
</template>

<script setup>
import { translate, translateWith } from '@/i18n'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Trash2, TriangleAlert } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import * as sampleApi from '@/api/sample'

const route = useRoute()
const router = useRouter()
const removing = ref(false)
const form = reactive({ namespace: String(route.query.namespace || ''), collectionName: String(route.query.collectionName || ''), sampleId: String(route.query.sampleId || '') })

async function submit() {
  if (!form.namespace || !form.collectionName || !form.sampleId) {
    ElMessage.warning(translate('请输入完整的样本标识'))
    return
  }
  await ElMessageBox.confirm(translateWith('确认删除样本 {name}？', { name: form.sampleId }), translate('删除样本'), { type: 'error', confirmButtonText: translate('确认删除'), cancelButtonText: translate('取消') })
  removing.value = true
  try {
    await sampleApi.remove(form)
    ElMessage.success(translate('样本已删除'))
    router.push({ path: '/samples', query: { namespace: form.namespace, collectionName: form.collectionName } })
  } finally {
    removing.value = false
  }
}
</script>

<style scoped>
.danger-panel { border-color: #e8b8b2; }
.danger-panel .panel-heading { color: var(--danger); background: #fff7f6; }
.remove-form { margin-top: 22px; }
.form-actions { justify-content: flex-end; }
</style>
