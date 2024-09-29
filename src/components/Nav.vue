<script lang="ts" setup>
import {h, ref} from 'vue'
import {
  HomeOutlined,
  PlaySquareOutlined,
  ArrowRightOutlined,
  DeploymentUnitOutlined,
  PictureOutlined,
  VideoCameraOutlined
} from '@ant-design/icons-vue'
import {MenuProps} from 'ant-design-vue'
import {useRouter, useRoute} from 'vue-router'

const router = useRouter()
const route = useRoute()
const current = ref<string[]>(['Home'])
const items = ref<MenuProps['items']>([
  {
    key: 'Home',
    icon: () => h(HomeOutlined),
    label: 'Home',
    title: 'Home',
  },
  {
    key: 'KnowledgeGraph',
    icon: () => h(DeploymentUnitOutlined),
    label: 'KnowledgeGraph',
    title: 'KnowledgeGraph',
  },
  {
    key: 'VectorAnimation',
    icon: () => h(ArrowRightOutlined),
    label: 'VectorAnimation',
    title: 'VectorAnimation',
  },
  {
    key: 'Pictures',
    icon: () => h(PictureOutlined),
    label: 'Pictures',
    title: 'Pictures',
  },
  {
    key: 'CameraView',
    icon: () => h(VideoCameraOutlined),
    label: 'CameraView',
    title: 'CameraView',
  },
  // {
  //   key: 'Videos',
  //   icon: () => h(PlaySquareOutlined),
  //   label: 'Videos',
  //   title: 'Videos',
  // }
])

function onSelected(e: any) {
  current.value = [e.key] // 更新当前选中的菜单项
  router.push({name: e.key}) // 根据选中的 key 导航到相应的路由
}
</script>

<template>
  <a-menu class="menu"
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @select="onSelected"/>
</template>

<style lang="less" scoped>
.menu {
  width: 100%;
  white-space: nowrap;
}
</style>
