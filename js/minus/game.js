/*
 * game.js
 * ----------
 *
 * Minus Cube
 * Copyright (c) 2008-2012 Laurent Couvidou
 * Contact : lorancou@free.fr
 *
 * This program is free software - see README for details.
 */

function minus_game()
{
    var ROT_STEP = PI/30;
    var BACKGROUND_COLOR = "#fefefe";

    this.light = null;
    this.sort = null;
    this.camera = null;
    this.cube = null;
    this.update_needed = true;

    this.noinputtimer = 0.0;
    this.noinputspeed = 0.0;
    this.noinputrandx = 0.0;
    this.noinputrandy = 0.0;
    
	//--------------------------------------------------------------------------
    this.init = function()
    {
		// TODO: remove this in Pokki distrib
        this.light = new ajax3d_light( ajax3d_vector_normalize( [-0.33, 0.0, -0.66, 0.0] ) );
        this.sort = new ajax3d_sort( 64, 200, 8 );
		
        this.camera = new minus_camera();
        this.cube = new minus_cube();
        minus_input_init();
    }
    
	//--------------------------------------------------------------------------
    this.frame = function( time_step )
    {
        // Controls
        if ( minus_input_rmb_pressed )
        {
            this.sort.pick_group = true;
            this.noinputtimer = 0.0;
        }
        else if ( minus_input_left_pressed )
        {
            this.cube.rotdy = ROT_STEP;
            this.noinputtimer = 0.0;
        }
        else if ( minus_input_up_pressed )
        {
            this.cube.rotdx = -ROT_STEP;
            this.noinputtimer = 0.0;
        }
        else if ( minus_input_right_pressed )
        {
            this.cube.rotdy = -ROT_STEP;
            this.noinputtimer = 0.0;
        }
        else if ( minus_input_down_pressed )
        {
            this.cube.rotdx = ROT_STEP;
            this.noinputtimer = 0.0;
        }
        else if ( minus_input_lmb_pressed ) //&& minus_input_prev_valid )
        {
            this.cube.rotdx = minus_input_dy / 100.0;
            this.cube.rotdy = - minus_input_dx / 100.0;
            this.noinputtimer = 0.0;
        }
        else
        {
            minus_input_dx = 0;            
            minus_input_dy = 0;

            this.noinputtimer += time_step;
            if (this.noinputtimer < 10000.0 )
            {
				// in release, update and draw only when necessary
                if (!this.update_needed && !g_dbg)
				{
					return;
				}
                this.update_needed = false;
            }
            else if (this.noinputtimer < 15000.0)
            {
                if (!this.update_needed)
                {
                    log("no input for 10s, start moving a bit");
                    this.noinputrandx = Math.random() - 0.5;
                    this.noinputrandy = Math.random() - 0.5;
                }
                this.update_needed = true;
                if (this.noinputspeed < 0.01)
                {
                    this.noinputspeed += time_step * 0.000001;
                    if (this.noinputspeed > 0.01)
                    {
                        log("full speed");
                        this.noinputspeed = 0.01;
                    }
                }
                this.cube.rotdx = this.noinputspeed * this.noinputrandx;
                this.cube.rotdy = this.noinputspeed * this.noinputrandy;
            }
            else
            {
                if (this.noinputspeed > 0.0)
                {
                    this.noinputspeed -= time_step * 0.000001;
                    if (this.noinputspeed < 0.0)
                    {
                        log("stop moving");
                        this.noinputspeed = 0.0;
                        this.noinputtimer = 0.0;
                        this.update_needed = false;
                    }
                }
                this.cube.rotdx = this.noinputspeed * this.noinputrandx;
                this.cube.rotdy = this.noinputspeed * this.noinputrandy;
            }
        }
        
        // Camera
        this.camera.frame( time_step );
        this.light.eye = this.camera.position();
        
        // Gameplay
        this.cube.frame( time_step );
        
        // draw - Ajax3d
		if (!g_usegl)
		{
			g_2dctx.fillStyle = BACKGROUND_COLOR;
			this.sort.clear(g_2dctx);
			this.sort.begin();
			this.cube.draw();
			this.sort.draw(g_2dctx);
		}
        // draw - WebGL
		else
		{
            drawScene(g_glctx);
		}

        // Picking
        if ( this.sort.pick_group )
        {
            if ( this.sort.picked_group != -1 )
            {
                this.cube.interact( this.sort.picked_group );
                this.update_needed = true;
            }
            minus_input_rmb_pressed = false; // hack
            this.sort.pick_group = false;
        }

        this.cube.store_rotation();
        minus_input_dx = 0;            
        minus_input_dy = 0;
    }
}