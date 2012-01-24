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
    
    var done = false;

    this.draw = function( rotxy, rotxy_GL, group, position )
    {
        if (g_renderer == "Ajax3d")
        {
            var cam_mat = g_minus.camera.projection();
            //var cam_mat = g_minus.debugcam.projection(0, 0, -10, 0, 0);
            var trans_mat = ajax3d_matrix_translate( position[0], position[1], position[2] );

            var mesh_transformed = null;
            var mesh_projected = null;
            var mat = ajax3d_matrix_multiply( __rotxz_mat, trans_mat ); // element self rotation
            var mat2 = ajax3d_matrix_multiply( mat, rotxy ); // whole cube rotation

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
        else
        {
            var mat = mat4.create();
            mat4.identity(mat);
            mat4.translate(mat, position);
            mat4.multiply(mat, __rotxz_mat_GL); // element self rotation
            
            /*var rawmat = [];
            for (var i=0; i<4; ++i)
            {
                for (var j=0; j<4; ++j)
                {
                    rawmat[i+4*j] = rotxy[i][j];
                }
            }
            if (!done)
            {
                log(rawmat);
                //log(rotxy_GL);
                done = true;
            }
            var rotxy_GL = mat4.create();
            mat4.set(rawmat, rotxy_GL);*/
            //mat4.inverse(rotxy_GL);
            mat4.multiply(rotxy_GL, mat, mat); // whole cube rotation
            
            webgl_draw_element(g_glctx, mat);
        }
    }

    // .. private
    
    var __this = this;
    var __type = type;
    var __rotxz_mat;
    var __rotxz_mat_GL = mat4.create();

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
    
        mat4.identity(__rotxz_mat_GL);
        mat4.rotate(__rotxz_mat_GL, rotz, [0, 0, 1]);
        mat4.rotate(__rotxz_mat_GL, rotx, [1, 0, 0]);
    }

    __construct();
}