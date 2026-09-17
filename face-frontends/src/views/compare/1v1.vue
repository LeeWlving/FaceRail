<template>
  <el-card>
    <div slot="header" class="clearfix">
      <el-form label-width="100px" ref="form" :model="formData">
        <el-form-item label="图像A" prop="imageBase64A" required>
          <el-upload
              class="avatar-uploader" action=""
              :show-file-list="false"
              :before-upload="handleUpload"
          >
            <el-image
                v-if="formData.imageBase64A"
                style="width: 100px; height: 100px"
                :src="imageTypeA + formData.imageBase64A">
            </el-image>
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="图像B" prop="imageBase64B" required>
          <el-upload
              class="avatar-uploader" action=""
              :show-file-list="false"
              :before-upload="handleUploadB"
          >
            <el-image
                v-if="formData.imageBase64B"
                style="width: 100px; height: 100px"
                :src="imageTypeB + formData.imageBase64B">
            </el-image>
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="质量阈值" prop="faceScoreThreshold">
          <el-slider
              v-model="formData.faceScoreThreshold"
              show-stops
              :min="0"
              :max="100">
          </el-slider>
        </el-form-item>
        <el-form-item label="返回信息" prop="needFaceInfo">
          <el-checkbox v-model="formData.needFaceInfo"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">立即比对</el-button>
        </el-form-item>
      </el-form>
      <el-row v-if="result">
        <el-col :span="12">
          <draw-rect-image :face-image="imageTypeA + formData.imageBase64A" v-bind="result.faceInfo.locationA" :text="result.confidence + '%'"/>
        </el-col>
        <el-col :span="12">
          <draw-rect-image :face-image="imageTypeB + formData.imageBase64B" v-bind="result.faceInfo.locationB" :text="result.confidence + '%'"/>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script>
import {BlobToDataURL} from "@/utils/FileUtil";
import {search} from "@/api/compare";
import DrawRectImage from "@/components/DrawRectImage";

export default {
  name: "Compare1v1",
  components: {DrawRectImage},
  data () {
    return {
      formData: {
      },
      imageTypeA: null,
      imageTypeB: null,
      result: null
    }
  },
  methods: {
    handleUpload (file, isA = true) {
      BlobToDataURL(file, base64Url => {
        let b64split = base64Url.split(',')
        base64Url = b64split[1]
        this['imageType' + (isA ? 'A' : 'B')] = b64split[0] + ','
        this.$set(this.formData, 'imageBase64' + (isA ? 'A' : 'B'), base64Url)
      });
      return false
    },
    handleUploadB (file) {
      return this.handleUpload(file, false)
    },
    onSubmit () {
      this.faces = null
      this.$refs.form.validate(success => {
        if (success) {
          search(this.formData).then(res => {
            this.result = res.data.data
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
