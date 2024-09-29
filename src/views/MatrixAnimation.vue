<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount} from "vue"
import {updateVectors, MatrixAnimation} from "../scripts/MatrixAnimation"
import * as service from "../scripts/Service"
import {useRouter} from "vue-router"

const router = useRouter()
const canvas = ref<HTMLCanvasElement | null>(null)
const animation = new MatrixAnimation()

let ws: WebSocket | null = null
let currentObjectName: string = ""

const onMessage = async (e: MessageEvent) => {
  if (router.currentRoute.value.name !== "VectorAnimation") {
    return
  }

  const data = JSON.parse(e.data)
  if (data.type === "heartbeat") {
    ws.send("1")
    return
  }

  if (data.type === "command" && data.operation === "update") {
    console.log("update command received.")
    if (data.name && currentObjectName !== data.name) {
      currentObjectName = data.name
      const res = await service.vectors(currentObjectName)
      // console.log(res)
      updateVectors(res.content)
      animation.reset()
      animation.render()
    }
  }
}

onMounted(async () => {
  ws = await service.ws_connect()
  if (ws) {
    ws.onopen = async (e: MessageEvent) => {
      console.log("ws connected.")
    }
    ws.onmessage = onMessage
  }

  const res1 = await service.currentObjectName()
  currentObjectName = res1.content
  if (currentObjectName) {
    const res2 = await service.vectors(currentObjectName)
    updateVectors(res2.content)
  }

  animation.initialize(canvas.value)
  animation.render()
})

onBeforeUnmount(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close()
  }
})

</script>

<template>
  <div class="canvasParent">
    <canvas class="canvas" ref="canvas"></canvas>
  </div>
</template>

<style scoped lang="less">
.canvasParent {
  width: 100%;
  height: 100%;
  padding: 0;
}

.canvas {
  width: 100%;
  height: 100%;
  display: block;
  margin: 0;
}
</style>
