/*
 * glcore.js
 * ----------
 *
 * Minus Cube
 * Copyright (c) 2008-2012 Laurent Couvidou
 * Contact : lorancou@free.fr
 *
 * This program is free software - see README for details.
 */

//------------------------------------------------------------------------------
function webgl_load_shader(gl, url)
{
    // load shader file with jQuery
    var shaderScript;
    $.ajax({
        url: url,
        dataType: "text",
        async: false,
        success: function (data)
        {
            shaderScript = data;
        },
        error: function ()
        {
            log("ERROR: could not load shader " + url);
        }
    });
    if (!shaderScript)
    {
        return null;
    }

    // create fragment or vertex shader, depending on the extension
    var ext = url.split('.').pop(); //http://stackoverflow.com/a/190878
    var shader;
    if (ext == "fs")
    {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    else if (ext == "vs")
    {
        shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else
    {
        log("ERROR: unknown shader extension " + url + ", should be fs or vs");
        return null;
    }

    // compile it
    gl.shaderSource(shader, shaderScript);
    gl.compileShader(shader);

    // report compile errors (syntax, etc.)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        log(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


    var shaderProgram;

    function initShaders(gl)
    {
        var fragmentShader = webgl_load_shader(gl, g_root + "shader/gouraud.fs");
        var vertexShader = webgl_load_shader(gl, g_root + "shader/gouraud.vs");
        //var fragmentShader = webgl_load_shader(gl, g_root + "shader/vertexcolor.fs");
        //var vertexShader = webgl_load_shader(gl, g_root + "shader/vertexcolor.vs");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
        {
            //alert("Could not initialise shaders");
            log("ERROR: could not initialise shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
        
        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        shaderProgram.vertexAmbientAttribute = gl.getAttribLocation(shaderProgram, "aVertexAmbient");
        gl.enableVertexAttribArray(shaderProgram.vertexAmbientAttribute);        

        shaderProgram.vertexDiffuseAttribute = gl.getAttribLocation(shaderProgram, "aVertexDiffuse");
        gl.enableVertexAttribArray(shaderProgram.vertexDiffuseAttribute);        

        shaderProgram.lightAmbient = gl.getUniformLocation(shaderProgram, "uLightAmbient");
        shaderProgram.lightDiffuse = gl.getUniformLocation(shaderProgram, "uLightDiffuse");
        shaderProgram.lightDir = gl.getUniformLocation(shaderProgram, "uLightDir");

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix"); // normal matrix
    }


    var pMatrix = mat4.create();
    var vMatrix = mat4.create();
    var mvMatrix = mat4.create();
    var nMatrix = mat3.create();

    function setMatrixUniforms(gl)
    {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
        gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
    }



    // var lightAmbient = vec4.create();
    // var lightDiffuse = vec4.create();
    // var lightDir = vec3.create();
    
    var lightAmbient;
    var lightDiffuse;
    var lightDir;
    
    function setLightUniforms(gl)
    {
        gl.uniform4fv(shaderProgram.lightAmbient, lightAmbient);
        gl.uniform4fv(shaderProgram.lightDiffuse, lightDiffuse);
        gl.uniform3fv(shaderProgram.lightDir, lightDir);
    }
    

    var vertices = [];
    var normals = [];
    var ambients = [];
    var diffuses = [];

    function concatVertex(position, normal, material)
    {
        for (var i=0; i<3; ++i) // flatten coordinates
        {
            vertices = vertices.concat(position[i]);
            normals = normals.concat(normal[i]);
        }
        for (var i=0; i<3; ++i) // flatten colors
        {
            ambients = ambients.concat(material.ambient[i]);
            diffuses = diffuses.concat(material.diffuse[i]);
        }
        ambients = ambients.concat(1.0); // alpha missing in Ajax3d material
        diffuses = diffuses.concat(1.0); // alpha missing in Ajax3d material
    }
    

    var triangleVertexPositionBuffer;
    var triangleVertexNormalBuffer;
    var triangleVertexAmbientBuffer;
    var triangleVertexDiffuseBuffer;
    // var squareVertexPositionBuffer;
    // var squareVertexColorBuffer;

    function initBuffers(gl)
    {
        var numTriangles = 0;
        for (var i in minus_mesh.faces)
        {
            var numIndices = minus_mesh.faces[i].indices.length;
            var normal = minus_mesh.normals_ccw[i]; // vertices normals = faces normals... Ajax3d doesn't compute vertices normals, thus flat shading
            var material = minus_mesh.faces[i].material;
            if (numIndices == 3)
            {
                // one triangle
                for (var j=0; j<3; ++j)
                {
                    var index = minus_mesh.faces[i].indices[j];
                    concatVertex(minus_mesh.vertices[0][index], normal, material);
                }
                
                numTriangles += 1;
            }
            else if (numIndices == 4)
            {
                var index0 = minus_mesh.faces[i].indices[0];
                var index1 = minus_mesh.faces[i].indices[1];
                var index2 = minus_mesh.faces[i].indices[2];
                var index3 = minus_mesh.faces[i].indices[3];

                // first triangle
                concatVertex(minus_mesh.vertices[0][index0], normal, material);
                concatVertex(minus_mesh.vertices[0][index1], normal, material);
                concatVertex(minus_mesh.vertices[0][index3], normal, material);

                // second triangle
                concatVertex(minus_mesh.vertices[0][index1], normal, material);
                concatVertex(minus_mesh.vertices[0][index2], normal, material);
                concatVertex(minus_mesh.vertices[0][index3], normal, material);

                numTriangles += 2;
            }
            else
            {
                log("ERROR: invalid face, " + numIndices + " indices");
            }
        }
        // vertices position
        triangleVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
        /*var vertices = [[
             0.0,  1.0,  0.0,
            -1.0, -1.0,  0.0,
             1.0, -1.0,  0.0
        ]];*/
        /*var vertices = [];
        var numVertices = minus_mesh.vertices[0].length;
        for (var i in minus_mesh.vertices[0])
        {
            var vertex = minus_mesh.vertices[0][i];
            for (var j=0; j<3; ++j)
            {
                vertices = vertices.concat(vertex[j]);
            }
        }*/
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        triangleVertexPositionBuffer.itemSize = 3;
        triangleVertexPositionBuffer.numItems = numTriangles*3;

        // vertices normals = faces normals... Ajax3d doesn't compute vertices normals, thus flat shading
        triangleVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexNormalBuffer);
        /*var normals = [
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0
        ];*/
        /*var normals = [];
        var numNormals = minus_mesh.normals.length;
        for (var i in minus_mesh.normals)
        {
            var normal = minus_mesh.normals[i];
            for (var j=0; j<3; ++j)
            {
                normals = normals.concat(normal[j]);
            }
        }*/
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        triangleVertexNormalBuffer.itemSize = 3;
        triangleVertexNormalBuffer.numItems = numTriangles*3;

        // ambient
        triangleVertexAmbientBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexAmbientBuffer);
        /*var ambients = [
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
        ];*/
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ambients), gl.STATIC_DRAW);
        triangleVertexAmbientBuffer.itemSize = 4;
        triangleVertexAmbientBuffer.numItems = numTriangles*3;

        // diffuse
        triangleVertexDiffuseBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexDiffuseBuffer);
        /*var diffuses = [
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
        ];*/
        //log(diffuses);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(diffuses), gl.STATIC_DRAW);
        triangleVertexDiffuseBuffer.itemSize = 4;
        triangleVertexDiffuseBuffer.numItems = numTriangles*3;
        
        // log(numTriangles);
        // log(triangleVertexPositionBuffer.numItems);
        // log(triangleVertexNormalBuffer.numItems);
        // log(triangleVertexAmbientBuffer.numItems);
        // log(triangleVertexDiffuseBuffer.numItems);
    }

      var mvMatrixStack = [];
      function mvPushMatrix() {
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        mvMatrixStack.push(copy);
      }
      function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
          throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
      }    
    
