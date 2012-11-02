  adt.serialize = function(data){
    var 
      escapeString = function(str, escapes) {
        var 
          i, 
          result = '',
          replacement,
          escapes = escapes || {
            // Single-character escape codes (JavaScript -> Haskell)
            '\0': '\\0',    // null character
            //'\a': '\\a',  // alert            (n/a in JavaScript)
            '\b': '\\b',    // backspace
            '\f': '\\f',    // form feed
            '\n': '\\n',    // newline (line feed)
            '\r': '\\r',    // carriage return
            '\t': '\\t',    // horizontal tab
            '\v': '\\v',    // vertical tab
            '\"': '\\\"',   // double quote
            //'\&': '\\&',  // empty string     (n/a in JavaScript)
            '\'': '\\\'',   // single quote
            '\\': '\\\\'    // backslash
          };
        for (i = 0; i < str.length; ++i) {
          replacement = escapes[str[i]];
          result += (replacement == null? str[i] : replacement);
        }
        return result;
      },
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
      serializeBuiltinEval = adt({
        Array: function(a) { 
          var 
            i,
            str ='[';
          if (a.length > 0)
            for (i = 0;; ++i) {
              str += serializeEval(a[i]);
              if (i === a.length - 1)
                break;
              str += ',';
            }
          str += ']'; 
          return str;
        },
        Object: function(a) {
          var 
            i,
            k = Object.keys(a),
            str = '{';
          if (k.length > 0)
            for (i = 0;; ++i) {
              str += escapeString(k[i], escapes) + ' = ' + serializeEval(a[k[i]]);
              if (i === k.length - 1)
                break;
              str += ',';
            }
          str += '}';
          return str;
        }
      }),
      // TODO: shorten this by using `compose`?
      serializeEval = adt({
        String: function(a) { return this._datatype === 'ADT'? serializeTagStruct('String', arguments) : '"' + a + '"'; },
        Number: function(a) { return this._datatype === 'ADT'? serializeTagStruct('Number', arguments) : String(a); },
        Boolean: function(a) { return this._datatype === 'ADT'? serializeTagStruct('Boolean', arguments) : (a? 'True' : 'False'); },
        // TODO: what about nested records, arrays and ADT's?
        Array: function(a) { return this._datatype === 'ADT'? serializeTagStruct('Array', arguments) : serializeBuiltinEval(a); },
        Arguments: function(a) { return this._datatype === 'ADT'? serializeTagStruct('Arguments', arguments) : this([].slice.call(a, 0)); },
        // TODO: what about adt's nested inside the record...
        Object: function(a) { return this._datatype === 'ADT'? serializeTagStruct('Object', arguments) : serializeBuiltinEval(a); },
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
