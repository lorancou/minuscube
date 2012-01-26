/*
 * WebGLRenderer.js
 * ----------
 *
 * Minus Cube
 * Copyright (c) 2008-2012 Laurent Couvidou
 * Contact : lorancou@free.fr
 *
 * This program is free software - see README for details.
 */

//------------------------------------------------------------------------------
// The WebGL canvas context renderer
MC.WebGLRenderer = function(_canvas, _context)
{
    this.parent = MC.IRenderer;
    this.parent.call(this, _canvas, _context);
    
    // just an alias to the context for convenience
    this.gl = _context;
        
    // TODO renderer-independant light objects
    this.lightAmbient = new Float32Array([ 0.5, 0.5, 0.5, 1.0 ]);
    this.lightDiffuse = new Float32Array([ 1.0, 1.0, 1.0, 1.0 ]);
    this.lightDir = new Float32Array([0.33, 0.0, -0.66]);
    
    // TODO shader/technique as a resource
    this.shaderprog = null;
    
    // TODO renderer-independant matrices
    this.pMatrix = mat4.create();
    this.vMatrix = mat4.create();
    this.mvMatrix = mat4.create();
    this.nMatrix = mat3.create();
    this.mvMatrixStack = [];
    
    // TODO Mesh class
    this.triangleVertexPositionBuffer = null;
    this.triangleVertexNormalBuffer = null;
    this.triangleVertexAmbientBuffer = null;
    this.triangleVertexDiffuseBuffer = null;

    // setup WebGL
    this.gl.viewportWidth = _canvas.width;
    this.gl.viewportHeight = _canvas.height;
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.frontFace(this.gl.CCW); // TODO: renderer-independant config?
    this.gl.cullFace(this.gl.BACK); // TODO: renderer-independant config?
    this.gl.enable(this.gl.CULL_FACE); // yeah... so *NOT* GL_CULL_FACE...
    
    // init stuff
    this.initShaders();
    this.initBuffers();
}
MC.WebGLRenderer.prototype = new MC.IRenderer();

