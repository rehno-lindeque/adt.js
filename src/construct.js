  adt.construct = function(id) {
    if (arguments.length < 1)
      throw "Incorrect number of arguments passed to `construct()`."
    // (make sure the identifier is a string not a number to call the correct Array constructor)
    var data = [String(id)].concat([].slice.call(arguments, 1));
    data._ADTData = true;
    return data;
  };

