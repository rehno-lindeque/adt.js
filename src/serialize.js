  adt.serialize = function(data){
    var 
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
      SerializedADT = adt('SerializedADT').SerializedADT,
      serializeEval = adt({
        String: function(a) { return SerializedADT('"' + a + '"'); },
        Number: function(a) { return SerializedADT(String(a)); },
        Boolean: function(a) { return SerializedADT(a? 'True' : 'False'); },
        // TODO: what about nested records, arrays and ADT's?
        Array: function(a) { return SerializedADT('[' + String(a) + ']'); },
        Arguments: function(a) { return this.Array([].slice.call(a, 0)); },
        // TODO: what about adt's nested inside the record...
        Object: function(a) { return SerializedADT('"' + JSON.stringify(a) + '"'); },
        SerializedADT: function(a) { return SerializedADT('(' + a + ')'); },
        _: function() {
          if (this._datatype !== 'ADT')
            // Currently unsupported: RegExp, Null, Undefined, Math, JSON, Function, Error, Date
            throw "Unsupported primitive type `" + this._datatype + "` in `adt.serialize`.";
          var
            i,
            str = escapeString(this._tag, escapes);
          for (i = 0; i < arguments.length; ++i)
            str += ' ' + this(arguments[i])[0];
          return SerializedADT(str);
        }
      });
    return serializeEval(data);
  };

