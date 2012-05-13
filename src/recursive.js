  adt.recursive = function(f) {
    return function recurse (data) {
        var i, results = [data[0]], subResult;
        if (!isADTData(data))
          return f(data);
        for (i = 1; i < data.length; ++i) {
          subResult = recurse(data[i]);
          if (typeof subResult !== 'undefined')
            results.push(subResult);
        }
        // TODO: Take into account pattern matching requirements...
        return f(adt.construct.apply(null, results));
    };
  };
