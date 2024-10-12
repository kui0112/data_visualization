import {delay} from "./Utils";
import {nextTick} from "vue";

let vectorArray = "0000000000 0000000000 0000000000 0000000000 0000000000".split(" ");
const randomVector = () => vectorArray[Math.floor(Math.random() * vectorArray.length)];
const randomNum = (a: number, b: number) => a + Math.floor(Math.random() * b)
export const updateVectors = (vectorString: string) => {
    vectorArray = vectorString.split(" ")
}

class Drop {
    x: number
    y: number
    // chars
    buffer: Array<string> = []
    // 存在了多少帧
    aliveFrames: number = 0

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    reset() {
        this.y = 1
        this.buffer = []
        this.aliveFrames = 0
    }

    next(): string {
        this.aliveFrames = 0
        if (!this.buffer.length) {
            this.buffer.push(" ".repeat(randomNum(1, 3)))
            let s = randomVector()
            // 反转
            // s = s.split("").reverse().join("")
            for (const c of s) {
                this.buffer.push(c)
            }
        }
        return this.buffer.shift()
    }
}

export class MatrixAnimation {
    // canvas scale，值越小canvas越小，则文字越大
    scale: number = 0.8
    fps: number = 20
    transparencyStep: number = 0.01
    // 字体大小
    fontSize: number = 15
    columns: number
    rows: number
    drops: Array<Drop> = []

    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D

    starterFlag: boolean = true
    // 跳过更新字符位置的次数
    counter: number = 0
    counterMaxValue: number = 25
    // 持续的帧数
    frames: number = 0
    animationId: number = 0

    constructor() {
    }

    public initialize(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.canvas.width = window.innerWidth * this.scale
        this.canvas.height = window.innerHeight * this.scale

        this.ctx = this.canvas.getContext('2d')

        this.ctx.font = `${this.fontSize}px SanFrancisco`
        this.columns = this.canvas.width / this.fontSize
        this.rows = this.canvas.height / this.fontSize
        for (let i = 0; i < this.columns; i++) {
            this.drops.push(new Drop(i, 1))
        }
    }

    public async start() {
        const currentAnimId = Date.now()

        this.ctx.fillStyle = `rgba(0, 0, 0, 1)`
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        while (this.animationId === currentAnimId) {
            this.ctx.fillStyle = `rgba(0, 0, 0, ${this.transparencyStep})`
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

            for (let i = 0; i < this.drops.length; i++) {
                const drop = this.drops[i]
                // 绘制字符之前清空格子
                if (this.animationId !== currentAnimId) return
                this.ctx.fillStyle = `rgba(0, 0, 0, 1)`
                if (this.animationId !== currentAnimId) return
                this.ctx.fillRect(drop.x * this.fontSize, (drop.y - 1) * this.fontSize, this.fontSize, this.fontSize)

                // 绘制字符
                if (this.animationId !== currentAnimId) return
                this.ctx.fillStyle = '#ffffff'
                if (this.animationId !== currentAnimId) return
                this.ctx.fillText(drop.next(), drop.x * this.fontSize, drop.y * this.fontSize)

                drop.y++
                drop.aliveFrames++
                if (this.starterFlag && drop.y * this.fontSize > this.canvas.height && i === 0) {
                    this.counter++
                    if (this.counter > this.counterMaxValue) {
                        this.starterFlag = false
                        this.fps = 1
                    }
                }
                if (!this.starterFlag && drop.y * this.fontSize > this.canvas.height && Math.random() > 0.95) {
                    drop.y = 0
                }

                this.frames++
            }
            await delay(1.0 / this.fps)
        }
    }

    public async updateVectors(vectorString: string) {
        this.ctx.fillStyle = `rgba(0, 0, 0, 1)`
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        updateVectors(vectorString)
        this.animationId = Date.now()

        for (let i = 0; i < this.columns; i++) {
            this.drops[i].reset()
        }
        this.frames = 0
        this.counter = 0
        this.starterFlag = true
        this.fps = 20
        await nextTick()
    }
}
