<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from "vue"
import * as service from "../scripts/Service"
import {useRouter} from "vue-router";
import {delay, Segment, clamp} from "../scripts/Utils"
import Video from "./Video.vue"
import {Modal} from 'ant-design-vue'
import Mask from "../components/Mask.vue"

const router = useRouter()
const container = ref<HTMLDivElement | null>(null)
const interactionGot = ref<boolean>(false)
const picture = ref<any>(null)

let ws: WebSocket | null = null
let currentObjectName: string = ""
let animationLoop: AnimationLoop | null = null
let mask: HTMLElement | null = null

class AnimationLoop {
  running: boolean
  segments: Array<Segment>
  cursor: number

  constructor(segments: Array<Segment>) {
    this.segments = segments
    this.running = true
    this.cursor = 0
  }

  public async start() {
    while (this.running) {
      if (!this.segments.length || this.segments.length <= this.cursor) {
        return
      }

      const seg = this.segments[this.cursor]
      const preloadSeg = this.segments[(this.cursor + 1) % this.segments.length]

      if (this.running) {
        picture.value.update(seg)
        setTimeout(() => {
          picture.value.setPreloadVideo(preloadSeg)
        }, 1000)
      }
      this.cursor = (this.cursor + 2) % this.segments.length

      await delay(seg.aliveDuration)
    }
  }

  public stop() {
    picture.value.stop()
    this.running = false
  }
}

function setSegments(array: Array<Segment>) {
  if (animationLoop) {
    animationLoop.stop()
  }

  const filteredArray = new Array<Segment>()

  // 根据每个segment的字数，计算 aliveDuration 和 animInterval
  for (const seg of array) {
    if (!seg.video) continue

    const subtitle = seg.subtitle
    let stayTime = 0

    const lineCount = Math.floor(subtitle.length / 27)
    switch (lineCount) {
      case 0:
        stayTime = 5
        break
      case 1:
        stayTime = 6
        break
      case 2:
        stayTime = 7
        break
      case 3:
        stayTime = 7
        break
      default:
        stayTime = 7
        break
    }
    const interval = clamp(4 / subtitle.length, 0.2, 0.25)
    seg.aliveDuration = interval * subtitle.length + stayTime
    seg.animInterval = interval

    filteredArray.push(seg)
  }

  animationLoop = new AnimationLoop(array)
  animationLoop.start()
}

const onMessage = async (e: MessageEvent) => {
  if (router.currentRoute.value.name !== "Pictures") {
    return
  }

  const data = e.data
  console.log(data)
  if (data === currentObjectName) {
    ws.send("1")
    return
  } else {
    if (data && currentObjectName !== data) {
      mask.style.display = "none"

      currentObjectName = data
      const res = await service.pictures(currentObjectName)
      setSegments(res.content)
    }
    if (!data) {
      currentObjectName = ""
      mask.style.display = "block"
      animationLoop?.stop()
    }
  }
}

function waitForUserInteraction() {
  Modal.info({
    title: 'interaction',
    content: "auto play sounds, need user's interaction ...",
    okText: 'OK',
    onOk: () => {
      return new Promise(resolve => {
        interactionGot.value = true
        resolve(true)
      })
    }
  });

  return new Promise(resolve => {
    let timerId = setInterval(() => {
      if (interactionGot.value) {
        clearInterval(timerId)
        resolve(null)
      }
    }, 0.02)
  })
}

onMounted(async () => {
  await waitForUserInteraction()

  mask = document.getElementById("picturesMask")

  service.ws_connect().then((res) => {
    ws = res
    if (ws) {
      ws.onopen = async () => {
        console.log("ws connected.")
      }
      ws.onmessage = onMessage
    }
  })
  const res1 = await service.currentObjectName()
  currentObjectName = res1.content
  if (!currentObjectName) {
    mask.style.display = "block"
    animationLoop?.stop()
    return
  }

  mask.style.display = "none"
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
    <Mask id="picturesMask"></Mask>
    <Video ref="picture"></Video>
  </div>
</template>

<style scoped lang="less">
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

  .container {
    position: absolute;

    .mask {
      position: absolute;
    }
  }
}
</style>
