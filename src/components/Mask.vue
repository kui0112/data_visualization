<script setup lang="ts">

import {onBeforeUnmount, onMounted, ref} from "vue";
import string from "vite-plugin-string";

const flowerDiv = ref<HTMLDivElement>(null)
const step = 0.5

let i = 0
let timer: NodeJS.Timeout | null = null

const updatePosition = () => {
  const elements = document.getElementsByClassName("petal")
  for (const e of elements) {
    const petal = e as HTMLDivElement
    const id = parseInt(petal.getAttribute('id'))
    petal.style.transform = `rotate(${(id * 45 + step * i) % 360}deg)`
  }
  i++
}

onMounted(() => {
  timer = setInterval(updatePosition, 0.04)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})

</script>

<template>
  <div class="container">
    <div class="flower" ref="flowerDiv">
      <div class="petal" v-for="i in 8" :key="i" :id="`${i}`" :style="`transform: rotate(${i * 45}deg)`">
        <div class="circle"></div>
        <div class="triangle"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.container {
  //position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  display: none;
  z-index: 10;
}

.flower {
  position: relative;
  width: 100%;
  height: 100%;
}

.circle {
  background: white;
  border-radius: 50%;
  width: 60px;
  height: 60px;
}

.triangle {
  margin-top: -20px;
  width: 0;
  height: 0;
  border-top: 80px solid white;
  border-left: 28px solid transparent;
  border-right: 28px solid transparent;
}

.petal {
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-origin: center 120px;

  position: absolute;
  top: calc(50% - 140px);
  left: calc(50% - 30px);
}
</style>