//------------------------------------------------------------------------------
MC.WebGLRenderer.prototype.loadShader = function(_url)
{
    // load shader file with jQuery
    var shaderScript;
    $.ajax({
        url: _url,
        dataType: "text",
        async: false,
        success: function (data)
        {
            shaderScript = data;
        },
        error: function ()
        {
            log("ERROR: could not load shader " + _url);
        }
    });
    if (!shaderScript)
    {
        return null;
    }

    // create fragment or vertex shader, depending on the extension
    var ext = _url.split('.').pop(); //http://stackoverflow.com/a/190878
    var shader;
    if (ext == "fs")
    {
        shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    }
    else if (ext == "vs")
    {
        shader = this.gl.createShader(this.gl.VERTEX_SHADER);
    }
    else
    {
        log("ERROR: unknown shader extension " + _url + ", should be fs or vs");
        return null;
    }

    // compile it
    this.gl.shaderSource(shader, shaderScript);
    this.gl.compileShader(shader);

    // report compile errors (syntax, etc.)
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS))
    {
        log(this.gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

//--------------------------------------------------------------------------
MC.WebGLRenderer.prototype.initShaders = function()
{
    // TODO: load shaders as resources
    
    var fragmentShader = this.loadShader(g_root + "shader/gouraud.fs");
    var vertexShader = this.loadShader(g_root + "shader/gouraud.vs");
    //var fragmentShader = webgl_load_shader(gl, g_root + "shader/vertexcolor.fs");
    //var vertexShader = webgl_load_shader(gl, g_root + "shader/vertexcolor.vs");

    m_shaderprog = this.gl.createProgram();
    this.gl.attachShader(m_shaderprog, vertexShader);
    this.gl.attachShader(m_shaderprog, fragmentShader);
    this.gl.linkProgram(m_shaderprog);

    if (!this.gl.getProgramParameter(m_shaderprog, this.gl.LINK_STATUS))
    {
        //alert("Could not initialise shaders");
        log("ERROR: could not initialise shaders");
    }

    this.gl.useProgram(m_shaderprog);

    m_shaderprog.vertexPositionAttribute = this.gl.getAttribLocation(m_shaderprog, "aVertexPosition");
    this.gl.enableVertexAttribArray(m_shaderprog.vertexPositionAttribute);
    
    m_shaderprog.vertexNormalAttribute = this.gl.getAttribLocation(m_shaderprog, "aVertexNormal");
    this.gl.enableVertexAttribArray(m_shaderprog.vertexNormalAttribute);

    m_shaderprog.vertexAmbientAttribute = this.gl.getAttribLocation(m_shaderprog, "aVertexAmbient");
    this.gl.enableVertexAttribArray(m_shaderprog.vertexAmbientAttribute);        

    m_shaderprog.vertexDiffuseAttribute = this.gl.getAttribLocation(m_shaderprog, "aVertexDiffuse");
    this.gl.enableVertexAttribArray(m_shaderprog.vertexDiffuseAttribute);        

    m_shaderprog.lightAmbient = this.gl.getUniformLocation(m_shaderprog, "uLightAmbient");
    m_shaderprog.lightDiffuse = this.gl.getUniformLocation(m_shaderprog, "uLightDiffuse");
    m_shaderprog.lightDir = this.gl.getUniformLocation(m_shaderprog, "uLightDir");

    m_shaderprog.pMatrixUniform = this.gl.getUniformLocation(m_shaderprog, "uPMatrix");
    m_shaderprog.vMatrixUniform = this.gl.getUniformLocation(m_shaderprog, "uVMatrix");
    m_shaderprog.mvMatrixUniform = this.gl.getUniformLocation(m_shaderprog, "uMVMatrix");
    m_shaderprog.nMatrixUniform = this.gl.getUniformLocation(m_shaderprog, "uNMatrix"); // normal matrix
}

//--------------------------------------------------------------------------
MC.WebGLRenderer.prototype.initBuffers = function()
{
    // TODO: load meshes as resources
    
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

    var numTriangles = 0;
    for (var i in minus_mesh.faces)
    {
        var numIndices = minus_mesh.faces[i].indices.length;
        var normal = minus_mesh.normals[i]; // vertices normals = faces normals... Ajax3d doesn't compute vertices normals, thus flat shading
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
    this.triangleVertexPositionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangleVertexPositionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    this.triangleVertexPositionBuffer.itemSize = 3;
    this.triangleVertexPositionBuffer.numItems = numTriangles*3;

    // vertices normals = faces normals... Ajax3d doesn't compute vertices normals, thus flat shading
    this.triangleVertexNormalBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangleVertexNormalBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);
    this.triangleVertexNormalBuffer.itemSize = 3;
    this.triangleVertexNormalBuffer.numItems = numTriangles*3;

    // ambient
    this.triangleVertexAmbientBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangleVertexAmbientBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(ambients), this.gl.STATIC_DRAW);
    this.triangleVertexAmbientBuffer.itemSize = 4;
    this.triangleVertexAmbientBuffer.numItems = numTriangles*3;

    // diffuse
    this.triangleVertexDiffuseBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangleVertexDiffuseBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(diffuses), this.gl.STATIC_DRAW);
    this.triangleVertexDiffuseBuffer.itemSize = 4;
    this.triangleVertexDiffuseBuffer.numItems = numTriangles*3;
}

