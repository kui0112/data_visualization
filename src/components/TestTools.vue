<script setup lang="ts">
import {onMounted, ref} from "vue"
import * as service from "../scripts/Service"
import {useRouter} from "vue-router";

const router = useRouter()
const object_names = ref<Array<string>>([])

function picturesSwitchDisplayMode(mode: string): void {

}

onMounted(async () => {
  object_names.value = await service.objectNames()
})
</script>

<template>
  <div>
    <div>切换图像/视频/混合</div>
    <div v-if="router.currentRoute.value.name === 'Pictures'">
      <a-button @click="picturesSwitchDisplayMode('image')">image</a-button>
      <a-button @click="picturesSwitchDisplayMode('video')">video</a-button>
      <a-button @click="picturesSwitchDisplayMode('mixed')">mixed</a-button>
    </div>
    <div></div>
    <ul style="list-style-type: circle; margin-top: 5px;">
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
