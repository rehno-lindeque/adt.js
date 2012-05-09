  // Define a local copy of adt
  var
    init = function(selfProto, args) {
      var i, key, strA;
      for (i = 0; i < args.length; ++i) {
        var a = args[i];
        if (Array.isArray(a))
          init(selfProto, a);
        else if (typeof a === 'string' || typeof a === 'number') {
          if (a !== '_' && String(a).charAt(0) === '_')
            continue; // ignore constructors for private members starting with _
          else
            selfProto[a] = makeConstructor(a);
        }
        else if (typeof a === 'object' || typeof a === 'function') {
          for (key in a)
            if (key !== '_' && key.charAt(0) === '_')
              continue; // ignore evaluators for private members starting with _
            else if (typeof(a[key]) === 'function')
              selfProto[key] = a[key];
            else
              selfProto[key] = function() { return a[key]; };
        }
        else
          continue; // TODO: WARNING: unidentified argument passed to adt
      }
    },
    adt = function() {
      // Arguments to this function can be either constructor names (strings or 
      // arrays of strings, numbers or arrays of numbers) or evaluators (dispatch tables or arrays of dispatch
      // tables with keys as deconstructors and values as dispatch functions)
      var selfProto = {};
      init(selfProto, arguments);
      return evaluator(selfProto);
    },
    makeConstructor = function(identifier) { 
      return function() {
        return adt.construct.apply(null, [identifier].concat([].slice.call(arguments, 0)));
      }; 
    },
    unescapeString = function(str) {
      var
        i,
        result = '',
        escapes = {
          '\\': '\\',
          '\"': '\"',
          '\'': '\'',
          't': '\t',
          'r': '\r',
          'n': '\n'
        };
      for (i = 0; i < str.length - 1; ++i) {
        if (str[i] !== '\\')
          result += str[i];
        else {
          var replacement = escapes[str[i + 1]];
          result += (replacement == null? str[i + 1] : replacement);
          ++i;
        }          
      }
      // Add the last character if it wasn't escaped
      return i === str.length - 1? result + str[str.length - 1] : result;
    },
    escapeString = function(str, escapes) {
      var 
        i, 
        result = '',
        replacement,
        escapes = escapes || {
          '\\': '\\\\',
          '\"': '\\\"',
          '\'': '\\\'',
          '\t': '\\t',
          '\r': '\\r',
          '\n': '\\n'
        };
      for (i = 0; i < str.length; ++i) {
        replacement = escapes[str[i]];
        result += (replacement == null? str[i] : replacement);
      }
      return result;
    };

