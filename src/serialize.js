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
          str = escapeString(this._key, escapes), 
          data;
        for (i = 0; i < arguments.length; ++i) {
          data = adt.deconstruct(arguments[i]);
          str += ' ' + (data.key === 'string'? 
            '"' + escapeString(data.value) + '"' : 
            (data.key === 'serialized'? 
              "(" + data.value + ")" :
              String(data.value)));
        }
        return this.serialized(str); 
      }}
    ).recursive();
    
    return String(adt.deconstruct(serializeEval.apply(serializeEval, arguments)).value);
  };

