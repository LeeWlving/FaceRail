<template>
  <div>
    <draw-rect-image :face-image="faceImage" v-bind="rect" v-for="(rect, index) in rects" :key="index"/>
  </div>
</template>

<script>
import DrawRectImage from "@/components/DrawRectImage";
export default {
  name: "FaceResult",
  components: {DrawRectImage},
  props: {
    faceImage: {
      type: String,
      default: null
    },
    result: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      rects: []
    }
  },
  mounted () {
    let text = []
    for (let index in this.result.match) {
      let match = this.result.match[index]
      text.push(match.sampleData[0].value + ' ' + match.confidence + '%')
    }
    let rect = {
      x: this.result.location.x,
      y: this.result.location.y,
      w: this.result.location.w,
      h: this.result.location.h,
      text: text
    }
    this.rects.push(rect)
    // let canvas = document.getElementById('canvas')
    // let ctx = canvas.getContext('2d')
    // let image = new Image()
    // let fontSize = 16
    // image.onload = () => {
    //   this.image = image
    //   canvas.height = image.height
    //   canvas.width = image.width
    //   this.style = {width: image.width + 'px', height: image.height + 'px'}
    //   ctx.drawImage(image, 0, 0, image.width, image.height)
    //   ctx.beginPath()
    //   ctx.lineWidth="2"
    //   ctx.strokeStyle="red"
    //   ctx.font = 'bold ' + fontSize + 'px Arial';
    //   ctx.fillStyle = "red"
    //   ctx.rect(this.result.location.x, this.result.location.y, this.result.location.w, this.result.location.h)
    //   let startX = this.result.location.x
    //   let startY = this.result.location.y + fontSize
    //   for (let index in this.result.match) {
    //     let match = this.result.match[index]
    //     let text = match.sampleData[0].value + ' ' + match.confidence + '%'
    //     let rect = ctx.measureText(text)
    //     if (startX + rect.width >= this.result.location.x + this.result.location.w) {
    //       startX = this.result.location.x
    //       startY += fontSize
    //     }
    //     ctx.fillText(text, startX, startY)
    //     startX +=  rect.width + 5
    //   }
    //   ctx.stroke()
    // }
    // image.src = this.faceImage
  }
}
</script>

<style scoped>

</style>
