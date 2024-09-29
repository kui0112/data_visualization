<script lang="ts" setup>

import {onMounted, onBeforeUnmount, ref, toRefs} from "vue"
import flv from "flv.js"

const props = defineProps({
  src: String,
})
const {src} = toRefs(props)
const mountNode = ref<HTMLVideoElement | null>(null)
const player = ref<flv.Player | null>(null)

onMounted(() => {
  if (flv.isSupported() && mountNode.value) {
    player.value = flv.createPlayer({
      type: 'mp4',
      url: src.value,
    })
    player.value.attachMediaElement(mountNode.value)
    player.value.load()
    setTimeout(() => {
      player.value.play()
    }, 3 * 1000)
  }
})

onBeforeUnmount(() => {
  player.value.destroy()
})

</script>

<template>
  <div class="video-wrapper">
    <video ref="mountNode" class="video"></video>
  </div>
</template>

<style scoped lang="less">
.video-wrapper {
  width: 100%;
  height: 100%;
}

.video {
  width: 100%;
  height: 100%;
}
</style>
