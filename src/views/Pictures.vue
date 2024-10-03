<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from "vue";
import * as service from "../scripts/Service"
import {useRouter} from "vue-router";
import {eventbus} from "../scripts/Utils";
import {EventMessage} from "../scripts/EventMessages";

interface Segment {
  id: string
  image: string
  video: string
  subtitle: string
}

const router = useRouter()
const img = ref<HTMLImageElement | null>(null)
const video = ref<HTMLVideoElement | null>(null)
const subtitleDiv = ref<HTMLDivElement | null>(null)
const spinningDiv = ref<HTMLDivElement | null>(null)

let ws: WebSocket | null = null
let currentObjectName: string = ""
let segments: Array<Segment> = []
let cursor: number = 0
let timer: NodeJS.Timeout | null = null
let timerInterval: number = 6 * 1000
let displayMode = "image"

function showImage(seg: Segment) {
  video.value.style.display = "none"
  img.value.style.display = "block"
  img.value.src = service.apiAddress(seg.image)
  img.value.onload = () => {
    let subtitle = seg.subtitle
    let maxWidth = img.value.width
    subtitleDiv.value.style.maxWidth = `${maxWidth - 20}px`
    subtitleDiv.value.textContent = subtitle
    cursor = (cursor + 1) % segments.length
  }
}

function showVideo(seg: Segment) {
  img.value.style.display = "none"
  video.value.style.display = "block"
  video.value.src = service.apiAddress(seg.video)
  video.value.controls = false
  video.value.addEventListener("loadedmetadata", () => {
    let subtitle = seg.subtitle
    let maxWidth = video.value.clientWidth
    subtitleDiv.value.style.maxWidth = `${maxWidth - 20}px`
    subtitleDiv.value.textContent = subtitle
    cursor = (cursor + 1) % segments.length
  }, {once: true});
  video.value.load()
}

function updateImageDisplay() {
  if (!img.value || !segments || segments.length <= cursor) return

  spinningDiv.value.style.visibility = "hidden"
  subtitleDiv.value.style.visibility = "visible"

  const seg = segments[cursor]
  if (displayMode === "image") {
    showImage(seg)
  } else if (displayMode === "video") {
    showVideo(seg)
  } else {
    if (Math.random() > 0.5) {
      showImage(seg)
    } else {
      showVideo(seg)
    }
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
    if (data.name && currentObjectName !== data.name) {
      currentObjectName = data.name
      const res = await service.pictures(currentObjectName)
      if (res.content) {
        setSegments(res.content)
        updateImageDisplay()
      }
    }
  }
}

function showSpinning() {
  spinningDiv.value.style.visibility = "visible"
  subtitleDiv.value.style.visibility = "hidden"
  img.value.style.display = "none"
  video.value.style.display = "none"
}

onMounted(async () => {
  eventbus.on("Pictures:changeDisplayMode", async (e: EventMessage) => {
    console.log(e)
    displayMode = e.data
  })

  showSpinning()
  img.value.onerror = showSpinning
  video.value.onerror = showSpinning

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
    <div ref="spinningDiv" class="spinning">
      <a-spin tip="Loading..." :spinning="true" size="large"></a-spin>
    </div>
    <img ref="img" alt="image" class="image" src=""/>
    <video ref="video" class="video" autoplay loop muted playsinline></video>
    <div ref="subtitleDiv" class="subtitle"></div>
  </div>
</template>

<style scoped lang="less">

@font-face {
  font-family: 'Alibaba-Regular';
  src: url('../assets/fonts/Alibaba_PuHuiTi_2.0_55_Regular_55_Regular.ttf');
}

@font-face {
  font-family: 'Alibaba-Thin';
  src: url('../assets/fonts/Alibaba_PuHuiTi_2.0_35_Thin_35_Thin.ttf');
}

@font-face {
  font-family: 'Alibaba-Light';
  src: url('../assets/fonts/Alibaba_PuHuiTi_2.0_45_Light_45_Light.ttf');
}

@font-face {
  font-family: 'Alibaba-Bold';
  src: url('../assets/fonts/Alibaba_PuHuiTi_2.0_55_Regular_85_Bold.ttf');
}

@font-face {
  font-family: 'Alibaba-Medium';
  src: url('../assets/fonts/Alibaba_PuHuiTi_2.0_65_Medium_65_Medium.ttf');
}

.pictures {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  position: relative;
  background-color: rgba(0, 0, 0, 1);

  .image {
    display: none;
    width: auto;
    height: 100%;
  }

  .video {
    display: none;
    width: auto;
    height: 100%;
  }

  .subtitle {
    display: block;
    position: absolute;
    bottom: 3%;
    //bottom: 0;
    //color: white;
    //background-color: rgba(0, 0, 0, 0.5);

    font-size: 32px;
    //fonts-size: 24px;
    color: white;
    //fill: white;
    -webkit-text-stroke: 1px black;
    font-weight: normal;
    font-family: Alibaba-Bold, sans-serif;

    text-align: center;
    padding: 10px;
    border-radius: 5px;
    overflow-wrap: break-word;
  }

  .spinning {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
