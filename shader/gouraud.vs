// gouraud shading
// 1 directional light + ambient + diffuse (TODO + specular)
// TODO: maybe an assert beforehand to avoid extra normalizations

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec4 aVertexAmbient;
attribute vec4 aVertexDiffuse;

uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform vec3 uLightDir;

uniform mat4 uPMatrix;
uniform mat4 uVMatrix;
uniform mat4 uMVMatrix;
uniform mat3 uNMatrix;

varying vec4 vColor;

//------------------------------------------------------------------------------
void main(void)
{
    // transform vertex position into screen space
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    
    // set ambient color
    vColor = aVertexAmbient * uLightAmbient;
    
    // transform normal into eye space
    vec3 normal = uNMatrix * aVertexNormal;
    
    // transform light direction into eye space
    vec4 lDirection = uVMatrix * vec4( uLightDir, 0.0 );
    vec3 dirVector = normalize(lDirection.xyz);
    //vec3 dir = normalize(uVMatrix * vec4(uLightDir, 1.0)).xyz;

    // add diffuse color: Lambert's cosine law
    float cosine = max(0.0, dot(normal, dirVector));
    vColor += cosine * (aVertexDiffuse * uLightDiffuse);
}
