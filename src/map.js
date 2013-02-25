  var applyWith = function(f){ return function(a){ return f(a) }; };
  adt.map = function(fadt, data){ return data.map(applyWith(fadt)); };
