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

 
//http://stackoverflow.com/a/190878
function getExtension(filename)
{
    //return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;
    return filename.split('.').pop();
}
 
// WILD COPY PASTE from http://learningwebg_glctx.com/blog/?p=28
// TODO this needs cleaning

    function getShader(gl, url) {
        //var shaderScript = document.getElementById(id);
        
        var shaderScript;
        $.ajax({
            url: url,
            dataType: "text",
            async: false,
            success: function (data) {
                shaderScript = data;
                //log(shaderScript);
            },
            error: function () {
                log("ERROR: could not load shader " + url);
            }
        });
        
        if (!shaderScript) {
            return null;
        }

        /*var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }*/

        var ext = getExtension(url);
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

        gl.shaderSource(shader, shaderScript);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }


    var shaderProgram;

    function initShaders(gl)
    {
        var fragmentShader = getShader(gl, g_root + "shader/gouraud.fs");
        var vertexShader = getShader(gl, g_root + "shader/gouraud.vs");

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
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix"); // normal matrix
    }


    var mvMatrix = mat4.create();
    var pMatrix = mat4.create();
    var nMatrix = mat4.create();

    function setMatrixUniforms(gl)
    {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
        gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix);
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
    
    

    var triangleVertexPositionBuffer;
    var triangleVertexNormalBuffer;
    var triangleVertexAmbientBuffer;
    var triangleVertexDiffuseBuffer;
    // var squareVertexPositionBuffer;
    // var squareVertexColorBuffer;

    function initBuffers(gl)
    {
        // position
        triangleVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
        var vertices = [
             0.0,  1.0,  0.0,
            -1.0, -1.0,  0.0,
             1.0, -1.0,  0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        triangleVertexPositionBuffer.itemSize = 3;
        triangleVertexPositionBuffer.numItems = 3;
        
        // normal
        triangleVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexNormalBuffer);
        var normals = [
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        triangleVertexNormalBuffer.itemSize = 3;
        triangleVertexNormalBuffer.numItems = 3;

        // ambient
        triangleVertexAmbientBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexAmbientBuffer);
        var ambients = [
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ambients), gl.STATIC_DRAW);
        triangleVertexAmbientBuffer.itemSize = 4;
        triangleVertexAmbientBuffer.numItems = 3;

        // diffuse
        triangleVertexDiffuseBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexDiffuseBuffer);
        var diffuses = [
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(diffuses), gl.STATIC_DRAW);
        triangleVertexDiffuseBuffer.itemSize = 4;
        triangleVertexDiffuseBuffer.numItems = 3;
        
        /*squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        vertices = [
             1.0,  1.0,  0.0,
            -1.0,  1.0,  0.0,
             1.0, -1.0,  0.0,
            -1.0, -1.0,  0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        squareVertexPositionBuffer.itemSize = 3;
        squareVertexPositionBuffer.numItems = 4;
        
        squareVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
        colors = []
        for (var i=0; i < 4; i++) {
          colors = colors.concat([0.5, 0.5, 1.0, 1.0]);
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        squareVertexColorBuffer.itemSize = 4;
        squareVertexColorBuffer.numItems = 4;        */
    }


    function drawScene(gl) {
        //gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, [0.0, 0.0, -7.0]);
        mat4.identity(nMatrix);
        mat4.translate(nMatrix, [0.0, 0.0, -7.0]);
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


        /*mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
        setMatrixUniforms(gl);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);*/
    }



    /*function webGLStart() {
        var canvas = document.getElementById("lesson01-canvas");
        initGL(canvas);
        initShaders();
        initBuffers();

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        drawScene();
    }*/
        
//------------------------------------------------------------------------------
function webgl_init()
{
	// set GL viewport width
	g_glctx.viewportWidth = g_glcanvas.width;
    g_glctx.viewportHeight = g_glcanvas.height;
	
    initShaders(g_glctx);
    initBuffers(g_glctx);
    
    
    lightAmbient = new Float32Array([ 0.1, 0.1, 0.1, 1.0 ]);
    lightDiffuse = new Float32Array([ 0.5, 0.5, 0.5, 1.0 ]);
    lightDir = new Float32Array([ 0.0, 0.0, -1.0 ]);
    

    g_glctx.clearColor(0.5, 0.5, 0.5, 1.0);
    g_glctx.enable(g_glctx.DEPTH_TEST);
}
