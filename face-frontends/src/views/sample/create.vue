<template>
  <sample-item ref="form" v-model="formData">
    <template slot="ext">
      <el-form-item>
        <el-button type="primary" @click="onSubmit">立即创建</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </template>
  </sample-item>
</template>

<script>
import SampleItem from "@/components/SampleItem";
import {create} from "@/api/collect";
export default {
  name: "SimpleCreate",
  components: {SampleItem},
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
