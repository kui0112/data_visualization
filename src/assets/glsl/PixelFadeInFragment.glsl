precision mediump float;

varying vec2 v_uv;
uniform float iTime;
uniform vec2 iResolution;
uniform sampler2D iChannel0;

const int max_iteration = 50;

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    int squarePixelDim = int(ceil(mod(iTime*-10.0, 40.0)));
    vec2 squareLoc = fragCoord / float(squarePixelDim);
    squareLoc = floor(squareLoc);
    vec4 avgColor = vec4(0.0, 0.0, 0.0, 0.0);
    vec2 upperLeftCorner = squareLoc * float(squarePixelDim);
    for (int i = 0; i < max_iteration; i++)
    {
        if (i >= squarePixelDim)
        {
            break;
        }
        for (int j = 0; j < max_iteration; j++)
        {
            if (j >= squarePixelDim)
            {
                break;
            }
            vec2 texCoord = (upperLeftCorner + vec2(i, j)) / iResolution.xy;
            texCoord.y = 1.0 - texCoord.y;
            avgColor += texture2D(iChannel0, vec2(texCoord.x, texCoord.y));
        }
    }

    avgColor = avgColor / float(squarePixelDim*squarePixelDim);

    fragColor = avgColor;
}
void main()
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
