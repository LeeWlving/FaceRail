<template>
  <el-form ref="formRef" :model="model" :rules="rules" label-position="top">
    <div class="form-grid">
      <el-form-item :label="t('common.namespace')" prop="namespace"><el-input v-model="model.namespace" maxlength="12" :disabled="readonlyIdentity" /></el-form-item>
      <el-form-item :label="t('common.collectionName')" prop="collectionName"><el-input v-model="model.collectionName" maxlength="24" :disabled="readonlyIdentity" /></el-form-item>
      <el-form-item class="span-2" :label="t('common.collectionDescription')" prop="collectionComment"><el-input v-model="model.collectionComment" type="textarea" :rows="3" maxlength="128" show-word-limit /></el-form-item>
      <el-form-item :label="t('collection.retainFace')" prop="storageFaceInfo"><el-switch v-model="model.storageFaceInfo" inline-prompt :active-text="t('common.yes')" :inactive-text="t('common.no')" /></el-form-item>
      <el-form-item :label="t('common.storage')"><el-input model-value="Active Storage" disabled /></el-form-item>
      <el-form-item class="span-2" :label="t('common.sampleFields')"><FieldEditor v-model="model.sampleColumns" mode="columns" /></el-form-item>
      <el-form-item class="span-2" :label="t('common.faceFields')"><FieldEditor v-model="model.faceColumns" mode="columns" /></el-form-item>
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
  namespace: [{ required: true, message: t('validation.namespace'), trigger: 'blur' }, { pattern: nameRule, message: t('validation.identifier'), trigger: 'blur' }],
  collectionName: [{ required: true, message: t('validation.collectionName'), trigger: 'blur' }, { pattern: nameRule, message: t('validation.identifier'), trigger: 'blur' }],
}))

defineExpose({ validate: () => formRef.value.validate() })
</script>
