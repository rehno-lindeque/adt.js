/*
 * adt.js - Algebraic Data Types for JavaScript
 * adt.js is free, public domain software (http://creativecommons.org/publicdomain/zero/1.0/)
 * Originally created by Rehno Lindeque of http://www.mischievousmeerkat.com
 */


var ADT = new (function() {
"use strict";

var ADT = this != null? this : window;
(function(){

(function() {
  var 
    // Eval an ADT in Array representation
    _evalArrayRep = function() {
    };
  ADT.eval = function(adt, f) {
    // TODO
  };
  ADT.parse = function(text) {
    // TODO
  };
  ADT.constructors = function() {
    var
      constructorNames = arguments,
      makeConstructor = function(key) { return function() { [key].concat(arguments); }; },
      adtConstructors = {},
      i;
    // Create ADT constructors
    for (i = 0; i < constructorNames.length; ++i) {    
      var name = constructorNames[i];
      adtConstructors[name] = makeConstructor(name);
    }
    return adtConstructors;
  };
})();


})();


return ADT;

})();

