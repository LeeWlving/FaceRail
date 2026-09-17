<template>
  <div>
    <el-form label-width="100px" ref="form" :model="formData">
      <el-form-item label="命名空间" prop="namespace" required>
        <el-input v-model="formData.namespace"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">立即查询</el-button>
      </el-form-item>
    </el-form>

    <collect-item v-model="collects[index]" v-for="(_, index) in collects" :key="index" />
  </div>
</template>

<script>
import { list } from "@/api/collect";
import CollectItem from "@/components/CollectItem";

export default {
  name: "CollectList",
  components: {CollectItem},
  data () {
    return {
      formData: {
        namespace: 'namespace_1'
      },
      collects: []
    }
  },
  methods: {
    onSubmit () {
      this.$refs.form.validate(success => {
        if (success) {
          list(this.formData).then(res => {
            this.collects = res.data.data
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
