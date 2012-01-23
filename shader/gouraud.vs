// gouraud shading
// 1 directional light + ambient + diffuse (TODO + specular)

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec4 aVertexAmbient;
attribute vec4 aVertexDiffuse;

uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform vec3 uLightDir;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec4 vColor;

void main(void)
{
    // transform position
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    
    // ambient
    vColor = aVertexAmbient * uLightAmbient;
    
    // diffuse
    vec3 normal = normalize(uNMatrix * vec4(aVertexNormal, 1.0)).xyz;
	float dot = max(0.0, dot(normal, uLightDir));
    vColor += dot * aVertexDiffuse * uLightDiffuse;
}
