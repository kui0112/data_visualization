precision mediump float;

varying vec2 v_uv;
uniform float iTime;
uniform vec2 iResolution;
uniform sampler2D iChannel0;

const int max_iteration = 50;

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    // Get the fragment position (ranging from 0-1)
    vec2 uv = fragCoord.xy / iResolution.xy;

    // Flip the y-axis so that the texture is right-side up
    uv = vec2(uv.x, 1.0 - uv.y);

    // Get the fragment color at the specified uv position
    vec4 fragmentColor = texture2D(iChannel0, uv);

    float sinTime = sin(iTime);

    vec4 color = vec4(fragmentColor.r * abs(sinTime), fragmentColor.g * abs(sinTime), fragmentColor.b * abs(sinTime), 1.0);

    // Output the fragment color
    fragColor = color;
}
void main()
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}