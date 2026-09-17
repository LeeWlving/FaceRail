<template>
  <div>
    <collect-item ref="form" v-model="formData">
      <template slot="ext">
        <el-form-item>
          <el-button type="primary" @click="onSubmit">立即创建</el-button>
          <el-button>取消</el-button>
        </el-form-item>
      </template>
    </collect-item>
  </div>
</template>

<script>
import CollectItem from "@/components/CollectItem";
import { create } from "@/api/collect";

export default {
  name: "CollectCreate",
  components: { CollectItem },
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
          create(this.formData).then(res => {
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
