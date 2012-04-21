/*
 * adt.js - Algebraic Data Types for JavaScript
 * adt.js is free, public domain software (http://creativecommons.org/publicdomain/zero/1.0/)
 * Originally created by Rehno Lindeque of http://www.mischievousmeerkat.com
 */
var adt = (function() {
"use strict";
  // Define a local copy of adt
  var 
    init = function(selfProto, args) {
      var i, key;
      for (i = 0; i < args.length; ++i) {
        var a = args[i];
        if (Array.isArray(a))
          init(selfProto, a);
        else if (typeof(a) === 'string' || typeof(a) === 'number')
          selfProto[a] = makeConstructor(a);
        else if (typeof(a) === 'object')
          for (key in a)
            if (typeof(a[key]) === 'function')
              //selfProto[key] = function(){ a[key].apply(self, arguments); };
              selfProto[key] = a[key];
            else
              continue; // TODO: WARNING: expected function values in dispatch table
        else
          continue; // TODO: WARNING: unidentified argument passed to adt
      }
    },
    adt = function() {
      // Arguments to this function can be either constructor names (strings or 
      // arrays of strings, numbers or arrays of numbers) or evaluators (dispatch tables or arrays of dispatch
      // tables with keys as deconstructors and values as dispatch functions)
      var selfProto = {};
      init(selfProto, arguments);
      return evaluator(selfProto);
    },
    makeConstructor = function(identifier) { 
      return function() { 
        // TODO: extend the array with a toString function and adt type identifier
        return [identifier].concat([].slice.call(arguments, 0));
      }; 
    };
  // ADT evaluator api
  var 
    evaluator = function(selfProto) {
      var 
        key,
        evaluator = function(){
          return evaluator.eval.apply(self, arguments);
        },
        self = Object.create(selfProto);

      evaluator.eval = function(data) { 
        // Determine if the data is a type name (a data type constructor name)
        if (typeof data === 'string' || typeof data === 'number') {
          // TODO (version 2): perform pattern matching
          //       E.g. split the data around whitespace and in order of specific to general...
          if (typeof evaluator[data] === 'function')
            return evaluator[data].apply(self, [].slice.call(arguments, 1));
          else
            return evaluator['_'].apply(self, arguments);
        }
        // Determine if the data is a construction (built by a constructor)
        if (Array.isArray(data) && data.length > 0) {
          // Evaluate sub-trees
          var
            result = new Array(data.length),
            key = '',
            i;
          for (i = 1; i < data.length; ++i) {
            var subResult = evaluator.eval(data[i]);
            if (Array.isArray(subResult))
              if (subResult.length > 0 && (typeof subResult[0] === 'string' || typeof subResult[0] === 'number'))
                key = key.concat(' '.concat(subResult[0]));
            else
              key = key.concat(' '.concat(typeof subResult));
            result[i] = subResult;
          }
          // TODO (version 2): for pattern matching
          //result[0] = key;
          result[0] = data[0];
          return evaluator.eval.apply(self, result);
        }
        return data;
      };

      /* TODO (version 2/3)?
      // Iterate over an array of values (while carrying state, like a finite state machine)
      // Similar to a haskell enumerator + iteratee with "map" as the enumerator and "iteratee" as the iteratee carying state
      evaluator.mapIteratee = function() { console.log("mapIterate", arguments); return 0; };

      // Similar to a haskell enumerator + iteratee with "fold" as the enumerator and "iteratee" as the iteratee carying state
      evaluator.foldIteratee = function() { console.log("iterate", arguments); return 0; };
      */

      // Add adt constructors / methods to the evaluator
      for (key in selfProto)
        if (key !== 'eval') {
          if (typeof selfProto[key] === 'function')
            // Custom evaluator
            evaluator[key] = (function(key){ return function(){ return selfProto[key].apply(self, arguments); }; })(key);
          else 
            // Constant constructor (return the constant value)
            evaluator[key] = (function(key){ return function(){ return selfProto[key]; }; })(key);
        }
        // TODO: else
        //   Warning? trying to overide standard functions
      // Create an identity constructor for the default constructor if none was supplied
      if (typeof selfProto['_'] === 'undefined') {
        selfProto['_'] = function(data){ return data; };
        evaluator['_'] = function(){ return selfProto['_'].apply(self, arguments); }
      }
      
      return evaluator;
    };

  adt.constructors = function(obj) {
    var key, keys = [];
    if (obj != null)
      for (key in obj)
        keys.push(key);
    return adt.apply(null, keys);
  };

  /*adt.fn.parser = adt({
    '(': function() { console.log('('); },
    ')': function() { console.log(')'); },
    '[': function() { console.log('['); },
    ',': function() { console.log(','); },
    ']': function() { console.log(']'); },
    '_': function() {}
  });*/

  // Export adt to a CommonJS module if exports is available
  if (typeof(exports) !== "undefined" && exports !== null)
    exports.adt = adt;
  return adt;
})();

