<script setup lang="ts">
import {onMounted, ref} from "vue"
import * as service from "../scripts/Service"

const object_names = ref<Array<string>>([])

onMounted(async () => {
  object_names.value = await service.objectNames()
})
</script>

<template>
  <div>
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
