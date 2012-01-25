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

function ajax3d_light(dir)
{
	this.dir = vec3.create(dir);
	//this.eye = [0, 0, 0, 1];
	
	var dir_internal = vec3.create();
	//var eye_internal;

	//var work1 = [0, 0, 0, 0];
	//var work2 = [0, 0, 0, 0];
    
	this.transform = function(matrix) 
	{
		//var inverse = ajax3d_matrix_invert_simple(matrix);
        var inverse = mat4.create(matrix);
        mat4.inverse(inverse);
		
		//dir_internal = ajax3d_matrix_multiply([this.dir], inverse)[0];
        mat4.multiplyVec3(inverse, dir, dir_internal);
        
		//eye_internal = ajax3d_matrix_multiply([this.eye], inverse)[0];
	};
	
	this.light_face = function(normal, center, material)
	{
		if (material.static)
		{
			return material.static;
		}
		else
		{
			// Ambient component
			var r = material.ambient[0];
			var g = material.ambient[1];
			var b = material.ambient[2];
			
			// Diffuse component
			//var diff = ajax3d_vector_dot(normal, dir_internal);
            var cosine = vec3.dot(normal, dir_internal);

			if (cosine > 0)
			{
				r += material.diffuse[0] * cosine;
				g += material.diffuse[1] * cosine;
				b += material.diffuse[2] * cosine;
			}
			
			// Specular component
			/*if (normal != null && center != null)
			{
				var v1 = ajax3d_vector_subtract(center, eye_internal, work1);
				var dot = ajax3d_vector_dot(v1, normal);
				var v2 = ajax3d_vector_multiply(normal, -2 * dot, work2);
				var v3 = ajax3d_vector_add(v1, v2, work1);
				var v4 = ajax3d_vector_normalize(v3, work1);
				
				var spec = ajax3d_vector_dot(v4, dir_internal);
				
				if (spec > 0)
				{
					spec = Math.pow(spec, material.phong);
					
					r += material.specular[0] * spec;
					g += material.specular[1] * spec;
					b += material.specular[2] * spec;
				}
			}*/
			
			// Generate HTML color
			return ajax3d_util_rgbcolor(r * 256, g * 256, b * 256);
		}
	};

	this.light_model = function(model, matrix)   
	{
		this.transform(matrix);

		var length = model.faces.ajax3d_length;
		
		if (length == null)
			length = model.faces.length;
		
		for (var i = 0; i < length; i++) {
			var face = model.faces[i];
			
			face.color = this.light_face(model.normals[face.normal], model.centers[face.center], face.material);
		}
		
		return model;
	};
}
