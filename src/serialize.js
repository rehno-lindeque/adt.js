  adt.serialize = function(){
    var 
    serializeEval = adt('serialized', {'_': 
      function() { 
        var 
          i, 
          escapes = {
            '\\': '\\\\',
            '\"': '\\\"',
            '\'': '\\\'',
            '\t': '\\t',
            '\r': '\\r',
            '\n': '\\n',
            ' ': '\\ ',
            ',': '\\,',
            '(': '\\(',
            ')': '\\)',
            '[': '\\[',
            ']': '\\]',
            '{': '\\{',
            '}': '\\}'
          },
          str = escapeString(this._tag, escapes), 
          data;
        for (i = 0; i < arguments.length; ++i) {
          // TODO: refactor (is deconstruct still necessary?)
          data = adt.deconstruct(arguments[i]);
          str += ' ' + (data.tag === 'string'? 
            '"' + escapeString(data.args) + '"' : 
            (data.tag === 'serialized'? 
              "(" + data.args + ")" :
              String(data.args)));
        }
        return this.serialized(str); 
      }}
    );
    
    return String(adt.deconstruct(serializeEval.recurse.apply(serializeEval, arguments)).args);
  };

