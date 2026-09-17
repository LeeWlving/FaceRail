<template>
  <el-form ref="formRef" :model="model" :rules="rules" label-position="top">
    <div class="form-grid">
      <el-form-item :label="t('common.namespace')" prop="namespace"><el-input v-model="model.namespace" maxlength="12" :disabled="readonlyIdentity" /></el-form-item>
      <el-form-item :label="t('common.collectionName')" prop="collectionName"><el-input v-model="model.collectionName" maxlength="24" :disabled="readonlyIdentity" /></el-form-item>
      <el-form-item :label="t('common.sampleId')" prop="sampleId"><el-input v-model="model.sampleId" maxlength="32" :disabled="readonlyIdentity" /></el-form-item>
      <div></div>
      <el-form-item class="span-2" :label="t('common.sampleData')"><FieldEditor v-model="model.sampleData" mode="values" /></el-form-item>
    </div>
  </el-form>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FieldEditor from './FieldEditor.vue'

defineProps({ readonlyIdentity: { type: Boolean, default: false } })
const model = defineModel({ type: Object, required: true })
const { t } = useI18n()
const formRef = ref()
const nameRule = /^[a-z0-9_]+$/
const rules = computed(() => ({
  namespace: [{ required: true, message: t('validation.namespace'), trigger: 'blur' }, { pattern: nameRule, message: t('validation.invalidFormat'), trigger: 'blur' }],
  collectionName: [{ required: true, message: t('validation.collectionName'), trigger: 'blur' }, { pattern: nameRule, message: t('validation.invalidFormat'), trigger: 'blur' }],
  sampleId: [{ required: true, message: t('validation.sampleId'), trigger: 'blur' }, { pattern: nameRule, message: t('validation.invalidFormat'), trigger: 'blur' }],
}))

defineExpose({ validate: () => formRef.value.validate() })
</script>
