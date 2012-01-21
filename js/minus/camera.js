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
    var __position =ajax3d_matrix_identity();
    var __projection =ajax3d_matrix_identity();
    var __inv_projection =ajax3d_matrix_identity();

    var __compute_matrices = function()
    {
        // Camera position
        var t1 = ajax3d_matrix_translate( 0.0, 0.0, __this.dist );
        
        // Debug rotations
        var rx = ajax3d_matrix_rotate_x( __this.rotx );
        var ry = ajax3d_matrix_rotate_y( __this.roty );
        
        // Perspective projection
        var p  = ajax3d_matrix_project( 10, 10, 5, 25 );
        
        // Screen-space centering, depends on ratio
        var tf = ajax3d_matrix_translate( 0.5, 0.5 * g_2dcanvas.height / g_2dcanvas.width, 0 );
        
        // Screen-space scaling to canvas pixel width
        var s1 = ajax3d_matrix_scale( g_2dcanvas.width, g_2dcanvas.width, 1 );
        
        var m = ajax3d_matrix_multiply( ry, rx );
        var n = ajax3d_matrix_multiply( m, t1 );
        var p = ajax3d_matrix_multiply( n, p );
        var kl = ajax3d_matrix_multiply( p, tf );
        var kr = ajax3d_matrix_multiply( kl, s1 );

        __position = n;
        __projection = kr;
        __inv_projection = ajax3d_matrix_invert_simple(kr);
    }

}