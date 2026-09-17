<template>
  <el-form ref="formRef" :model="model" :rules="rules" label-position="top">
    <div class="form-grid">
      <el-form-item label="命名空间" prop="namespace"><el-input v-model="model.namespace" maxlength="12" :disabled="readonlyIdentity" /></el-form-item>
      <el-form-item label="集合名称" prop="collectionName"><el-input v-model="model.collectionName" maxlength="24" :disabled="readonlyIdentity" /></el-form-item>
      <el-form-item label="样本 ID" prop="sampleId"><el-input v-model="model.sampleId" maxlength="32" :disabled="readonlyIdentity" /></el-form-item>
      <div></div>
      <el-form-item class="span-2" label="样本扩展数据"><FieldEditor v-model="model.sampleData" mode="values" /></el-form-item>
    </div>
  </el-form>
</template>

<script setup>
import { ref } from 'vue'
import FieldEditor from './FieldEditor.vue'

defineProps({ readonlyIdentity: { type: Boolean, default: false } })
const model = defineModel({ type: Object, required: true })
const formRef = ref()
const nameRule = /^[a-z0-9_]+$/
const rules = {
  namespace: [{ required: true, message: '请输入命名空间', trigger: 'blur' }, { pattern: nameRule, message: '格式不正确', trigger: 'blur' }],
  collectionName: [{ required: true, message: '请输入集合名称', trigger: 'blur' }, { pattern: nameRule, message: '格式不正确', trigger: 'blur' }],
  sampleId: [{ required: true, message: '请输入样本 ID', trigger: 'blur' }, { pattern: nameRule, message: '格式不正确', trigger: 'blur' }],
}

defineExpose({ validate: () => formRef.value.validate() })
</script>
