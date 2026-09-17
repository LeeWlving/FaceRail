<template>
  <el-card>
    <div slot="header" class="clearfix">
      <el-form label-width="100px" ref="form" :model="value">
        <el-form-item label="命名空间" prop="namespace" required>
          <el-input v-model="value.namespace"/>
        </el-form-item>
        <el-form-item label="集合名称" prop="collectionName" required>
          <el-input v-model="value.collectionName"/>
        </el-form-item>
        <el-form-item label="样本编号" prop="sampleId" required>
          <el-input v-model="value.sampleId"/>
        </el-form-item>
        <el-form-item label="样本数据" prop="sampleData">
          <key-value-field v-model="value.sampleData"/>
        </el-form-item>
        <slot name="ext" :data="value">
          <el-form-item>
            <el-button type="primary" @click="onSubmit">更新样本</el-button>
            <el-button type="danger" @click="onDelete">删除样本</el-button>
          </el-form-item>
        </slot>
      </el-form>
    </div>
  </el-card>
</template>

<script>
import {update, remove} from "@/api/sample";
import KeyValueField from "@/components/KeyValueField";
export default {
  name: "SampleItem",
  components: {KeyValueField},
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  methods: {
    validate (callback) {
      this.$refs.form.validate(callback)
    },
    onSubmit () {
      this.$refs.form.validate(success => {
        if (success) {
          update(this.value).then(res => {
            this.$emit('on-submit', res)
          })
        }
      })
    },
    onDelete () {
      remove(this.value).then(res => {
        this.$emit('on-delete', res)
      })
    }
  }
}
</script>

<style scoped>

</style>
