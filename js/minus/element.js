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

function minus_element( type, id )
{
    // .. public
    
    this.id = id;
    this.slot = id;
    
    this.frame = function( time_step )
    {
    }

    this.draw = function( rotxy, group, position )
    {
        var cam_mat = g_minus.camera.projection(0, 0, -10, 0, 0);
        //var cam_mat = g_minus.debugcam.projection(0, 0, -10, 0, 0);
        var trans_mat = ajax3d_matrix_translate( position[0], position[1], position[2] );

        var mesh_transformed = null;
        var mesh_projected = null;
        var mat = ajax3d_matrix_multiply( __rotxz_mat, trans_mat );
        var mat2 = ajax3d_matrix_multiply( mat, rotxy );

        g_minus.light.light_model( minus_mesh, mat2 );

        mesh_transformed = ajax3d_model_multiply( 
            minus_mesh,
            ajax3d_matrix_multiply( mat2, cam_mat ),
            mesh_transformed // API!!!
        );
        mesh_projected =ajax3d_model_dehomogenize(
            mesh_transformed,
            mesh_projected
        );

        g_minus.sort.add_model( mesh_projected, group );
    }

    // .. private
    
    var __this = this;
    var __type = type;
    var __rotxz_mat;

    function __construct()
    {
        var rotx;
        var rotz;

        switch( __type )
        {
        case 0:
            rotx = 0.0;
            rotz = 0.0;
            break;
        case 1:
            rotx = 3.14;
            rotz = 0.0;
            break;
        case 2:
            rotx = -3.14/2;
            rotz = -3.14/2;
            break;
        default:
            rotx = 3.14/2;
            rotz = 3.14/2;
            break;
        }

        __rotxz_mat = ajax3d_matrix_multiply(
            ajax3d_matrix_rotate_x( rotx ),
            ajax3d_matrix_rotate_z( rotz )
        );
    }

    __construct();
}