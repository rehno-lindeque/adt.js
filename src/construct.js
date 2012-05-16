  var construct = function(tag, args) {
    // Make a shallow copy of args and patch on the tag
    var data = [].slice.call(args);
    data._tag = tag;
    return data;
  };
  /* TODO: Possibly expose it in the future...
  adt.construct = function(tag) {
    if (arguments.length < 1)
      throw "Incorrect number of arguments passed to `construct()`."
    return construct(tag, [].slice.call(arguments, 1));
  };*/

