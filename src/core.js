  // Define a local copy of adt
  var
    isADT = function(data) {
      return Array.isArray(data) && typeof data['_tag'] === 'string';
    },
    isInterface = function(obj) {
      return typeof obj === 'function' && typeof obj['_eval'] === 'function';
    },
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
            selfProto[a] = (function(tag) { return function() { return construct(tag, arguments); }; })(a);
        }
        else if (typeof a === 'object' || typeof a === 'function') {
          for (key in a)
            if (key !== '_' && key.charAt(0) === '_')
              continue; // ignore evaluators for private members starting with _
            else if (typeof(a[key]) === 'function')
              selfProto[key] = a[key];
            else
              selfProto[key] = (function(val){ return function() { return val; }; })(a[key]);
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
      return evaluators(selfProto);
    },
    // Get the internal [[Class]] property (or `Undefined` or `Null` for `(void 0)` and `null` respectively)
    getObjectType = function(data) {
      var str = Object.prototype.toString.call(data);
      return str.slice(str.indexOf(' ') + 1, str.length - 1);
    },
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
    unescapeString = function(str) {
      var
        i,
        result = '',
        escapes = {
          // Single-character escape codes (Haskell -> JavaScript)
          //'0': '\0',    // null character   (handled by numeric escape codes)
          'a': '',        // alert            (n/a in javaScript)
          'b': '\b',      // backspace
          'f': '\f',      // form feed
          'n': '\n',      // newline (line feed)
          'r': '\r',      // carriage return
          't': '\t',      // horizontal tab
          'v': '\v',      // vertical tab
          '\"': '\"',     // double quote
          '&': '',        // empty string
          '\'': '\'',     // single quote
          '\\': '\\'      // backslash
        };
        /* ASCII control code abbreviations (Haskell -> JavaScript)
        \NUL  U+0000  null character
        \SOH  U+0001  start of heading
        \STX  U+0002  start of text
        \ETX  U+0003  end of text
        \EOT  U+0004  end of transmission
        \ENQ  U+0005  enquiry
        \ACK  U+0006  acknowledge
        \BEL  U+0007  bell
        \BS U+0008  backspace
        \HT U+0009  horizontal tab
        \LF U+000A  line feed (newline)
        \VT U+000B  vertical tab
        \FF U+000C  form feed
        \CR U+000D  carriage return
        \SO U+000E  shift out
        \SI U+000F  shift in
        \DLE  U+0010  data link escape
        \DC1  U+0011  device control 1
        \DC2  U+0012  device control 2
        \DC3  U+0013  device control 3
        \DC4  U+0014  device control 4
        \NAK  U+0015  negative acknowledge
        \SYN  U+0016  synchronous idle
        \ETB  U+0017  end of transmission block
        \CAN  U+0018  cancel
        \EM U+0019  end of medium
        \SUB  U+001A  substitute
        \ESC  U+001B  escape
        \FS U+001C  file separator
        \GS U+001D  group separator
        \RS U+001E  record separator
        \US U+001F  unit separator
        \SP U+0020  space
        \DEL  U+007F  delete
        */
        /* Control-with-character escapes (Haskell -> JavaScript)
        \^@ U+0000  null character
        \^A through \^Z U+0001 through U+001A control codes
        \^[ U+001B  escape
        \^\ U+001C  file separator
        \^] U+001D  group separator
        \^^ U+001E  record separator
        \^_ U+001F  unit separator
        */
      for (i = 0; i < str.length - 1; ++i) {
        if (str[i] !== '\\')
          result += str[i];
        else {
          var 
            s = str[i + 1],
            replacement = escapes[s],
            numStr = null,
            radix = null;
          if (replacement != null) {
            result += replacement;
            ++i;
            continue;
          }
          // Parse numeric escapes
          if (s >= '0' && s <= '9') {
            numStr = (/[0-9]*/).exec(str.slice(i + 1))[0];
            radix = 10; 
          } else if (s == 'x') {
            numStr = (/[0-9a-f]*/i).exec(str.slice(i + 2))[0];
            radix = 16;
          } else if (s == 'o') {
            numStr = (/[0-7]*/).exec(str.slice(i + 2))[0];
            radix = 8;
          }
          if (numStr != null && numStr.length > 0) {
            var 
              num = 0,
              j;
            for (j = 0; j < numStr.length; ++j) {
              num *= radix;
              num += parseInt(numStr[j], radix);
            }
            result += String.fromCharCode(num);
            console.log(numStr,numStr.length);
            i += numStr.length + (s == 'x' || s == 'o'? 1 : 0);
            continue;
          }
          // Direct single-character escape
          result += str[i + 1];
          ++i;
        }
      }
      // Add the last character if it wasn't escaped
      return i === str.length - 1? result + str[str.length - 1] : result;
    };
  adt.isADT = isADT;
  adt.isInterface = isInterface;
