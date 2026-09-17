<template>
  <el-card>
    <div slot="header" class="clearfix">
      <el-form label-width="100px" ref="form" :model="formData">
        <el-form-item label="命名空间" prop="namespace" required>
          <el-input v-model="formData.namespace"/>
        </el-form-item>
        <el-form-item label="集合名称" prop="collectionName" required>
          <el-input v-model="formData.collectionName"/>
        </el-form-item>
        <el-form-item label="图片预览" prop="imageBase64" required>
          <el-upload
              class="avatar-uploader" action=""
              :show-file-list="false"
              :before-upload="handleUpload"
          >
            <el-image
                v-if="formData.imageBase64"
                style="width: 100px; height: 100px"
                :src="imageType + formData.imageBase64">
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
        <el-form-item label="分数阈值" prop="confidenceThreshold">
          <el-slider
              v-model="formData.confidenceThreshold"
              show-stops
              :min="0"
              :max="100">
          </el-slider>
        </el-form-item>
        <el-form-item label="最大条数" prop="limit">
          <el-slider
              v-model="formData.limit"
              show-stops
              :min="1"
              :max="100">
          </el-slider>
        </el-form-item>
        <el-form-item label="图片脸数" prop="maxFaceNum">
          <el-slider
              v-model="formData.maxFaceNum"
              show-stops
              :min="1"
              :max="100">
          </el-slider>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">立即查询</el-button>
        </el-form-item>
      </el-form>
      <face-result v-for="(face, index) in faces" :key="index" :result="face" :face-image="imageType + formData.imageBase64"/>
    </div>
  </el-card>
</template>

<script>
import {search} from "@/api/search";
import {BlobToDataURL} from "@/utils/FileUtil";
import FaceResult from "@/components/FaceResult";

export default {
  name: "SearchMvN",
  components: {FaceResult},
  data () {
    return {
      faces: null,
      formData: {
        limit: 5,
        maxFaceNum: 5,
        namespace: 'namespace_1',
        collectionName: 'collect_20211201_v05'
      },
      imageType: null
    }
  },
  methods: {
    handleUpload (file) {
      BlobToDataURL(file, base64Url => {
        let b64split = base64Url.split(',')
        base64Url = b64split[1]
        this.imageType = b64split[0] + ','
        this.$set(this.formData, 'imageBase64', base64Url)
      });
      return false
    },
    onSubmit () {
      this.faces = null
      this.$refs.form.validate(success => {
        if (success) {
          search(this.formData).then(res => {
            this.faces = res.data.data
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
</style>
