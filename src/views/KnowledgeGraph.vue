<script setup lang="ts">
import {onMounted, onBeforeUnmount, ref} from "vue"
import * as service from "../scripts/Service";
import {useRouter} from "vue-router";
import {PresetMixedNodeOptions} from "../scripts/PresetNodeOptions";
import {PresetEdgeOptions} from "../scripts/PresetEdgeOptions";
import {PresetForceLayoutOptions,} from "../scripts/PresetLayoutOptions";
import {NewGraph} from "../scripts/NewGraph";
import * as settings from "../scripts/GlobalSettings";
import {randomChoice} from "../scripts/Utils";

const reload = () => location.reload()

const mountNode = ref<HTMLDivElement | null>(null)
const router = useRouter()

let knowledgeGraph: NewGraph | null = null
let ws: WebSocket | null = null
let currentObjectName: string = ""

const onMessage = async (e: MessageEvent) => {
  if (router.currentRoute.value.name !== "KnowledgeGraph") {
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
      reload()
    }
  }
}

onMounted(async () => {
  ws = await service.ws_connect()
  if (ws) {
    ws.onopen = async (e: MessageEvent) => {
      console.log("ws connected.")
    }
    ws.onmessage = onMessage
  }
  const res1 = await service.currentObjectName()
  currentObjectName = res1.content
  if (!currentObjectName) {
    return
  }

  const res2 = await service.knowledgeGraph(currentObjectName)
  const content = res2.content
  if (content?.data && content?.images?.length > 0) {
    const images: Array<string> = []
    for (const image of content.images) {
      images.push(service.apiAddress(image))
    }

    knowledgeGraph = new NewGraph({
      // 指定容器元素
      container: mountNode.value,
      // 自动调整画布大小
      autoResize: false,
      // 画布内边距
      padding: 0,
      // 启用全局动画
      animation: false,
      // 背景颜色
      background: settings.dark ? '#000000' : '#ffffff',
      // 动态图片数据源
      dynamicImageSource: () => randomChoice(images),
      // 数据
      data: content.data,
      // 节点配置
      node: PresetMixedNodeOptions,
      // 边配置
      edge: PresetEdgeOptions,
      // 布局配置
      layout: PresetForceLayoutOptions,
      // 交互行为配置
      behaviors: [],
    })

    await Promise.race([knowledgeGraph.render(), knowledgeGraph.animation()])
    reload()
  }
})

onBeforeUnmount(async () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close()
  }
  knowledgeGraph?.destroy()
})
</script>

<template>
  <div class="mountNodeParent">
    <div ref="mountNode" class="mountNode"></div>
  </div>
</template>

<style lang="less" scoped>
.mountNodeParent {
  width: 100%;
  height: 100%;
  padding: 0;
}

.mountNode {
  width: 100%;
  height: 100%;
}
</style>