//--------------------------------------------------------------------------
MC.WebGLRenderer.prototype.setUniforms = function()
{
    // matrices
    this.gl.uniformMatrix4fv(m_shaderprog.pMatrixUniform, false, this.pMatrix);
    this.gl.uniformMatrix4fv(m_shaderprog.vMatrixUniform, false, this.vMatrix);
    this.gl.uniformMatrix4fv(m_shaderprog.mvMatrixUniform, false, this.mvMatrix);
    this.gl.uniformMatrix3fv(m_shaderprog.nMatrixUniform, false, this.nMatrix);

    // light
    this.gl.uniform4fv(m_shaderprog.lightAmbient, this.lightAmbient);
    this.gl.uniform4fv(m_shaderprog.lightDiffuse, this.lightDiffuse);
    this.gl.uniform3fv(m_shaderprog.lightDir, this.lightDir);
}

//--------------------------------------------------------------------------
// TODO: upper level
MC.WebGLRenderer.prototype.mvPushMatrix = function()
{
    var copy = mat4.create();
    mat4.set(this.mvMatrix, copy);
    this.mvMatrixStack.push(copy);
}
MC.WebGLRenderer.prototype.mvPopMatrix = function()
{
    if (this.mvMatrixStack.length == 0)
    {
        throw "Invalid popMatrix!";
    }
    this.mvMatrix = this.mvMatrixStack.pop();
}

//--------------------------------------------------------------------------
MC.WebGLRenderer.prototype.clear = function(color)
{
    this.parent.prototype.clear.call(this);
    
    this.gl.clearColor(color[0], color[1], color[2], color[3]);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
}    

//--------------------------------------------------------------------------
MC.WebGLRenderer.prototype.begin = function()
{
    this.parent.prototype.begin.call(this);
    
    this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
    
    mat4.perspective(45, this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 100.0, this.pMatrix);

    // that's the view matrix
    mat4.identity(this.vMatrix);
    mat4.translate(this.vMatrix, [0.0, 0.0, -8.0]);
    //mat4.rotate(vMatrix, 0.5, [1, 0, 0]);
    //mat4.rotate(vMatrix, 0.5, [0, 1, 0]);

    mat4.set(this.vMatrix, this.mvMatrix);
    //log("mvMatrix:" + mvMatrix);
    //mat4.translate(mvMatrix, [0.0, 0.0, -8.0]);
    //mvMatrix = vMatrix;
}

//--------------------------------------------------------------------------
MC.WebGLRenderer.prototype.drawElement = function(_matrix, _group)
{
    this.parent.prototype.drawElement.call(this);

    this.mvPushMatrix();

    // that's the model-view matrix / model position in eye space
    //mat4.rotate(mvMatrix, degToRad(rotx), [1, 0, 0]);
    //mat4.rotate(mvMatrix, degToRad(roty), [0, 1, 0]);
    
    mat4.multiply(this.mvMatrix, _matrix);

    // http://arcsynthesis.org/gltut/Illumination/Tut09%20Normal%20Transformation.html
    mat4.toInverseMat3(this.mvMatrix, this.nMatrix);
    mat3.transpose(this.nMatrix);
    
    this.setUniforms(this.gl);
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangleVertexPositionBuffer);
    this.gl.vertexAttribPointer(m_shaderprog.vertexPositionAttribute, this.triangleVertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangleVertexNormalBuffer);
    this.gl.vertexAttribPointer(m_shaderprog.vertexNormalAttribute, this.triangleVertexNormalBuffer.itemSize, this.gl.FLOAT, false, 0, 0);        
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangleVertexAmbientBuffer);
    this.gl.vertexAttribPointer(m_shaderprog.vertexAmbientAttribute, this.triangleVertexAmbientBuffer.itemSize, this.gl.FLOAT, false, 0, 0);        
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangleVertexDiffuseBuffer);
    this.gl.vertexAttribPointer(m_shaderprog.vertexDiffuseAttribute, this.triangleVertexDiffuseBuffer.itemSize, this.gl.FLOAT, false, 0, 0);        

    
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.triangleVertexPositionBuffer.numItems);
    
    this.mvPopMatrix();
}

//--------------------------------------------------------------------------
MC.WebGLRenderer.prototype.end = function()
{
    this.parent.prototype.end.call(this);

    // TODO check this.gl.flush etc.?
}
