import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import string from 'vite-plugin-string';

// https://vitejs.dev/config/
export default defineConfig({
    base: "./",
    plugins: [
        vue(),
        string({
            include: ['**/*.glsl',]
        })
    ],
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
            },
        },
    },
})

// import {UserConfig} from 'vite'
// import vue from '@vitejs/plugin-vue'
// import {viteSingleFile} from 'vite-plugin-singlefile'
//
// // https://vitejs.dev/config/
// export default ({mode}): UserConfig => {
//     return {
//         base: mode === 'development' ? '/' : './',
//         plugins: [vue(), viteSingleFile()],
//     }
// }
