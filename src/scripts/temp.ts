// let program = null
// let vertexShader = null
// let fragmentShader = null
//
// const vertexSource = `
//   attribute vec2 a_position;
//   attribute vec2 a_texCoord;
//   varying vec2 v_texCoord;
//
//   void main(void) {
//     gl_Position = vec4(a_position, 0, 1.0);
//     v_texCoord = a_texCoord;
//   }
// `;
//
// const fragmentSource = `
//   precision mediump float;
//   varying vec2 v_texCoord;
//   uniform sampler2D u_image;
//
//   void main() {
//     gl_FragColor = texture2D(u_image, v_texCoord);
//   }
// `;
//
// const createShader = (ctx: WebGLRenderingContext, type: number, source: string) => {
//     const shader = ctx.createShader(type);
//     ctx.shaderSource(shader, source);
//     ctx.compileShader(shader);
//
//     if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
//         console.error("a error occurred compiling shader", ctx.getShaderInfoLog(shader));
//         return;
//     }
//
//     return shader;
// };
//
// const createProgram = (ctx: WebGLRenderingContext, shaders: WebGLShader[]) => {
//     const program = ctx.createProgram();
//     shaders.forEach((shader) => ctx.attachShader(program, shader));
//     ctx.linkProgram(program);
//
//     if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
//         console.error("a error occurred linking program ", ctx.getProgramInfoLog(program));
//         return;
//     }
//
//     ctx.useProgram(program);
//     return program;
// };
//
// const setAttribute = (ctx: WebGLRenderingContext, program: WebGLProgram, data: number[], attribute: string) => {
//     const buffer = ctx.createBuffer();
//     ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
//     ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(data), ctx.STATIC_DRAW);
//     // 获取顶点属性的在着色器中的索引，并激活它
//     const aVertexPositionLocation = ctx.getAttribLocation(program, attribute);
//     ctx.enableVertexAttribArray(aVertexPositionLocation);
//     // 设置顶点属性如何从顶点缓冲对象中取值。每次从数组缓冲对象中读取2个值
//     ctx.vertexAttribPointer(aVertexPositionLocation, 2, ctx.FLOAT, false, 0, 0);
// };
//
// export const initialize = (ctx: WebGLRenderingContext) => {
//     // 分别创建顶点着色器和片段着色器
//     vertexShader = createShader(ctx, ctx.VERTEX_SHADER, vertexSource);
//     if (!vertexShader) return false;
//     fragmentShader = createShader(ctx, ctx.FRAGMENT_SHADER, fragmentSource);
//     if (!fragmentShader) return false;
//     program = createProgram(ctx, [vertexShader, fragmentShader])
//     if (!program) return false;
//     return true
// }
//
// // export const draw = (ctx: WebGLRenderingContext, image: HTMLImageElement) => {
// //     // 设置顶点坐标属性
// //     const vertexData = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0];
// //     setAttribute(ctx, program, vertexData, "a_position");
// //     // 设置纹理坐标属性
// //     setAttribute(ctx, program, vertexData, "a_texCoord");
// //
// //     // 设置纹理贴图
// //     ctx.activeTexture(ctx.TEXTURE0);
// //     const texture = ctx.createTexture();
// //     ctx.bindTexture(ctx.TEXTURE_2D, texture);
// //     const sampler = ctx.getUniformLocation(program, "u_image");
// //     ctx.uniform1i(sampler, 0);
// //
// //     ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
// //     ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
// //     ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
// //     ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
// //
// //     // Upload the image into the texture.
// //     ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, image);
// //     ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, 4);
// // }
//
// export const draw = (ctx: WebGLRenderingContext, image: HTMLImageElement) => {
// // export const draw = (ctx: WebGLRenderingContext, image: HTMLImageElement, canvasWidth: number, canvasHeight: number) => {
//     // 获取图像的宽高
//     // const imageWidth = image.width;
//     // const imageHeight = image.height;
//
//     // 计算宽高比
//     // const canvasAspect = canvasWidth / canvasHeight;
//     // const imageAspect = imageWidth / imageHeight;
//
//     // let vertexData: number[];
//
//     // 宽度填满canvas，按高度居中
//     // if (imageAspect >= canvasAspect) {
//     //     const scaledWidth = canvasWidth;
//     //     const scaledHeight = scaledWidth / imageAspect;
//     //     const halfScaledWidth = scaledWidth / 2;
//     //     const halfScaledHeight = scaledHeight / 2;
//     //
//     //     vertexData = [
//     //         -1.0, -halfScaledHeight / halfScaledWidth,   // 左下
//     //         1.0, -halfScaledHeight / halfScaledWidth,    // 右下
//     //         -1.0, halfScaledHeight / halfScaledWidth,     // 左上
//     //         1.0, halfScaledHeight / halfScaledWidth     // 右上
//     //     ];
//     // } else {
//     //     // 高度填满canvas，按宽度居中
//     //     const scaledHeight = canvasHeight;
//     //     const scaledWidth = imageAspect * scaledHeight;
//     //     const halfScaledWidth = scaledWidth / 2;
//     //     const halfScaledHeight = scaledHeight / 2;
//     //
//     //     vertexData = [
//     //         -halfScaledWidth / halfScaledHeight, -1.0,   // 左下
//     //         halfScaledWidth / halfScaledHeight, -1.0,    // 右下
//     //         -halfScaledWidth / halfScaledHeight, 1.0,    // 左上
//     //         halfScaledWidth / halfScaledHeight, 1.0      // 右上
//     //     ];
//     // }
//
//     const vertexData = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0];
//     // 设置顶点坐标属性
//     setAttribute(ctx, program, vertexData, "a_position");
//
//     // 设置纹理坐标属性
//     // const texCoordData = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0];
//     // const texCoordData = [
//     //     0.0, 1.0,  // 左下
//     //     1.0, 1.0,  // 右下
//     //     0.0, 0.0,  // 左上
//     //     1.0, 0.0   // 右上
//     // ];
//     const texCoordData = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0];
//     setAttribute(ctx, program, texCoordData, "a_texCoord");
//
//     // 设置纹理贴图
//     ctx.activeTexture(ctx.TEXTURE0);
//     const texture = ctx.createTexture();
//     ctx.bindTexture(ctx.TEXTURE_2D, texture);
//     const sampler = ctx.getUniformLocation(program, "u_image");
//     ctx.uniform1i(sampler, 0);
//
//     ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
//     ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
//     ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
//     ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
//
//     // 上传图像到纹理
//     ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, image);
//
//     // 绘制
//     ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, 4);
// }
