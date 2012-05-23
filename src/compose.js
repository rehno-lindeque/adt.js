  adt.compose = function() {
    var i, a = arguments, f, fi, key, tags;
    if (a.length === 0)
      return adt();
    f = typeof a[0] === 'function'? a[0] : adt(a[0]);
    for (i = 1; i < a.length; ++i) {
      fi = typeof a[i] === 'function'? a[i] : adt(a[i]);
      f = (function(fi, f){ return function(){ return fi(f.apply(this, arguments)); }; })(fi, f);
    }
    // Get all the tags of all of the interfaces
    tags = [];
    for (i = 0; i < a.length; ++i)
      if (typeof a[i] === 'object' || isInterface(a[i]))
        for (key in a[i])
          if (key.length > 0 && key[0] !== '_')
            tags.push(key);
    // Add all evaluators to the interface
    f._eval = f;
    for (i = 0; i < tags.length; ++i)
      f[tags[i]] = (function(f, tag){ 
        return function(){ return f(construct.apply(null, [tag].concat(arguments))); };
      })(f, tags[i]);
    return f;
  };
