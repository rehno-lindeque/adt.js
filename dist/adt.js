/*
 * adt.js - Algebraic Data Types for JavaScript
 * adt.js is free, public domain software (http://creativecommons.org/publicdomain/zero/1.0/)
 * Originally created by Rehno Lindeque of http://www.mischievousmeerkat.com
 */
var adt = (function() {
"use strict";
  // Define a local copy of adt
  var 
    adt = function() {
      return adt.fn.init.apply(adt, arguments);
    },
    makeConstructor = function(identifier) { 
      return function() { 
        // TODO: extend the array with a toString function and adt type identifier
        [identifier].concat(arguments);
      }; 
    };
  // ADT constructor/evaluator api
  var evaluator = (function() {
    var 
      evaluator = function() {
        return evaluator.fn.eval.apply(evaluator, arguments);
      },
      init = function(adt) {
        evaluator.adt = adt;
        return evaluator;
      };
    
    evaluator.fn = evaluator.prototype = {
      eval: function(data) {
        if (typeof(data) === 'string' || typeof(data) === 'number') {
          if (typeof(adt[data]) === 'function')
            return adt[data].call(adt, data);
          else if (typeof(adt['_']) === 'function')
            return adt['_'].call(adt, data);
          else
            return data;
        }
        if (Array.isArray(data) && data.length > 0) {
          // Evaluate sub-trees
          var
            result = new Array(data.length),
            key = '',
            i;
          for (i = 1; i < data.length; ++i) {
            var subResult = evaluator.eval(data[i]);
            if (Array.isArray(subResult))
              if (subResult.length > 0 && (typeof(subResult[0]) === 'string' || typeof(subResult[0]) === 'number'))
                key = key.concat(' '.concat(subResult[0]));
            result[i] = subResult;
          }
          // TODO
          console.log(String(data[0]).concat(key));
          //return adt[data[0]].call(adt);
          return result;
        }
        return data;
      },
      iterate: function(list) {
        var 
          result = [], 
          i;
        // TODO
        return result;
      }
    }
    return init;
  })();

  adt.fn = adt.prototype = {
    init: function() {
      // Arguments to this function can be either constructor names (strings or 
      // arrays of strings, numbers or arrays of numbers) or evaluators (dispatch tables or arrays of dispatch
      // tables with keys as deconstructors and values as dispatch functions)
      var i, key;
      for (i = 0; i < arguments.length; ++i) {
        var a = arguments[i];
        if (Array.isArray(a))
          this.init.apply(this, a);
        else if (typeof(a) === 'string' || typeof(a) === 'number')
          this[a] = makeConstructor(a);
        else if (typeof(a) === 'object')
          for (key in a)
            if (typeof(a[key]) === 'function')
              this[key] = a[key];
            else
              continue; // TODO: WARNING: expected function values in dispatch table
        else
          continue; // TODO: WARNING: unidentified argument passed to adt
      }
      return function() { this.eval.apply(this, arguments); };
    },
  };

  adt.fn.parser = adt({
    '(': function() { console.log('('); },
    ')': function() { console.log(')'); },
    '[': function() { console.log('['); },
    ',': function() { console.log(','); },
    ']': function() { console.log(']'); },
    '_': function() {}
  });

  // Export adt to a CommonJS module if exports is available
  if (typeof(exports) !== "undefined" && exports !== null)
    exports.adt = adt;
  return adt;
})();

