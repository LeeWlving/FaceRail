<template>
  <div class="field-editor">
    <div class="field-toolbar">
      <span>{{ t(mode === 'columns' ? 'fields.definitions' : 'fields.extraData') }}</span>
      <el-button size="small" @click="addRow"><Plus :size="15" />{{ t('common.add') }}</el-button>
    </div>
    <el-table :data="modelValue" :empty-text="t('fields.empty')" size="small">
      <el-table-column :label="t('common.fieldName')" min-width="150">
        <template #default="{ row, $index }">
          <el-input :model-value="mode === 'columns' ? row.name : row.key" :placeholder="t('fields.placeholderName')" @update:model-value="updateRow($index, mode === 'columns' ? 'name' : 'key', $event)" />
        </template>
      </el-table-column>
      <el-table-column v-if="mode === 'columns'" :label="t('common.fieldType')" width="140">
        <template #default="{ row, $index }">
          <el-select :model-value="row.dataType" :placeholder="t('fields.placeholderType')" @update:model-value="updateRow($index, 'dataType', $event)">
            <el-option v-for="type in dataTypes" :key="type" :label="type" :value="type" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column :label="t(mode === 'columns' ? 'common.fieldDescription' : 'common.fieldValue')" min-width="180">
        <template #default="{ row, $index }">
          <el-input :model-value="mode === 'columns' ? row.comment : row.value" :placeholder="t(mode === 'columns' ? 'fields.placeholderDescription' : 'fields.placeholderValue')" @update:model-value="updateRow($index, mode === 'columns' ? 'comment' : 'value', $event)" />
        </template>
      </el-table-column>
      <el-table-column width="52" align="right">
        <template #default="{ $index }">
          <el-tooltip :content="t('common.delete')" placement="left">
            <button class="row-delete" type="button" @click="removeRow($index)"><Trash2 :size="15" /></button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { Plus, Trash2 } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  mode: { type: String, default: 'values', validator: (value) => ['columns', 'values'].includes(value) },
})
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
const dataTypes = ['STRING', 'INT', 'FLOAT', 'DOUBLE', 'BOOL']

function addRow() {
  const row = props.mode === 'columns' ? { name: '', dataType: 'STRING', comment: '' } : { key: '', value: '' }
  emit('update:modelValue', [...props.modelValue, row])
}

function updateRow(index, key, value) {
  const rows = props.modelValue.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row)
  emit('update:modelValue', rows)
}

function removeRow(index) {
  emit('update:modelValue', props.modelValue.filter((_, rowIndex) => rowIndex !== index))
}
</script>

<style scoped>
.field-editor { overflow: hidden; border: 1px solid var(--line); border-radius: 6px; }
.field-toolbar { display: flex; min-height: 46px; align-items: center; justify-content: space-between; padding: 8px 10px 8px 14px; border-bottom: 1px solid var(--line); background: var(--surface-soft); }
.field-toolbar span { color: #4d5a56; font-size: 12px; font-weight: 700; }
.row-delete { display: inline-grid; width: 30px; height: 30px; place-items: center; border: 0; border-radius: 5px; color: var(--danger); background: transparent; cursor: pointer; }
.row-delete:hover { background: #fff0ee; }
</style>
