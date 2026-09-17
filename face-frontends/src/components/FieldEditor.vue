<template>
  <div class="field-editor">
    <div class="field-toolbar">
      <span>{{ mode === 'columns' ? '字段定义' : '扩展数据' }}</span>
      <el-button size="small" @click="addRow"><Plus :size="15" />添加</el-button>
    </div>
    <el-table :data="modelValue" empty-text="暂无字段" size="small">
      <el-table-column label="名称" min-width="150">
        <template #default="{ row, $index }">
          <el-input :model-value="mode === 'columns' ? row.name : row.key" placeholder="字段名称" @update:model-value="updateRow($index, mode === 'columns' ? 'name' : 'key', $event)" />
        </template>
      </el-table-column>
      <el-table-column v-if="mode === 'columns'" label="类型" width="140">
        <template #default="{ row, $index }">
          <el-select :model-value="row.dataType" placeholder="类型" @update:model-value="updateRow($index, 'dataType', $event)">
            <el-option v-for="type in dataTypes" :key="type" :label="type" :value="type" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column :label="mode === 'columns' ? '描述' : '值'" min-width="180">
        <template #default="{ row, $index }">
          <el-input :model-value="mode === 'columns' ? row.comment : row.value" :placeholder="mode === 'columns' ? '字段描述' : '字段值'" @update:model-value="updateRow($index, mode === 'columns' ? 'comment' : 'value', $event)" />
        </template>
      </el-table-column>
      <el-table-column width="52" align="right">
        <template #default="{ $index }">
          <el-tooltip content="删除" placement="left">
            <button class="row-delete" type="button" @click="removeRow($index)"><Trash2 :size="15" /></button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { Plus, Trash2 } from '@lucide/vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  mode: { type: String, default: 'values', validator: (value) => ['columns', 'values'].includes(value) },
})
const emit = defineEmits(['update:modelValue'])
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
