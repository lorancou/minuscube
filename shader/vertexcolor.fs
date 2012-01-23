// direct vertex color, no lighting
// pass-through: apply interpolated vertex color to all pixels

precision mediump float;

varying vec4 vColor;

void main(void)
{
    gl_FragColor = vColor;
}
