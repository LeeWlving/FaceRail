<template>
  <el-card>
    <div slot="header" class="clearfix">
      <el-form label-width="100px" ref="form" :model="value">
        <el-form-item label="命名空间" prop="namespace" required>
          <el-input v-model="value.namespace"/>
        </el-form-item>
        <el-form-item label="集合名称" prop="collectionName" required>
          <el-input v-model="value.collectionName"/>
        </el-form-item>
        <el-form-item label="样本编号" prop="sampleId" required>
          <el-input v-model="value.sampleId"/>
        </el-form-item>
        <el-form-item label="图片预览" prop="imageBase64" required>
          <el-upload
              action=""
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="handleUpload"
          >
            <el-image
                v-if="value.imageBase64"
                action=""
                style="width: 100px; height: 100px"
                :src="imageType + value.imageBase64">
            </el-image>
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="分数阈值" prop="faceScoreThreshold">
          <el-slider
              v-model="value.faceScoreThreshold"
              show-stops
              :min="0"
              :max="100">
          </el-slider>
        </el-form-item>
        <el-form-item label="最小阈值" prop="minConfidenceThresholdWithThisSample">
          <el-slider
              v-model="value.minConfidenceThresholdWithThisSample"
              show-stops
              :min="0"
              :max="100">
          </el-slider>
        </el-form-item>
        <el-form-item label="最大阈值" prop="maxConfidenceThresholdWithOtherSample">
          <el-slider
              v-model="value.maxConfidenceThresholdWithOtherSample"
              show-stops
              :min="0"
              :max="100">
          </el-slider>
        </el-form-item>
        <el-form-item label="脸部数据" prop="faceData">
          <key-value-field v-model="value.faceData"/>
        </el-form-item>
        <slot name="ext" :data="value">
          <el-form-item>
            <el-button type="danger" @click="onDelete">删除样本</el-button>
          </el-form-item>
        </slot>
      </el-form>
    </div>
  </el-card>
</template>

<script>
import {BlobToDataURL} from "@/utils/FileUtil";
import {remove} from "@/api/face";
import KeyValueField from "@/components/KeyValueField";
export default {
  name: "FaceItem",
  components: {KeyValueField},
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      imageType: null
    }
  },
  methods: {
    validate (callback) {
      this.$refs.form.validate(callback)
    },
    onDelete () {
      remove(this.value).then(res => {
        this.$emit('on-delete', res)
      })
    },
    handleUpload (file) {
      BlobToDataURL(file, (base64Url) => {
        let b64split = base64Url.split(',')
        base64Url = b64split[1]
        this.imageType = b64split[0] + ','
        this.$set(this.value, 'imageBase64', base64Url)
      });
      return false
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
