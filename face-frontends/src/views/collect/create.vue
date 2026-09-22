<template>
  <PageHeader :title="$t('创建集合')" :description="$t('定义命名空间、数据结构和人脸图片留存策略。')" />
  <section class="workspace-panel">
    <div class="panel-heading"><h2>{{ $t('集合配置') }}</h2><Database :size="18" /></div>
    <div class="panel-body">
      <CollectionForm ref="formRef" v-model="form" />
      <div class="form-actions">
        <el-button type="primary" :loading="saving" @click="submit"><Save :size="16" />{{ $t('创建集合') }}</el-button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { translate } from '@/i18n'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Database, Save } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import CollectionForm from '@/components/CollectionForm.vue'
import * as collectApi from '@/api/collect'

const router = useRouter()
const formRef = ref()
const saving = ref(false)
const form = ref({
  namespace: '',
  collectionName: '',
  collectionComment: '',
  storageFaceInfo: true,
  sampleColumns: [],
  faceColumns: [],
})

async function submit() {
  await formRef.value.validate()
  saving.value = true
  try {
    await collectApi.create(form.value)
    ElMessage.success(translate('集合创建成功'))
    router.push({ path: '/collections', query: { namespace: form.value.namespace } })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.form-actions { justify-content: flex-end; margin-top: 20px; }
</style>
