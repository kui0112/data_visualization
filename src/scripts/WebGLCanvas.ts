import {delay} from "./Utils";
import DefaultVertexSource from "../assets/glsl/DefaultVertex.glsl"
import DefaultFragmentSource from "../assets/glsl/DefaultFragment.glsl"
import PixelFadeInFragment from "../assets/glsl/PixelFadeInFragment.glsl"
import PlainFadeInFragment from "../assets/glsl/PlainFadeInFragment.glsl"

export enum AnimationState {
    ready,
    running,
    stopped
}

export abstract class Animation {
    ctx: WebGLRenderingContext
    vertex: WebGLShader
    fragment: WebGLShader
    program: WebGLProgram
    texture: WebGLTexture
    samplerLocation: WebGLUniformLocation
    state: AnimationState = AnimationState.ready

    public constructor() {
    }

    public abstract vertexSource(): string;

    public abstract fragmentSource(): string;

    public initialize(ctx: WebGLRenderingContext) {
        this.ctx = ctx

        this.vertex = this.createShader(this.ctx.VERTEX_SHADER, this.vertexSource())
        if (!this.vertex) {
            throw new Error("Unable to create vertex shader.")
        }
        this.fragment = this.createShader(this.ctx.FRAGMENT_SHADER, this.fragmentSource())
        if (!this.fragment) {
            throw new Error("Unable to create fragment shader.")
        }
    }

    public createProgram(): boolean {
        this.program = this.ctx.createProgram() as WebGLProgram
        this.ctx.attachShader(this.program, this.vertex)
        this.ctx.attachShader(this.program, this.fragment)
        this.ctx.linkProgram(this.program)
        if (!this.ctx.getProgramParameter(this.program, this.ctx.LINK_STATUS)) {
            console.error("Error linking program:", this.ctx.getProgramInfoLog(this.program))
            this.ctx.deleteProgram(this.program)
            return false
        }
        this.ctx.useProgram(this.program)
        return true
    }

    public createShader(type: number, source: string) {
        const shader = this.ctx.createShader(type)
        this.ctx.shaderSource(shader, source)
        this.ctx.compileShader(shader)

        if (!this.ctx.getShaderParameter(shader, this.ctx.COMPILE_STATUS)) {
            console.error("Error compiling shader:", this.ctx.getShaderInfoLog(shader))
            this.ctx.deleteShader(shader)
            return null
        }

        return shader
    }

    public beforeRender() {
        // 设置视口
        this.ctx.viewport(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
        // 清除画布
        this.ctx.clearColor(0.0, 0.0, 0.0, 1.0)
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT)

        if (!this.createProgram()) {
            throw new Error("Unable to create program.")
        }

        setFloatArray(this.ctx, this.program, [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0], "a_position")
        setFloatArray(this.ctx, this.program, [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0], "a_uv")
        setFloat(this.ctx, this.program, 3, "iTime")
        setFloat2(this.ctx, this.program, this.ctx.canvas.width, this.ctx.canvas.height, "iResolution")

        // 设置纹理
        this.ctx.activeTexture(this.ctx.TEXTURE0)
        this.texture = this.ctx.createTexture()
        this.ctx.bindTexture(this.ctx.TEXTURE_2D, this.texture)
        this.samplerLocation = this.ctx.getUniformLocation(this.program, "iChannel0")
        this.ctx.uniform1i(this.samplerLocation, 0)

        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.CLAMP_TO_EDGE)
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.CLAMP_TO_EDGE)
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.LINEAR)
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MAG_FILTER, this.ctx.LINEAR)
    }

    public afterRender() {
        // 从program卸载shader
        this.ctx.detachShader(this.program, this.vertex);
        this.ctx.detachShader(this.program, this.fragment);
        // 删掉贴图
        this.ctx.deleteTexture(this.texture)
        // 删掉program
        this.ctx.deleteProgram(this.program);
        // 指针置空
        this.program = null
        // 重置生命周期状态
        this.state = AnimationState.stopped
    }

    public async _alive() {
        while (this.state === AnimationState.running) {
            await delay(0.02)
        }
    }

    public async render(image: HTMLImageElement) {
        if (this.state !== AnimationState.ready) {
            throw new Error("unable to render animation, state error.")
        }

        this.state = AnimationState.running
        this.beforeRender()
        if (!this.program) {
            throw new Error("program is null.")
        }
        await Promise.race([this._render(image), this._alive()])
        this.afterRender()
        this.state = AnimationState.ready
    }

    public async stop() {
        this.state = AnimationState.stopped
        while (this.state === AnimationState.stopped) {
            await delay(0.02)
        }
    }

    public abstract _render(image: HTMLImageElement): Promise<void>;
}

