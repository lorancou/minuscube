/*
   Ajax3d - a 3d engine using the WHATWG HTML <canvas> tag.
   
   Copyright (C) 2007 Eben Upton
   
   This program is free software; you can redistribute it and/or
   modify it under the terms of version 2 of the GNU General Public 
   License as published by the Free Software Foundation.
   
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with this program; if not, write to the Free Software
   Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

function ajax3d_model_make_normals(model)
{
   model.normals = new Array(model.faces.length);
   model.normals_ccw = new Array(model.faces.length);
   
   for (var i = 0; i < model.faces.length; i++) {
       
      //var v1 = ajax3d_vector_subtract(model.vertices[0][model.faces[i].indices[1]], model.vertices[0][model.faces[i].indices[0]]);
      //var v2 = ajax3d_vector_subtract(model.vertices[0][model.faces[i].indices[2]], model.vertices[0][model.faces[i].indices[0]]);
       
       var v1 = vec3.create();
       vec3.subtract(model.vertices[0][model.faces[i].indices[1]], model.vertices[0][model.faces[i].indices[0]], v1);
       var v2 = vec3.create();
       vec3.subtract(model.vertices[0][model.faces[i].indices[2]], model.vertices[0][model.faces[i].indices[0]], v2);

      // CW for Ajax3d
      //model.normals[i] = ajax3d_vector_normalize(ajax3d_vector_cross(v1, v2));

      // CCW for WebGL
      //model.normals_ccw[i] = ajax3d_vector_normalize(ajax3d_vector_cross(v2, v1));
       
       var normal = vec3.create();
       vec3.cross(v2, v1, normal);
       vec3.normalize(normal);
       model.normals[i] = normal;

      model.faces[i].normal = i;
   }
}

function ajax3d_model_make_centers(model)
{
   model.centers = new Array(model.faces.length);

   for (var i = 0; i < model.faces.length; i++)
   {
      //var center = [0, 0, 0, 0];
      var center = vec3.create([0, 0, 0, 0]);

      for (var j = 0; j < model.faces[i].indices.length; j++)
      {
         //center = ajax3d_vector_add(center, model.vertices[0][model.faces[i].indices[j]]);
          vec3.add(center, model.vertices[0][model.faces[i].indices[j]], center);
      }

      //model.centers[i] = ajax3d_vector_multiply(center, 1.0 / model.faces[i].indices.length);
      model.centers[i] = vec3.create();
      vec3.multiply(center, 1.0 / model.faces[i].indices.length, center);
      
      model.faces[i].center = i;
   }
}

function ajax3d_model_multiply(model, matrix, mprime)
{
   if (mprime == null)
      mprime = {vertices: []};

   mprime.normals = model.normals;
   mprime.centers = model.centers;
   mprime.faces = model.faces;
   mprime.bias = model.bias;
                 
   for (var i = 0; i < model.vertices.length; i++) {
      if (mprime.vertices[i] == null || mprime.vertices[i].length < model.vertices[i].length)
         mprime.vertices[i] = ajax3d_util_make2darray(model.vertices[i].length, 4);
         
      //ajax3d_matrix_multiply(model.vertices[i], matrix, mprime.vertices[i]);
      for (var j=0; j<model.vertices[i].length; ++j)
      {
        var point = [model.vertices[i][j][0], model.vertices[i][j][1], model.vertices[i][j][2], 1.0];
        mat4.multiplyVec4(matrix, point);
        var screenX = point[0] / point[3];
        screenX = g_2dcanvas.width * (screenX + 1.0) / 2.0;
        var screenY = point[1] / point[3];
        screenY = g_2dcanvas.height * (1.0 - ((screenY + 1.0) / 2.0));
        
        var dehomoZ = point[2] / point[3];

        // var centeringMatrix = mat4.identity();
        // mat4.translate(centeringMatrix, [0.5, 0.5, 0.0]);
        // mat4.multiplyVec4(centeringMatrix, point);

        // var scalingMatrix = mat4.identity();
        // mat4.scale(scalingMatrix, [g_2dcanvas.width, g_2dcanvas.height, 1 ]);
        // mat4.multiplyVec4(scalingMatrix, point);
        
        mprime.vertices[i][j] = vec3.create([screenX, screenY, dehomoZ]);
      }
   }
                 
   return mprime;
}                                    

function ajax3d_model_dehomogenize(model, mprime)
{
   if (mprime == null)
      mprime = {vertices: []};

   mprime.normals = model.normals;
   mprime.centers = model.centers;
   mprime.faces = model.faces;
   mprime.bias = model.bias;

   for (var i = 0; i < model.vertices.length; i++) {
      if (mprime.vertices[i] == null || mprime.vertices[i].length < model.vertices[i].length)
         mprime.vertices[i] = ajax3d_util_make2darray(model.vertices[i].length, 4);
      
      //ajax3d_matrix_dehomogenize(model.vertices[i], mprime.vertices[i]);
      for (var j=0; j<model.vertices[i].length; ++j)
      {
         mprime.vertices[i][j] = vec3.create(model.vertices[i][j]);
      }
   }
                 
   return mprime;
}