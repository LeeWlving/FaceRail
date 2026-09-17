<template>
  <PageHeader title="创建样本" description="在指定集合中创建身份样本，并填写集合定义的扩展数据。" />
  <section class="workspace-panel">
    <div class="panel-heading"><h2>样本信息</h2><UserRoundPlus :size="18" /></div>
    <div class="panel-body">
      <SampleForm ref="formRef" v-model="form" />
      <div class="form-actions">
        <el-button type="primary" :loading="saving" @click="submit"><Save :size="16" />创建样本</el-button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Save, UserRoundPlus } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import SampleForm from '@/components/SampleForm.vue'
import * as sampleApi from '@/api/sample'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const saving = ref(false)
const form = ref({
  namespace: String(route.query.namespace || ''),
  collectionName: String(route.query.collectionName || ''),
  sampleId: '',
  sampleData: [],
})

async function submit() {
  await formRef.value.validate()
  saving.value = true
  try {
    await sampleApi.create(form.value)
    ElMessage.success('样本创建成功')
    router.push({ path: '/samples/view', query: { namespace: form.value.namespace, collectionName: form.value.collectionName, sampleId: form.value.sampleId } })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.form-actions { justify-content: flex-end; margin-top: 20px; }
</style>
