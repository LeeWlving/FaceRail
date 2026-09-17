<template>
  <div>
    <el-form label-width="100px" ref="form" :model="formData">
      <el-form-item label="命名空间" prop="namespace" required>
        <el-input v-model="formData.namespace"/>
      </el-form-item>
      <el-form-item label="集合名称" prop="collectionName" required>
        <el-input v-model="formData.collectionName"/>
      </el-form-item>
      <el-form-item label="查询数量" prop="limit" required>
        <el-input v-model="formData.limit"/>
      </el-form-item>
      <el-form-item label="起始记录" prop="offset" required>
        <el-input v-model="formData.offset"/>
      </el-form-item>
      <el-form-item label="排序方式" prop="order" required>
        <el-input v-model="formData.order"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">立即查看</el-button>
        <el-button>取消</el-button>
      </el-form-item>

      <sample-item v-model="samples[index]" v-for="(_, index) in samples" :key="index"/>
    </el-form>
  </div>
</template>

<script>
import { list } from "@/api/sample";
import SampleItem from "@/components/SampleItem";

export default {
  name: "SampleList",
  components: {SampleItem},
  data () {
    return {
      formData: {
        offset: 0,
        order: 'asc',
        namespace: 'namespace_1',
        collectionName: 'collect_20211201_v05'
      },
      samples: []
    }
  },
  methods: {
    onSubmit () {
      this.$refs.form.validate(success => {
        if (success) {
          list(this.formData).then(res => {
            this.samples = res.data.data
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
