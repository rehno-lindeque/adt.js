  adt.recursive = function(f) {
    var recurse = function (data) {
        var i, results = [], subResult;
        if (!isADT(data))
          return f(data);
        for (i = 0; i < data.length; ++i) {
          subResult = recurse(data[i]);
          //if (typeof subResult !== 'undefined')
          results.push(subResult);
        }
        // TODO: Take into account pattern matching requirements...
        return f(construct(data._tag, results));
    };
    // Assign all the methods in the interface to the recursive interface too
    // TODO: But shouldn't these methods also run recursively?
    for (var key in f)
      recurse[key] = f[key];
    return recurse;
  };
