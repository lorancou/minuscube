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

    this.draw = function( rotxy, group, position )
    {
        //var cam_mat = g_minus.camera.projection();
        var cam_mat = mat4.create();
        mat4.multiply(vMatrix, pMatrix, cam_mat);
        
        var mat = mat4.create();
        mat4.identity(mat);
        mat4.translate(mat, position);
        //mat4.multiply(mat, __rotxz_mat); // element self rotation
        mat4.multiply(rotxy, mat, mat); // whole cube rotation
        
        if (g_renderer == "Ajax3d")
        {
            var mesh_transformed = null;
            var mesh_projected = null;

            /*var cam_mat = g_minus.camera.projection();
            //var cam_mat = g_minus.debugcam.projection(0, 0, -10, 0, 0);
            var trans_mat = ajax3d_matrix_translate( position[0], position[1], position[2] );
            //var trans_mat = ajax3d_matrix_identity();

            //var mat = ajax3d_matrix_multiply( __rotxz_mat, trans_mat ); // element self rotation
            var mat = trans_mat;
            var mat2 = ajax3d_matrix_multiply( mat, rotxy ); // whole cube rotation
            //var mat2 = ajax3d_matrix_multiply( trans_mat, rotxy ); // whole cube rotation*/

            g_minus.light.light_model( minus_mesh, mat );

            //var mat2 = mat4.create();
            //mat4.multiply(mat, cam_mat, mat2);
            
            var modelMatrix = mat4.create(mat);

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

            
            var point = [1.0, 1.0, 1.0, 1.0];
            mat4.multiplyVec4(modelMatrix, point);
            mat4.multiplyVec4(viewMatrix, point);
            mat4.multiplyVec4(projMatrix, point);
            //mat4.multiplyVec3(centeringMatrix, point);
            //mat4.multiplyVec3(scalingMatrix, point);
            point[0] /= point[3];
            point[1] /= point[3];

            var point2 = [1.0, 1.0, 1.0, 1.0];
            mat4.multiplyVec4(mvpMatrix, point2);
            point2[0] /= point2[3];
            point2[1] /= point2[3];

            mesh_transformed = ajax3d_model_multiply( 
                minus_mesh,
                mvpMatrix,
                mesh_transformed // API!!!
            );
        
            /*mesh_projected =ajax3d_model_dehomogenize(
                mesh_transformed,
                mesh_projected
            );*/

            g_minus.sort.add_model( mesh_transformed, group );
        }
        else
        {
            // var mat = mat4.create();
            // mat4.identity(mat);
            // mat4.translate(mat, position);
            // mat4.multiply(mat, __rotxz_mat_GL); // element self rotation
            // mat4.multiply(rotxy_GL, mat, mat); // whole cube rotation
            
            webgl_draw_element(g_glctx, mat);
        }
    }

    // .. private
    
    var __this = this;
    var __type = type;
    //var __rotxz_mat;
    var __rotxz_mat = mat4.create();

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

        // __rotxz_mat = ajax3d_matrix_multiply(
            // ajax3d_matrix_rotate_x( rotx ),
            // ajax3d_matrix_rotate_z( rotz )
        // );
    
        mat4.identity(__rotxz_mat);
        mat4.rotate(__rotxz_mat, rotz, [0, 0, 1]);
        mat4.rotate(__rotxz_mat, rotx, [1, 0, 0]);
    }

    __construct();
}