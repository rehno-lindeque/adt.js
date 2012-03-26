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

