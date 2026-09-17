<template>
  <canvas :id="canvasId" :style="style"></canvas>
</template>

<script>
export default {
  name: "DrawRectImage",
  props: {
    faceImage: {
      type: String,
      default: null
    },
    x: {
      type: Number,
      default: null
    },
    y: {
      type: Number,
      default: null
    },
    w: {
      type: Number,
      default: null
    },
    h: {
      type: Number,
      default: null
    },
    fontSize: {
      type: Number,
      default: 16
    },
    text: {
      type: [Array, String],
      default: null
    }
  },
  data () {
    return {
      canvasId: 'canvas_' + Math.floor(Math.random()*1000000),
      style: null
    }
  },
  mounted () {
    if (!this.text) return
    let canvas = document.getElementById(this.canvasId)
    let ctx = canvas.getContext('2d')
    let image = new Image()
    image.onload = () => {
      canvas.height = image.height
      canvas.width = image.width
      this.style = {width: image.width + 'px', height: image.height + 'px'}
      ctx.drawImage(image, 0, 0, image.width, image.height)
      ctx.beginPath()
      ctx.lineWidth="2"
      ctx.strokeStyle="red"
      ctx.font = 'bold ' + this.fontSize + 'px Arial';
      ctx.fillStyle = "red"
      ctx.rect(this.x, this.y, this.w, this.h)
      let startX = this.x
      let startY = this.y + this.fontSize
      if (typeof(this.text) === 'string') {
        ctx.fillText(this.text, startX, startY)
      } else {
        for (let text of this.text) {
          let rect = ctx.measureText(text)
          if (startX + rect.width >= this.x + this.w) {
            startX = this.x
            startY += this.fontSize
          }
          ctx.fillText(text, startX, startY)
          startX +=  rect.width + 5
        }
      }
      ctx.stroke()
    }
    image.src = this.faceImage
  }
}
</script>

<style scoped>

</style>
