  adt.recursive = function(f) {
    return function(tag) {
      if (typeof f === "function") {
        var args = [];
        for (var i = 1; i < arguments.length; ++i)
          f(args[i])
        return f.apply(f,args); 
      }
    };
  };