<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from "vue";

const videoNone = ref<HTMLVideoElement | null>(null);

onMounted(async () => {
  try {
    await navigator.mediaDevices.getUserMedia({video: true, audio: true})
  } catch (e) {
  }

  const devices = await navigator.mediaDevices.enumerateDevices()
  let virtualCameraDevice: MediaDeviceInfo | null = null

  for (const device of devices) {
    console.log(device.label)
    if (device.label.trim() == "OBS Virtual Camera") {
      virtualCameraDevice = device
    }
  }
  navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: {exact: virtualCameraDevice.deviceId}
    },
    audio: false,
  }).then((stream) => {
    videoNone.value.srcObject = stream
    videoNone.value.onloadedmetadata = () => {
      videoNone.value.play()
    }
  }).catch((err) => {
    console.log("can not visit camera.")
  })

  if (!virtualCameraDevice) {
    console.log("can not find OBS Virtual Camera")
    return
  }
})

</script>

<template>
  <div class="container">
    <video class="videoNone" ref="videoNone"></video>
  </div>
</template>

<style scoped lang="less">

.container {
  width: 100%;
  height: 100%;

  .videoNone {
    width: 100%;
    height: 100%;
  }
}

</style>
