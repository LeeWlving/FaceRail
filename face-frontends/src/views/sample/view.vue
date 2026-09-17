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
        <el-button type="primary" @click="onSubmit">立即查看</el-button>
        <el-button>取消</el-button>
      </el-form-item>

      <sample-item v-model="sample" v-if="sample"/>
    </el-form>
  </div>
</template>

<script>
import { view } from "@/api/sample";
import SampleItem from "@/components/SampleItem";

export default {
  name: "SampleView",
  components: {SampleItem},
  data () {
    return {
      formData: {
        namespace: 'namespace_1',
        collectionName: 'collect_20211201_v05'
      },
      sample: null
    }
  },
  methods: {
    onSubmit () {
      this.$refs.form.validate(success => {
        if (success) {
          view(this.formData).then(res => {
            this.sample = res.data.data
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
