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
        <el-form-item label="集合描述" prop="collectionComment">
          <el-input type="textarea" v-model="value.collectionComment"/>
        </el-form-item>
        <el-form-item label="数据分片" prop="maxDocsPerSegment">
          <el-input-number v-model="value.maxDocsPerSegment"/>
        </el-form-item>
        <el-form-item label="集合分片" prop="shardsNum">
          <el-input-number v-model="value.shardsNum"/>
        </el-form-item>
        <el-form-item label="样本字段" prop="sampleColumns">
          <data-column v-model="value.sampleColumns"/>
        </el-form-item>
        <el-form-item label="数据字段" prop="faceColumns">
          <data-column v-model="value.faceColumns"/>
        </el-form-item>
        <slot name="ext" :data="value"></slot>
      </el-form>
    </div>
  </el-card>
</template>

<script>
import DataColumn from "@/components/DataColumn";
export default {
  name: "CollectItem",
  components: { DataColumn },
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
    }
  }
}
</script>

<style scoped>

</style>
