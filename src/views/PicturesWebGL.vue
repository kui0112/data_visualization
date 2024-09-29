<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from "vue";
import * as service from "../scripts/Service"
import {useRouter} from "vue-router";
import {PlainFadeAnimation, PixelFadeAnimation, NoAnimation, Animation} from "../scripts/WebGLCanvas";

interface Segment {
  id: string
  image: string
  subtitle: string
}

const router = useRouter()
const canvas = ref<HTMLCanvasElement | null>(null)
const subtitle = ref<HTMLDivElement | null>(null)
const animations: Array<Animation> = []

let ws: WebSocket | null = null
let currentObjectName: string = ""
let segments: Array<Segment> = []
let cursor: number = 0
let timer: NodeJS.Timeout | null = null
let timerInterval: number = 5 * 1000
let context: WebGLRenderingContext | null = null
let cursorAnim: number = 0


const updateImageDisplay = () => {
  if (canvas.value && segments && segments.length > cursor) {
    const seg = segments[cursor]

    const image = new Image()
    image.onload = () => {
      const imageWidth = image.width;
      const imageHeight = image.height;
      const imageAspect = imageWidth / imageHeight;

      const clientWidth = canvas.value.parentElement.clientWidth
      const clientHeight = canvas.value.parentElement.clientHeight
      const clientAspect = clientWidth / clientHeight

      // 宽度填满，按高度居中
      if (imageAspect >= clientAspect) {
        canvas.value.width = clientWidth
        canvas.value.height = clientWidth / imageAspect
      } else {
        // 高度填满canvas，按宽度居中
        canvas.value.width = imageAspect * clientHeight
        canvas.value.height = clientHeight
      }
      if (animations.length > 0) {
        const animation = animations[cursorAnim]
        animation.initialize(context)
        animation.render(image)
        console.log("draw finish.")

        cursorAnim = (cursorAnim + 1) % animations.length
      }

      let subtitleText = seg.subtitle
      let maxWidth = canvas.value.width
      subtitle.value.style.maxWidth = `${maxWidth - 20}px`
      subtitle.value.textContent = subtitleText

      cursor = (cursor + 1) % segments.length
    }
    image.onerror = () => {
      console.log("image load error.")
    }
    image.crossOrigin = 'anonymous'
    image.src = service.apiAddress(seg.image)
  }
}

function setSegments(array: Array<Segment>) {
  segments = array
  cursor = 0
  if (timer) {
    clearInterval(timer)
  }
  timer = setInterval(updateImageDisplay, timerInterval)
  updateImageDisplay()
}

const onMessage = async (e: MessageEvent) => {
  if (router.currentRoute.value.name !== "Pictures") {
    return
  }

  const data = JSON.parse(e.data)
  if (data.type === "heartbeat") {
    ws.send("1")
    return
  }

  if (data.type === "command" && data.operation === "update") {
    console.log("update command received.")
    if (currentObjectName !== data.name && data.name) {
      currentObjectName = data.name
      const res = await service.pictures(currentObjectName)
      if (res.content) {
        setSegments(res.content)
        updateImageDisplay()
      }
    }
  }
}

onMounted(async () => {
  context = canvas.value.getContext("webgl")
  animations.push(new NoAnimation())
  animations.push(new PixelFadeAnimation())
  animations.push(new PlainFadeAnimation())

  ws = await service.ws_connect()
  if (ws) {
    ws.onopen = async () => {
      console.log("ws connected.")
    }
    ws.onmessage = onMessage
  }
  const res1 = await service.currentObjectName()
  currentObjectName = res1.content
  if (!currentObjectName) {
    return
  }

  const res = await service.pictures(currentObjectName)
  if (res.content) {
    setSegments(res.content)
  }
})

onBeforeUnmount(async () => {
  if (timer) {
    clearInterval(timer)
  }
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close()
  }
})

</script>

<template>
  <div class="pictures">
    <canvas ref="canvas"></canvas>
    <div ref="subtitle" class="subtitle"></div>
  </div>
</template>

<style scoped lang="less">
.pictures {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  background-color: rgba(0, 0, 0, 1);

  .subtitle {
    display: block;
    position: absolute;
    bottom: 15%;
    color: yellow;
    //color: white;
    //background-color: rgba(0, 0, 0, 0.5);
    padding: 10px;
    border-radius: 5px;
    font-size: 24px;
    font-family: sans-serif;
    font-weight: lighter;
    text-align: center;
    overflow-wrap: break-word;
  }
}

.pictures {
  position: relative;
}
</style>
