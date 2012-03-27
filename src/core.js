  // Define a local copy of adt
  var 
    adt = function() {
      return adt.fn.init.apply(adt, arguments);
    },
    makeConstructor = function(identifier) { return function() { [identifier].concat(arguments); }; };
