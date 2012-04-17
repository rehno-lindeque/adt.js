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
