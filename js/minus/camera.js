/*
 * element.js
 * ----------
 *
 * Minus Cube
 * Copyright (c) 2008-2012 Laurent Couvidou
 * Contact : lorancou@free.fr
 *
 * This program is free software - see README for details.
 */

function minus_camera()
{
    // .. public

    this.rotx = 0.0;
    this.roty = 0.0;
    this.dist = 8.0;

    this.frame = function( time_step )
    {
        __compute_matrices();
    }

    this.position = function()
    {
        return __position;
    }

    this.projection = function()
    {
        return __projection;
    }

    this.inv_projection = function()
    {
        return __inv_projection;
    }

    // .. private

    var __this = this;
    var __position = mat4.identity(); //ajax3d_matrix_identity();
    var __projection = mat4.identity(); //ajax3d_matrix_identity();
    var __inv_projection = mat4.identity(); //ajax3d_matrix_identity();

    var __compute_matrices = function()
    {
        // Camera position
        //var t1 = ajax3d_matrix_translate( 0.0, 0.0, __this.dist );
        var t1 = mat4.identity();
        mat4.translate(t1, vec3.create([0.0, 0.0, __this.dist]));
        
        // Debug rotations
        //var rx = ajax3d_matrix_rotate_x( __this.rotx );
        var rx = mat4.identity();
        mat4.rotateX(rx, __this.rotx);
        //var ry = ajax3d_matrix_rotate_y( __this.roty );
        var ry = mat4.identity();
        mat4.rotateX(ry, __this.roty);
        
        // Perspective projection
        //var p  = ajax3d_matrix_project( 10, 10, 5, 25 );
        var p = mat4.create();
        mat4.perspective(45, g_2dcanvas.width / g_2dcanvas.height, 0.1, 100.0, p);
        
        // Screen-space centering, depends on ratio
        //var tf = ajax3d_matrix_translate( 0.5, 0.5 * g_2dcanvas.height / g_2dcanvas.width, 0 );
        
        // Screen-space scaling to canvas pixel width
        //var s1 = ajax3d_matrix_scale( g_2dcanvas.width, g_2dcanvas.width, 1 );
        
        //var m = ajax3d_matrix_multiply( ry, rx );
        var m = mat4.create();
        mat4.multiply(ry, rx, m);
        
        //var n = ajax3d_matrix_multiply( m, t1 );
        var n = mat4.create();
        mat4.multiply(m, t1, n);
        
        //var p = ajax3d_matrix_multiply( n, p );
        var mvp = mat4.create();
        mat4.multiply(n, p, mvp);
        
        //var kl = ajax3d_matrix_multiply( p, tf );
        //var kr = ajax3d_matrix_multiply( kl, s1 );

        __position = n;
        __projection = mvp; //kr;
        mat4.inverse(mvp, __inv_projection); //ajax3d_matrix_invert_simple(kr);
    }

}