<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from "vue";
import * as service from "../scripts/Service"
import {useRouter} from "vue-router";
import {delay, eventbus, Segment} from "../scripts/Utils";
import Picture from "./Picture.vue"

const router = useRouter()
const container = ref<HTMLDivElement | null>(null)

let ws: WebSocket | null = null
let currentObjectName: string = ""
let changeInterval: number = 6
let animationLoop: AnimationLoop | null = null

class AnimationLoop {
  running: boolean
  interval: number
  segments: Array<Segment>
  cursor: number

  constructor(interval: number, segments: Array<Segment>) {
    this.interval = interval
    this.segments = segments
    this.running = true
    this.cursor = 0
  }

  public async update() {
    if (this.segments && this.segments.length > this.cursor) {
      const seg = this.segments[this.cursor]
      if (this.running) {
        eventbus.emit("Pictures:update", seg)
      }
      this.cursor = (this.cursor + 1) % this.segments.length
    }
  }

  public async start() {
    while (this.running) {
      await this.update()
      await delay(this.interval)
    }
  }

  public stop() {
    this.running = false
  }
}

function setSegments(array: Array<Segment>) {
  if (animationLoop) {
    animationLoop.stop()
  }
  animationLoop = new AnimationLoop(changeInterval, array)
  animationLoop.start()
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
    if (data.name && currentObjectName !== data.name) {
      currentObjectName = data.name
      const res = await service.pictures(currentObjectName)
      if (res.content) {
        setSegments(res.content)
      }
    }
  }
}

onMounted(async () => {
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
  if (animationLoop) {
    animationLoop.stop()
  }
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close()
  }
})

</script>

<template>
  <div class="pictures" ref="container">
    <Picture :alive_duration="changeInterval"></Picture>
  </div>
</template>

<style scoped lang="less">

//@font-face {
//  font-family: 'Alibaba-Regular';
//  src: url('../assets/fonts/Alibaba_PuHuiTi_2.0_55_Regular_55_Regular.ttf');
//}

@font-face {
  font-family: 'Alibaba-Bold';
  src: url('../assets/fonts/Alibaba_PuHuiTi_2.0_55_Regular_85_Bold.ttf');
}

.pictures {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  position: relative;
  background-color: rgba(0, 0, 0, 1);
}
</style>