//------------------------------------------------------------------------------
function webgl_init(canvas, gl)
{
	// set GL viewport width
	gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
	
    initShaders(gl);
    initBuffers(gl);
    
    lightAmbient = new Float32Array([ 0.5, 0.5, 0.5, 1.0 ]);
    lightDiffuse = new Float32Array([ 1.0, 1.0, 1.0, 1.0 ]);
    //lightDiffuse = new Float32Array([ 0.0, 0.0, 0.0, 1.0 ]);
    //lightDir = new Float32Array([ 0.0, -1.0, 0.0 ]);
    //lightDir = new Float32Array([-0.33, 0.0, -0.66]); // TODO: normals are somewhat inverted in Ajax3d, so the light direction is different there; fix this; prbly a CW vs CCW issue somewhere
    lightDir = new Float32Array([0.33, 0.0, -0.66]);
    
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    //gl.frontFace(gl.CCW);
    //gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE); // yeah... so *NOT* GL_CULL_FACE...
}

//------------------------------------------------------------------------------
function webgl_begin(gl)
{
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    // that's the view matrix
    mat4.identity(vMatrix);
    mat4.translate(vMatrix, [0.0, 0.0, -8.0]);

    mat4.set(vMatrix, mvMatrix);
    //log("mvMatrix:" + mvMatrix);
    //mat4.translate(mvMatrix, [0.0, 0.0, -8.0]);
    //mvMatrix = vMatrix;
}

//------------------------------------------------------------------------------
function webgl_draw_element(gl, mat)
{
    mvPushMatrix();

    // that's the model-view matrix / model position in eye space
    //mat4.rotate(mvMatrix, degToRad(rotx), [1, 0, 0]);
    //mat4.rotate(mvMatrix, degToRad(roty), [0, 1, 0]);
    
    mat4.multiply(mvMatrix, mat);

    // http://arcsynthesis.org/gltut/Illumination/Tut09%20Normal%20Transformation.html
    mat4.toInverseMat3(mvMatrix, nMatrix);
    mat3.transpose(nMatrix);
    
    setMatrixUniforms(gl);
    
    setLightUniforms(gl);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, triangleVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);        
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexAmbientBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexAmbientAttribute, triangleVertexAmbientBuffer.itemSize, gl.FLOAT, false, 0, 0);        
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexDiffuseBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexDiffuseAttribute, triangleVertexDiffuseBuffer.itemSize, gl.FLOAT, false, 0, 0);        

    
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
    
    mvPopMatrix();
}

//------------------------------------------------------------------------------
function webgl_end(gl)
{
    // TODO check gl.flush etc.?
}
