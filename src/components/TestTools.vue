<script setup lang="ts">
import {onMounted, ref} from "vue"
import * as service from "../scripts/Service"
import {useRouter} from "vue-router";
import {eventbus} from "../scripts/Utils";
import {EventMessage} from "../scripts/EventMessages";

const router = useRouter()
const object_names = ref<Array<string>>([])

function picturesChangeDisplayMode(displayMode: string): void {
  eventbus.emit("Pictures:changeDisplayMode", {data: displayMode})
}

onMounted(async () => {
  object_names.value = await service.objectNames()
})
</script>

<template>
  <div>
    <div>切换图像/视频/混合</div>
    <div v-if="router.currentRoute.value.name === 'Pictures'" style="margin-top: 10px;">
      <a-button @click="picturesChangeDisplayMode('image')">image</a-button>
      <a-button @click="picturesChangeDisplayMode('video')">video</a-button>
      <a-button @click="picturesChangeDisplayMode('mixed')">mixed</a-button>
    </div>
    <div style="margin-top: 10px;">切换object</div>
    <ul style="list-style-type: circle; margin-top: 10px;">
      <li v-for="object_name in object_names">
        <a id="{{object_name}}"
           href="javascript:void(0);"
           @click="service.updateDisplay(object_name)">
          {{ object_name }}
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="less">

</style>
