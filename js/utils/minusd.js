/*
 * minusd.js
 * ----------
 *
 * Minus Cube
 * Copyright (c) 2008-2012 Laurent Couvidou
 * Contact : lorancou@free.fr
 *
 * This program is free software - see README for details.
 */

// http://stackoverflow.com/questions/950087/include-javascript-file-inside-javascript-file
function require(script) {
    $.ajax({
        url: script,
        dataType: "script",
        async: false,           // <-- this is the key
        success: function () {
            // all good...
        },
        error: function () {
            throw new Error("Could not load script " + script);
        }
    });
}

// load script list from file, and require them all
var jslist;
$.ajax({
    url: "jslist",
    dataType: "text",
    async: false,
    success: function (data) {
        jslist = data;
    },
    error: function () {
        throw new Error("Could not load jslist");
    }
});
var array = jslist.split("\n");
for (script in array)
{
    require(array[script]);
}
