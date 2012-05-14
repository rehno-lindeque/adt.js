  adt.construct = function(id) {
    if (arguments.length < 1)
      throw "Incorrect number of arguments passed to `construct()`."
    var data = [].slice.call(arguments, 1);
    // (make sure the identifier is a string not a number to call the correct Array constructor)
    data._tag = String(id);
    return data;
  };

