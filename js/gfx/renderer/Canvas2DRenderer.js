/*
 * Canvas2DRenderer.js
 * ----------
 *
 * Minus Cube
 * Copyright (c) 2008-2012 Laurent Couvidou
 * Contact : lorancou@free.fr
 *
 * Derived from:
 * Ajax3d - a 3d engine using the WHATWG HTML <canvas> tag.
 * Copyright (c) 2007-2012 Eben Upton
 * http://ajax3d.sourceforge.net/
 *
 * This program is free software - see README for details.
 */

function ajax3d_sort(buckets, cells, bounds)
{
    var cell_type_face     = 0;
    var cell_type_particle = 1;
    
    var bucket = new Array(buckets);
    
    var cell = ajax3d_util_makeobjectarray(cells);
    var bound = ajax3d_util_makeobjectarray(bounds);
    
    var pos;

    this.pick_group = false;
    this.picked_group = -1;
    
    this.clear = function(ctx)
    {
        for (var i = 0; i < bound.length; i++) {
            var b = bound[i];
            
            ctx.fillRect(b.xmin - 1, b.ymin - 1, b.xmax - b.xmin + 2, b.ymax - b.ymin + 2);
        }
    };
    
    this.begin = function()
    {
        for (var i = 0; i < bucket.length; i++)
        bucket[i] = null;
        
        for (var i = 0; i < bound.length; i++) {
            var b = bound[i];
            
            b.xmin = 2048;
            b.ymin = 2048;
            b.xmax = -2048;
            b.ymax = -2048;
        }
        
        pos = 0;
    };
    
    this.begin();
    
    function add_cell(z)
    {
        var b = Math.floor(z * bucket.length);
        
        if (b < 0)
        b = 0;
        if (b > bucket.length - 1)
        b = bucket.length - 1;
        
        if (pos == cell.length)
        cell.push(new Object());
        
        var c = cell[pos++];
        
        c.next = bucket[b];
        
        bucket[b] = c;
        
        return c;   
    }
    
    this.add_face = function(vertices, face, group, bias)
    {
        var vertices0 = vertices[0];
        var vertices1 = vertices[1];
        var thresh = vertices0.length;
        
        var zmin = 1.0;
        
        for (var i = 0; i < face.indices.length; i++) {
            var index = face.indices[i];
            var znew = index < thresh ? vertices0[index][2] : vertices1[index - thresh][2];
            
            if (znew < zmin)
            zmin = znew;
        }
        
        if (bias != null)
        zmin += bias;
        
        if (face.bias != null)
        zmin += face.bias;
        
        var c = add_cell(zmin);
        
        c.type = cell_type_face;
        c.vertices = vertices;
        c.face = face;
        c.color = face.color;
        c.group = group;
    };
    
    this.add_particle = function(vertex, color, size, group, bias)
    {
        var z = vertex[2];
        
        if (bias != null)
        z += bias;
        
        var c = add_cell(z);
        
        c.type = cell_type_particle;
        c.vertex = vertex;
        c.color = color;
        c.group = group;
        c.size = size;
    };
    
    this.add_model = function(model, group)
    {
        var vertices0 = model.vertices[0];
        var vertices1 = model.vertices[1];
        var thresh = vertices0.length;
        
        var length = model.faces.ajax3d_length;
        
        if (length == null)
        length = model.faces.length;
        
        for (var i = 0; i < length; i++) {
            var face = model.faces[i];
            
            if (face.cull != false) {  
                var i0 = face.indices[0];
                var i1 = face.indices[1];
                var i2 = face.indices[2];
                
                var v0;
                var v1;
                var v2;
                if (i0 < thresh)
                {
                    v0 = vertices0[i0]
                }
                else
                {
                    v0 = vertices1[i0 - thresh];
                }
                if (i1 < thresh)
                {
                    v1 = vertices0[i1]
                }
                else
                {
                    v1 = vertices1[i1 - thresh];
                }
                if (i2 < thresh)
                {
                    v2 = vertices0[i2]
                }
                else
                {
                    v2 = vertices1[i2 - thresh];
                }
                
                var determinant = (v1[0] - v0[0]) * (v2[1] - v0[1]) - (v2[0] - v0[0]) * (v1[1] - v0[1]);
                
                // back face culling
                 if (determinant > 0.0)
                     continue;
            }
            
            this.add_face(model.vertices, face, group, model.bias);
        }
    };
    
    this.draw = function(ctx)
    {
        this.picked_group = -1;

        for (var i = bucket.length - 1; i >= 0; i--)
        for (var c = bucket[i]; c != null; c = c.next) {
            ctx.fillStyle = c.color;
//            ctx.strokeStyle = c.color;
//            ctx.lineWidth = 1.5;
//            ctx.lineCap = 'round';
//            ctx.lineJoin = 'bevel';
                        
            if (c.type == cell_type_face)
            {
                ctx.beginPath();
                
                var vertices0 = c.vertices[0];
                var vertices1 = c.vertices[1];
                var thresh = vertices0.length;

                var b = bound[c.group];
                b.xmin = 100000;
                b.xmax = -100000;
                b.ymin = 100000;
                b.ymax = -100000;
                
                for (var k = 0; k < c.face.indices.length; k++) {
                    var index = c.face.indices[k];
                    
                    var x, y;
                    
                    if (index < thresh) {
                        x = vertices0[index][0];
                        y = vertices0[index][1];
                    } else {
                        x = vertices1[index - thresh][0];
                        y = vertices1[index - thresh][1];
                    }
                    
                    // x = g_2dcanvas.width * (x + 1.0) / 2.0
                    // y = g_2dcanvas.height * (1.0 - ((y + 1.0) / 2.0))
                    
                    if (this.log) {
                        log(k + ': ' + x + ", " + y + "<br>");
                    }

                    if (this.pick_group)
                    {
                        if (x < b.xmin)
                            b.xmin = x;
                        if (x > b.xmax)
                            b.xmax = x;
                        if (y < b.ymin)
                            b.ymin = y;
                        if (y > b.ymax)
                            b.ymax = y;
                    }
                    
                    if (k == 0)
                        ctx.moveTo(x, y);
                    else
                        ctx.lineTo(x, y);
                }

                if ( this.pick_group
                     && minus_input_pick_x > b.xmin
                     && minus_input_pick_x < b.xmax
                     && minus_input_pick_y > b.ymin
                     && minus_input_pick_y < b.ymax )
                {
                    this.picked_group = c.group;

//                     ctx.lineWidth = 3;
//                     ctx.strokeStyle = "green";
//                     ctx.stroke();
//                     ctx.strokeStyle = "";
                }
                
                ctx.fill();
            } else {
//                 var size = c.size;
                
//                 var x = c.vertex[0] - size / 2;
//                 var y = c.vertex[1] - size / 2;
                
//                 if (x < b.xmin)
//                 b.xmin = x;
//                 if (x + size - 1 > b.xmax)
//                 b.xmax = x + size - 1;
//                 if (y < b.ymin)
//                 b.ymin = y;
//                 if (y + size - 1 > b.ymax)
//                 b.ymax = y + size - 1;
                
//                 ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
            }
        }
    };
}