const setFloatArray = (ctx: WebGLRenderingContext, program: WebGLProgram, data: Iterable<number>, attribute: string) => {
    const buffer = ctx.createBuffer()
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer)
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(data), ctx.STATIC_DRAW)

    const location = ctx.getAttribLocation(program, attribute)
    ctx.enableVertexAttribArray(location)
    ctx.vertexAttribPointer(location, 2, ctx.FLOAT, false, 0, 0)
}

const setFloat = (ctx: WebGLRenderingContext, program: WebGLProgram, data: number, attribute: string) => {
    const location = ctx.getUniformLocation(program, attribute);
    ctx.uniform1f(location, data);
}

const setFloat2 = (ctx: WebGLRenderingContext, program: WebGLProgram, x: number, y: number, attribute: string) => {
    const location = ctx.getUniformLocation(program, attribute);
    ctx.uniform2f(location, x, y);
}

export class NoAnimation extends Animation {
    fragmentSource(): string {
        return DefaultFragmentSource;
    }

    vertexSource(): string {
        return DefaultVertexSource;
    }

    public async _render(image: HTMLImageElement): Promise<void> {
        if (this.state !== AnimationState.running) return
        // 读取图像时反转Y轴
        this.ctx.pixelStorei(this.ctx.UNPACK_FLIP_Y_WEBGL, true)
        // 上传图像到纹理
        this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, image)
        // 还原
        this.ctx.pixelStorei(this.ctx.UNPACK_FLIP_Y_WEBGL, false)
        // 绘制
        this.ctx.drawArrays(this.ctx.TRIANGLE_STRIP, 0, 4) // 顶点数量为4
    }
}

export class PixelFadeAnimation extends Animation {
    fragmentSource(): string {
        return PixelFadeInFragment;
    }

    vertexSource(): string {
        return DefaultVertexSource;
    }

    public async _render(image: HTMLImageElement) {
        if (this.state !== AnimationState.running) return
        // 上传图像到纹理
        this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, image)

        for (let i = 0; i < 40 && this.state === AnimationState.running; i++) {
            setFloat(this.ctx, this.program, i * 0.1, "iTime")
            // 绘制
            this.ctx.drawArrays(this.ctx.TRIANGLE_STRIP, 0, 4) // 顶点数量为4
            await delay(0.02)
        }
    }
}

export class PlainFadeAnimation extends Animation {
    fragmentSource(): string {
        return PlainFadeInFragment;
    }

    vertexSource(): string {
        return DefaultVertexSource;
    }

    public async _render(image: HTMLImageElement) {
        if (this.state !== AnimationState.running) return
        // 上传图像到纹理
        this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, image)

        for (let i = 0; 0.05 * i < Math.PI / 2 && this.state === AnimationState.running; i++) {
            setFloat(this.ctx, this.program, i * 0.05, "iTime")
            // 绘制
            this.ctx.drawArrays(this.ctx.TRIANGLE_STRIP, 0, 4) // 顶点数量为4
            await delay(0.04)
        }

        if (this.state !== AnimationState.running) return
        setFloat(this.ctx, this.program, Math.PI / 2, "iTime")
        // 绘制
        this.ctx.drawArrays(this.ctx.TRIANGLE_STRIP, 0, 4) // 顶点数量为4
        await delay(0.02)
    }
}
