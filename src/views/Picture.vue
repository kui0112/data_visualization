<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from "vue";
import {delay, eventbus, Segment} from "../scripts/Utils";
import {apiAddress} from "../scripts/Service";

const props = defineProps(['alive_duration'])
const image = ref<HTMLImageElement | null>(null)
const subtitleDiv = ref<HTMLDivElement | null>(null)
const spinningDiv = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let context: CanvasRenderingContext2D | null = null
let aliveDuration: number | null = null
let animationId: number = Date.now()
let mode: string = "typewriter"

function measureText(font: string, text: string) {
  context.font = font
  return context.measureText(text).width
}

function subtitleNoAnimation(subtitle: string) {
  if (!subtitle || subtitle.length === 0) {
    return
  }
  const maxWidth = image.value.width - 20
  subtitleDiv.value.style.opacity = "100%"
  subtitleDiv.value.style.fontSize = "32px"
  subtitleDiv.value.style.maxWidth = `${maxWidth}px`
  subtitleDiv.value.textContent = subtitle
}

async function subtitleAnimation(subtitle: string) {
  const currentAnimationId = animationId
  if (!subtitle || subtitle.length === 0) {
    return
  }

  const maxWidth = image.value.width - 20
  subtitleDiv.value.style.maxWidth = `${maxWidth}px`
  subtitleDiv.value.style.opacity = "100%"
  let size = 32
  const padding = measureText(`${size}px Alibaba-Regular`, "中文")
  while (measureText(`${size}px Alibaba-Regular`, subtitle) + padding > maxWidth) {
    size--
  }
  subtitleDiv.value.style.fontSize = `${size}px`

  const interval = aliveDuration * 0.4 * (1.0 / subtitle.length)
  for (let i = 0; i < subtitle.length; i++) {
    if (currentAnimationId !== animationId) return

    if (subtitleDiv?.value) {
      subtitleDiv.value.textContent = subtitle.slice(0, i + 1)
    }
    await delay(interval)
  }
  // 逐渐消失
  // const disappearTotalTime = aliveDuration * 0.2
  // const disappearInterval = disappearTotalTime / 30
  // let opacity = 100
  // let opacityStep = opacity / 25
  // for (let i = 0; i < 26; i++) {
  //   opacity -= opacityStep
  //   if (opacity < 0) {
  //     opacity = 0
  //   }
  //   subtitleDiv.value.style.opacity = `${opacity.toFixed(0)}%`
  //   await delay(disappearInterval)
  // }
}

function showSpinning() {
  spinningDiv.value.style.visibility = "visible"

  subtitleDiv.value.style.visibility = "hidden"
  image.value.style.visibility = "hidden"
}

function showImage() {
  if (spinningDiv?.value?.style) {
    spinningDiv.value.style.visibility = "hidden"
  }
  if (subtitleDiv?.value?.style) {
    subtitleDiv.value.style.visibility = "visible"
  }
  if (image?.value?.style) {
    image.value.style.visibility = "visible"
  }
}

function setImage(e: HTMLImageElement, s: string) {
  return new Promise<void>((resolve, reject) => {
    if (e) {
      e.onload = () => resolve()
      e.onerror = (err) => reject(err)
      e.src = apiAddress(s)
    } else {
      reject("image element is null.")
    }
  })
}

async function animate(seg: Segment) {
  if (!image?.value) return
  await setImage(image.value, seg.image)
  showImage()

  animationId = Date.now()
  if (mode === "typewriter") {
    await subtitleAnimation(seg.subtitle)
  } else {
    subtitleNoAnimation(seg.subtitle)
  }
}

const modeHandler = (m: string) => mode = m

onMounted(async () => {
  if (!context) {
    context = canvas.value.getContext("2d")
  }
  aliveDuration = props.alive_duration
  showSpinning()
  eventbus.on("Pictures:update", animate)
  eventbus.on("Pictures:mode", modeHandler)
})
onBeforeUnmount(async () => {
  eventbus.off("Pictures:update", animate)
  eventbus.off("Pictures:mode", modeHandler)
})

</script>

<template>
  <div class="container">
    <div ref="spinningDiv" class="spinning">
      <a-spin tip="Loading..." :spinning="true" size="large"></a-spin>
    </div>
    <img ref="image" alt="image" class="image" src=""/>
    <div ref="subtitleDiv" class="subtitle"></div>
    <canvas ref="canvas" style="display: none"></canvas>
  </div>
</template>

<style scoped lang="less">

@font-face {
  font-family: 'Alibaba-Regular';
  src: url('../assets/fonts/Alibaba_PuHuiTi_2.0_55_Regular_55_Regular.ttf');
}

//@font-face {
//  font-family: 'Alibaba-Bold';
//  src: url('../assets/fonts/Alibaba_PuHuiTi_2.0_55_Regular_85_Bold.ttf');
//}

.container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  position: relative;
  background-color: rgba(0, 0, 0, 1);

  .image {
    display: block;
    width: auto;
    height: 100%;
  }

  .subtitle {
    display: block;
    position: absolute;
    bottom: 3%;
    //bottom: 0;
    color: white;
    background-color: rgba(0, 0, 0, 0.5);

    font-size: 32px;
    //fonts-size: 24px;
    //color: white;
    //fill: white;
    //-webkit-text-stroke: 1px black;
    font-weight: normal;
    font-family: Alibaba-Regular, sans-serif;
    //font-family: Alibaba-Bold, sans-serif;

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
