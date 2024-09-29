import {createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw} from "vue-router"

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "Home",
        redirect: '/cameraView' // 默认重定向到知识图谱页面
    },
    {
        path: "/knowledgeGraph",
        name: "KnowledgeGraph",
        component: () => import("./views/KnowledgeGraph.vue")
    },
    {
        path: "/vectorAnimation",
        name: "VectorAnimation",
        component: () => import("./views/MatrixAnimation.vue")
    },
    {
        path: "/pictures",
        name: "Pictures",
        component: () => import("./views/Pictures.vue")
    },
    {
        path: "/cameraView",
        name: "CameraView",
        component: () => import("./views/CameraView.vue")
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes: routes,
})

export default router
