precision mediump float;
varying vec2 v_uv;
uniform sampler2D iChannel0;
uniform float iTime;

void main() {
    gl_FragColor = texture2D(iChannel0, v_uv);
}
