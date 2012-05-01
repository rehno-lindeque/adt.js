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
        else if (typeof(a) === 'object' || typeof(a) == 'function')
          for (key in a)
            if (typeof(a[key]) === 'function')
              selfProto[key] = a[key];
            else
              selfProto[key] = function() { return a[key]; }
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
        // (make sure the identifier is a string not a number to call the correct Array constructor)
        var data = [String(identifier)].concat([].slice.call(arguments, 0));
        data._ADTData = true;
        return data;
      }; 
    };
