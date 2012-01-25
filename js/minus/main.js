/*
 * main.js
 * ----------
 *
 * Minus Cube
 * Copyright (c) 2008-2012 Laurent Couvidou
 * Contact : lorancou@free.fr
 *
 * This program is free software - see README for details.
 */

// init params
var g_dbg = false;
var g_root = "";
 
// 2D + WebGL canvas and context
// NB: seems that having both context with one canvas isn't supported
var g_2dcanvas = null;
var g_2dctx = null;
var g_glcanvas = null;
var g_glctx = null;
var g_renderer = null;

// for stats
var main_time_step = 0.0;
var main_time = new Date().getTime();
var main_last_time = new Date().getTime();
var main_tick = 0;
var main_fps = [];

// the game object
var g_minus = null;

//------------------------------------------------------------------------------
function main_use_ajax3d()
{
    if (g_renderer == "Ajax3d")
    {
        log("already rendering with Ajax3d");
        return;
    }
	g_renderer = "Ajax3d";

	if (g_minus) g_minus.update_needed = true;
    if (g_2dcanvas) g_2dcanvas.style.visibility='visible';
    if (g_glcanvas) g_glcanvas.style.visibility='hidden';
    log("rendering with Ajax3d (2D canvas context)");
}

//------------------------------------------------------------------------------
function main_use_webgl()
{
	if (!g_glctx)
	{
		log("ERROR: can't use WebGL");
		return;
	}

    if (g_renderer == "WebGL")
    {
        log("already rendering with WebGL");
        return;
    }
	g_renderer = "WebGL";
    
    if (g_minus) g_minus.update_needed = true;
    if (g_2dcanvas) g_2dcanvas.style.visibility='hidden';
    if (g_glcanvas) g_glcanvas.style.visibility='visible';
    log("rendering with WebGL");
}

//------------------------------------------------------------------------------
function main_init(dbg, root)
{
    log( "initializing..." );
	
	// activate debug stuff
	if (dbg)
	{
		log("debug features on");
		g_dbg = true;
	}

	// set root
	if (root)
	{
		log("using root: " + root);
		g_root = root;
	}

    // try to get 2D context
    g_2dcanvas = document.getElementById("2dcanvas");
    if (!g_2dcanvas)
    {
        log("ERROR: missing 2D canvas element");
        return;
    }
	g_2dctx = g_2dcanvas.getContext('2d');
	if (!g_2dctx)
	{
		log("ERROR: can't initialize 2D context");
		return;
	}

    // try to get WebGL context
    // http://www.khronos.org/webgl/wiki/FAQ#What_is_the_recommended_way_to_initialize_WebGL.3F
    g_glcanvas = document.getElementById("glcanvas");
    if (!g_glcanvas)
    {
        log("WARNING: missing WebGL canvas element");
    }
    else if (!window.WebGLRenderingContext)
    {
        log("WARNING: WebGL not supported");
        // the browser doesn't even know what WebGL is
        //window.location = "http://get.webgl.org";
    }
	else if (g_glctx = g_glcanvas.getContext("webgl"))
	{
        log("WebGL supported");
		webgl_init(g_glcanvas, g_glctx);
	}
    else if (g_glctx = g_glcanvas.getContext("experimental-webgl"))
    {
        log("WARNING: experimental WebGL support");
		webgl_init(g_glcanvas, g_glctx);
	}
	else
	{
		// browser supports WebGL but initialization failed.
		//window.location = "http://get.webgl.org/troubleshooting";
		log("WARNING: can't initialize WebGL context");
    }
	
	// choose renderer
    /*if (g_glctx)
    {
        main_use_webgl();
    }
    else*/
    {
        main_use_ajax3d();
    }
    
	// init game
    g_minus = new minus_game();
    g_minus.init();
    g_minus.frame( 0.0 );

    log( "done." );
    log( "starting game loop" );
    
    main_frame();
}

//------------------------------------------------------------------------------
function main_frame()
{
    if (g_dbg)
    {
        // in debug, run as fast as possible
        setTimeout('main_frame()', 0.0);
    }
    else
    {
        // in release, use the WebGL-recommended rendering loop
        // http://www.khronos.org/webgl/wiki/FAQ#What_is_the_recommended_way_to_implement_a_rendering_loop.3F
        requestAnimFrame(main_frame);
    }

    main_time = new Date().getTime();
    main_time_step = main_time - main_last_time;
    
    g_minus.frame( main_time_step );
    
    // Debug purpose
    main_stats();
    
    main_last_time = main_time;
    main_tick++;
}

//------------------------------------------------------------------------------
function main_stats()
{
    var cur_fps = 1000.0 / main_time_step;
    
    main_fps.push( cur_fps );
    if ( main_fps.length > 1000 )
    {
        main_fps.shift();
    }
    var avg_fps = 0.0;
    for ( var i = 0; i< main_fps.length; ++i )
    {
        avg_fps += main_fps[i];
    }
    avg_fps /= main_fps.length;
    
    cur_fps_string = cur_fps.toFixed(1);
    if ( cur_fps_string.length == 3 ) cur_fps_string = '&nbsp;' + cur_fps_string;
    var fps_span = document.getElementById("fps")
    if ( fps_span )
    {
        fps_span.innerHTML = cur_fps_string;
    }
    
    avg_fps_string = avg_fps.toFixed(1);
    if ( avg_fps_string.length == 3 ) avg_fps_string = '&nbsp;' + avg_fps_string;
    var avg_span = document.getElementById("avg")
    if ( avg_span )
    {
        avg_span.innerHTML = avg_fps_string;
    }
}