//------------------------------------------------------------------------------
// The 2D canvas context renderer
MC.Canvas2DRenderer = function(_canvas, _context)
{
    this.parent = MC.IRenderer;
    this.parent.call(this, _canvas, _context);
}
MC.Canvas2DRenderer.prototype = new MC.IRenderer();

//--------------------------------------------------------------------------
MC.Canvas2DRenderer.prototype.clear = function(color)
{
    this.parent.prototype.clear.call(this);
    
    // TODO: color class? from some lib?
    var csscolor = "rgba("
                 + Math.round(color[0]*256)
                 + ","
                 + Math.round(color[1]*256)
                 + ","
                 + Math.round(color[2]*256)
                 + ","
                 + color[3]
                 + ")";
    this.context.fillStyle = csscolor;
    g_minus.sort.clear(this.context); // spaghetti... sort needs to merge with this class anyway
}
    
//--------------------------------------------------------------------------
MC.Canvas2DRenderer.prototype.begin = function()
{
    this.parent.prototype.begin.call(this);

    g_minus.sort.begin(); // spaghetti
}

//--------------------------------------------------------------------------
MC.Canvas2DRenderer.prototype.drawElement = function(_matrix, _group)
{
    this.parent.prototype.drawElement.call(this, _matrix, _group);

    var mesh_transformed = null;

    g_minus.light.light_model( minus_mesh, _matrix ); // spaghetti

    //var mat2 = mat4.create();
    //mat4.multiply(matrix, cam_mat, mat2);
    
    var modelMatrix = mat4.create(_matrix);

    var viewMatrix = mat4.identity();
    mat4.translate(viewMatrix, [0.0, 0.0, -8.0]);

    var projMatrix = mat4.create();
    mat4.perspective(45, g_2dcanvas.width / g_2dcanvas.height, 0.1, 100.0, projMatrix);

    var mvpMatrix = mat4.identity();
    //mat4.multiply(mvpMatrix, scalingMatrix);
    mat4.multiply(modelMatrix, mvpMatrix, mvpMatrix);
    mat4.multiply(viewMatrix, mvpMatrix, mvpMatrix);
    mat4.multiply(projMatrix, mvpMatrix, mvpMatrix);
    //mat4.multiply(centeringMatrix, mvpMatrix, mvpMatrix);

    mesh_transformed = ajax3d_model_multiply( 
        minus_mesh,
        mvpMatrix,
        mesh_transformed // API!!!
    );

    g_minus.sort.add_model( mesh_transformed, _group ); // spaghetti
}

//--------------------------------------------------------------------------
MC.Canvas2DRenderer.prototype.end = function()
{
    this.parent.prototype.end.call(this);

    g_minus.sort.draw(this.context); // spaghetti
}
