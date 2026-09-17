<template>
  <div>
    <el-form label-width="100px" ref="form" :model="formData">
      <el-form-item label="命名空间" prop="namespace" required>
        <el-input v-model="formData.namespace"/>
      </el-form-item>
      <el-form-item label="集合名称" prop="collectionName" required>
        <el-input v-model="formData.collectionName"/>
      </el-form-item>
      <el-form-item label="样本编号" prop="sampleId" required>
        <el-input v-model="formData.sampleId"/>
      </el-form-item>
      <el-form-item>
        <el-button type="danger" @click="onSubmit">立即删除</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { remove } from "@/api/sample";

export default {
  name: "SampleRemove",
  data () {
    return {
      formData: {
        namespace: 'namespace_1',
        collectionName: 'collect_20211201_v05'
      }
    }
  },
  methods: {
    onSubmit () {
      this.$refs.form.validate(success => {
        if (success) {
          remove(this.formData).then(res => {
            console.log(res)
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
