  adt.recursive = function(f) {
    var recurse = function (data) {
        var i, results = [data[0]], subResult;
        if (!isADT(data))
          return f(data);
        for (i = 1; i < data.length; ++i) {
          subResult = recurse(data[i]);
          if (typeof subResult !== 'undefined')
            results.push(subResult);
        }
        // TODO: Take into account pattern matching requirements...
        return f(adt.construct.apply(null, results));
    };
    // Assign all the methods in the interface to the recursive interface too
    for (var key in f)
      recurse[key] = f[key];
    return recurse;
  };
