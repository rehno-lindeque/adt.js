  adt.recursive = function(f) {
    if (typeof f !== 'function')
      throw "Expected a function or ADT interface in adt.recursive"
    var self = isInterface(f)? f : adt({_: f});

    var recurse = function (data) {
        var i, results = [], subResult;
        if (!isADT(data)) {
          return self(data);
        }
        for (i = 0; i < data.length; ++i) {
          subResult = recurse(data[i]);
          //if (typeof subResult !== 'undefined')
          results.push(subResult);
        }
        // TODO: Take into account pattern matching requirements...
        return self(construct(data._tag, results));
    };
    // Assign all the methods in the interface to the recursive interface too
    // TODO: But shouldn't these methods also run recursively?
    for (var key in self)
      recurse[key] = self[key];
    return recurse;
  };
