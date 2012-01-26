/*
 * convention.js
 * ----------
 *
 * Minus Cube
 * Copyright (c) 2008-2012 Laurent Couvidou
 * Contact : lorancou@free.fr
 *
 * This program is free software - see README for details.
 */

//------------------------------------------------------------------------------
// Global stuff
MC.GLOBAL_CONST = "foo"; // no const keyword, we have to make that obvious
MC.globalObject = new MC.SomeClass;

//------------------------------------------------------------------------------
// Using Perspx's pattern for OOP:
// http://www.codeproject.com/Articles/28021/Introduction-to-Object-Oriented-JavaScript

//------------------------------------------------------------------------------
// Class constructor
MC.SomeClass = function(_ctorParam)
{
    // Class members, all public but shouldn't be access without a good reason
    // Unfortunately, no way to both make them both private and accessible from
    // the prototype methods: http://stackoverflow.com/questions/436120/
    this.classMember = _ctorParam;
    
    // Always initialize variables with null if there's nothing else to use:
    // http://www.gibdon.com/2006/05/javascript-difference-between-null-and.html
    this.otherClassMember = null;
}

//------------------------------------------------------------------------------
// Class method
MC.SomeClass.prototype.someMethod(_methodParam) = function()
{
    // do some stuff
    const SOME_LOCAL_CONST = 42;
    var someLocalVariable = 42;
    this.classMember = _methodParam + someLocalVariable + SOME_LOCAL_CONST;
}

//------------------------------------------------------------------------------
// Inheritance
MC.SomeOtherClass = function(_ctorParam)
{
    // remember parent, and call it's constructor
    this.parent = MC.SomeClass;
    this.parent.call(this, _ctorParam);
}
MC.SomeOtherClass.prototype = new MC.SomeClass(); // copy parent's prototype

//------------------------------------------------------------------------------
// Polymorphism
MC.SomeClass.prototype.someMethod(_methodParam) = function()
{
    // call parent's method
    this.parent.prototype.someMethod.call(this, _methodParam);
        
    // do some stuff
    var someLocalVariable = 666;
    this.class_member = someLocalVariable;
}
