  // ADT constructor/evaluator api
  adt.fn = adt.prototype = {
    init: function() {
      // Arguments to this function can be either constructor names (strings or 
      // arrays of strings, numbers or arrays of numbers) or evaluators (dispatch tables or arrays of dispatch
      // tables with keys as deconstructors and values as dispatch functions)
      var i, key;
      for (i = 0; i < arguments.length; ++i) {
        var a = arguments[i];
        if (Array.isArray(a))
          this.init.apply(this, a);
        else if (typeof(a) === 'string' || typeof(a) === 'number')
          this[a] = makeConstructor(a);
        else if (typeof(a) === 'object')
          for (key in a)
            if (typeof(a[key]) === 'function')
              this[key] = a[key];
            else
              continue; // TODO: WARNING: expected function values in dispatch table
        else
          continue; // TODO: WARNING: unidentified argument passed to adt
      } 
      return this;
    },
    parse: function(str) {
      // TODO
      /*var 
        i = 0,
        j = i;
      for (; i < str.length + 1; ++i) {
        if (str[i] === ' ' || i == str.length) {
          if (str[j] === '(')
          for (; j < i; ++j)
            if (tokens[j] === '')
          ++j;
        }        
      }*/
    }
  };

