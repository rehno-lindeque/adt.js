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
      //SerializedADT = adt('SerializedADT').SerializedADT,
      serializeTagStruct = function(tag, args) {
        var
            i,
            str = escapeString(tag, escapes),
            parens;
          for (i = 0; i < args.length; ++i) {
            parens = isADT(args[i]) && args[i].length > 0;
            str += ' ' + (parens? '(' : '') + serializeEval(args[i]) + (parens? ')' : '');
          }
          return str;
      },
      // TODO: shorten this by using `compose`?
      serializeEval = adt({
        String: function(a) { return this._datatype === 'ADT'? serializeTagStruct('String', arguments) : '"' + a + '"'; },
        Number: function(a) { return this._datatype === 'ADT'? serializeTagStruct('Number', arguments) : String(a); },
        Boolean: function(a) { return this._datatype === 'ADT'? serializeTagStruct('Boolean', arguments) : (a? 'True' : 'False'); },
        // TODO: what about nested records, arrays and ADT's?
        Array: function(a) { return this._datatype === 'ADT'? serializeTagStruct('Array', arguments) : '[' + String(a) + ']'; },
        Arguments: function(a) { return this._datatype === 'ADT'? serializeTagStruct('Arguments', arguments) : this([].slice.call(a, 0)); },
        // TODO: what about adt's nested inside the record...
        Object: function(a) { return this._datatype === 'ADT'? serializeTagStruct('Object', arguments) : '"' + JSON.stringify(a) + '"'; },
        //SerializedADT: function(a) { return '(' + a + ')'; },
        _: function() {
          if (this._datatype !== 'ADT')
            // Currently unsupported: RegExp, Null, Undefined, Math, JSON, Function, Error, Date
            throw "Unsupported JavaScript built-in type `" + this._datatype + "` in `adt.serialize`.";
          return serializeTagStruct(this._tag, arguments);
        }
      });
    return serializeEval(data);
  };
