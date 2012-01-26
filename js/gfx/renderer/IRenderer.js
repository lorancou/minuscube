/*
 * IRenderer.js
 * ----------
 *
 * Minus Cube
 * Copyright (c) 2008-2012 Laurent Couvidou
 * Contact : lorancou@free.fr
 *
 * This program is free software - see README for details.
 */

//------------------------------------------------------------------------------
// The renderers base class
MC.IRenderer = function(_canvas, _context)
{
    this.canvas = _canvas;
    this.context = _context;
}

//--------------------------------------------------------------------------
MC.IRenderer.prototype.turnOn = function()
{
    this.canvas.style.visibility = "visible";
}
    
//--------------------------------------------------------------------------
MC.IRenderer.prototype.turnOff = function()
{
    this.canvas.style.visibility = "hidden";
}

//--------------------------------------------------------------------------
MC.IRenderer.prototype.clear = function(color)
{
}

//--------------------------------------------------------------------------
MC.IRenderer.prototype.begin = function()
{
}

//--------------------------------------------------------------------------
MC.IRenderer.prototype.drawElement = function(_matrix, _group)
{
}

//--------------------------------------------------------------------------
MC.IRenderer.prototype.end = function()
{
}
