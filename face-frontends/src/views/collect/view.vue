<template>
  <div>
    <el-form label-width="100px" ref="form" :model="formData">
      <el-form-item label="命名空间" prop="namespace" required>
        <el-input v-model="formData.namespace"/>
      </el-form-item>
      <el-form-item label="集合名称" prop="collectionName" required>
        <el-input v-model="formData.collectionName"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">立即查看</el-button>
      </el-form-item>
    </el-form>

    <collect-item v-if="collect" v-model="collect"/>
  </div>
</template>

<script>
import { view } from "@/api/collect";
import CollectItem from "@/components/CollectItem";

export default {
  name: "CollectView",
  components: {CollectItem},
  data () {
    return {
      formData: {
        namespace: 'namespace_1',
        collectionName: 'collect_20211201_v05'
      },
      collect: null
    }
  },
  methods: {
    onSubmit () {
      this.$refs.form.validate(success => {
        if (success) {
          view(this.formData).then(res => {
            this.collect = res.data.data
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
