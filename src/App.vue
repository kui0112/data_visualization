<script setup lang="ts">
import Nav from "./components/Nav.vue";
import {onMounted, ref} from "vue";
import TestTools from "./components/TestTools.vue";

const navDiv = ref<HTMLDivElement | null>(null)
const routerViewDiv = ref<HTMLDivElement | null>(null)

let isScreen = false

onMounted(() => {
  init()
})

/* 初始化监听 */
function init() {
  getFullScreenChange()
  addFullScreenListener(getFullScreenChange)
  window.addEventListener('keydown', (event) => {
    handleKeyDown(event)
    if (['F11', 'Escape'].includes(event.code)) {
      getWinHeight()
      event.preventDefault()
    }
  })
}

/* 是否全屏 */
function isFullScreen() {
  return !!(
      document.fullscreenElement
  )
}

/* 全屏监听事件 */
function addFullScreenListener(callback) {
  const eventArrs = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange']
  eventArrs.forEach((item) => document.addEventListener(item, callback))
  return () => eventArrs.forEach((item) => document.removeEventListener(item, callback))
}

/* 移除监听事件--反正都全局的不移除其实也行 */
function removeFullScreenListener() {
  document.removeEventListener('keydown', handleKeyDown)
}

/* 获取全屏状态 */
function getFullScreenChange() {
  if (isFullScreen()) {
    isScreen = true
    console.log('已进入全屏')
    if (navDiv.value) {
      navDiv.value.style.display = 'none'
    }
    if (routerViewDiv.value) {
      routerViewDiv.value.style.height = '100%'
    }
  } else {
    isScreen = false
    console.log('已退出全屏')
    if (navDiv.value) {
      navDiv.value.style.display = 'flex'
    }
    if (routerViewDiv.value) {
      routerViewDiv.value.style.height = '90%'
    }
  }
}

/* 全屏状态下的监听 */
function handleKeyDown(e) {
  if (['Escape'].includes(e.code) && isFullScreen()) {
    exitFullscreen()
  }
}

/* 判断全屏高度条件 */
function getWinHeight() {
  const winHeight = screen.height
  const domHeight = document.documentElement.clientHeight
  const resHeight = winHeight - domHeight
  if (resHeight < 100) {
    exitFullscreen()
  } else {
    launchFullscreen()
  }
}

//开启浏览器全屏
const launchFullscreen = () => {
  return document.documentElement?.requestFullscreen()
}

// 关闭浏览器全屏
const exitFullscreen = () => {
  return document?.exitFullscreen
}
</script>

<template>
  <div class="nav" ref="navDiv">
    <Nav></Nav>
  </div>
  <div class="router-view" ref="routerViewDiv">
    <router-view></router-view>
  </div>
  <div class="test-tools">
    <TestTools></TestTools>
  </div>
</template>

<style lang="less" scoped>
.nav {
  width: 100%;
  height: 5%;
  display: flex;
  align-items: center;
}

.router-view {
  width: 80%;
  height: 90%;
  float: left;
  overflow: hidden;
}

.test-tools {
  width: 20%;
  height: 95%;
  float: right;
}
</style>
