<template>
  <el-form ref="formRef" :model="model" :rules="rules" label-position="top">
    <div class="form-grid">
      <el-form-item label="命名空间" prop="namespace"><el-input v-model="model.namespace" maxlength="12" :disabled="readonlyIdentity" /></el-form-item>
      <el-form-item label="集合名称" prop="collectionName"><el-input v-model="model.collectionName" maxlength="24" :disabled="readonlyIdentity" /></el-form-item>
      <el-form-item class="span-2" label="集合描述" prop="collectionComment"><el-input v-model="model.collectionComment" type="textarea" :rows="3" maxlength="128" show-word-limit /></el-form-item>
      <el-form-item label="保留人脸图片" prop="storageFaceInfo"><el-switch v-model="model.storageFaceInfo" inline-prompt active-text="是" inactive-text="否" /></el-form-item>
      <el-form-item label="存储方式"><el-input model-value="Active Storage" disabled /></el-form-item>
      <el-form-item class="span-2" label="样本字段"><FieldEditor v-model="model.sampleColumns" mode="columns" /></el-form-item>
      <el-form-item class="span-2" label="人脸字段"><FieldEditor v-model="model.faceColumns" mode="columns" /></el-form-item>
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
  namespace: [{ required: true, message: '请输入命名空间', trigger: 'blur' }, { pattern: nameRule, message: '仅支持小写字母、数字和下划线', trigger: 'blur' }],
  collectionName: [{ required: true, message: '请输入集合名称', trigger: 'blur' }, { pattern: nameRule, message: '仅支持小写字母、数字和下划线', trigger: 'blur' }],
}

defineExpose({ validate: () => formRef.value.validate() })
</script>
