<script lang="ts" setup>
import Video from '../components/Video.vue'

const src = 'http://localhost:9999/static/videos/video.mp4'

</script>

<template>
  <a-row justify="space-evenly">
    <a-col :span="6">
      <a-card style="width: 400px">
        <template #cover>
          <Video :src="src"></Video>
        </template>
      </a-card>
    </a-col>

    <a-col :span="6">
      <a-card style="width: 400px">
        <template #cover>
          <Video :src="src"></Video>
        </template>
      </a-card>
    </a-col>
  </a-row>

  <a-row justify="space-evenly">
    <a-col :span="6">
      <a-card style="width: 400px">
        <template #cover>
          <Video :src="src"></Video>
        </template>
      </a-card>
    </a-col>

    <a-col :span="6">
      <a-card style="width: 400px">
        <template #cover>
          <Video :src="src"></Video>
        </template>
      </a-card>
    </a-col>
  </a-row>
</template>

<style scoped lang="less">

</style>