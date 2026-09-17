<template>
  <face-item v-model="formData">
    <template slot="ext">
      <el-form-item>
        <el-button type="primary" @click="onSubmit">立即创建</el-button>
      </el-form-item>
    </template>
  </face-item>
</template>

<script>
import FaceItem from "@/components/FaceItem";
import {create} from "@/api/face";
export default {
  name: "FaceCreate",
  components: {FaceItem},
  data () {
    return {
      formData: {}
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
