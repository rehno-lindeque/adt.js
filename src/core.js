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
