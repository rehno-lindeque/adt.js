/*
 * adt.js - Algebraic Data Types for JavaScript
 * adt.js is free, public domain software (http://creativecommons.org/publicdomain/zero/1.0/)
 * Originally created by Rehno Lindeque of http://www.mischievousmeerkat.com
 */
var adt = (function() {
"use strict";
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
    getDataType = function(data) {
      if (isADT(data)) return 'ADT'; else return getObjectType(data);
    },
    getTypeTag = function(data) {
      if (isADT(data)) return data._tag; else return getObjectType(data);
    };
  adt.isADT = isADT;
  adt.isInterface = isInterface;
  adt.version = "2.0.0";  var construct = function(tag, args) {
    // Make a shallow copy of args and patch on the tag
    var data = [].slice.call(args, 0);
    data._tag = tag;
    return data;
  };
  /* TODO: Possibly expose it in the future...
  adt.construct = function(tag) {
    if (arguments.length < 1)
      throw "Incorrect number of arguments passed to `construct()`."
    return construct(tag, [].slice.call(arguments, 1));
  };*/

  // ADT evaluators common
  // ADT evaluators API (version 1)
  var 
    evaluators = function(selfProto) {
      var 
        tag,
        evaluators = function(){
          // TODO: Add a second private method called `_run` which includes composition/recursion etc as applied by external plugins.
          //       This would hopefully allow people to write generic higher-order functions that work together seamlesly.
          return evaluators._eval.apply(evaluators, arguments);
        };

      var _eval = function(pattern, tag, datatype, args) {
        // TODO (version 1.0 & 2.0): The first argument can be removed
        // TODO (version 3.0): perform pattern matching
        // E.g. split the data around whitespace and in order of specific to general...
        var result;
        evaluators._pattern = (pattern != null? pattern : (tag != null? tag : datatype));
        // TODO: When the pattern matched was the wildcard _, the pattern should reflect that
        evaluators._tag = (tag != null? tag : datatype);
        evaluators._datatype = (datatype != null? datatype : 'ADT');
        var f = evaluators[evaluators._pattern]; 
        if (typeof f !== 'function')
          f = evaluators['_'];
        return f.apply(evaluators, args);
      };

      evaluators._eval = function(data) {
        // Determine if the data is a construction (built by a constructor)
        if (isADT(data)) {
          return _eval(null, data._tag, 'ADT', data);
        }
        // Evaluate primitive type
        return _eval(null, null, getObjectType(data), [data]);
      };

      /* TODO (version )?
      // Iterate over an array of values (while carrying state, like a finite state machine)
      // Similar to a haskell enumerator + iteratee with "map" as the enumerator and "iteratee" as the iteratee carying state
      evaluators.mapIteratee = function() { console.log("mapIterate", arguments); return 0; };

      // Similar to a haskell enumerator + iteratee with "fold" as the enumerator and "iteratee" as the iteratee carying state
      evaluators.foldIteratee = function() { console.log("iterate", arguments); return 0; };
      */

      // Add adt constructors / methods to the evaluators
      for (tag in selfProto)
        switch(tag) {
          case 'eval':
            continue;  // Warning? trying to overide standard functions
          default:
            if (tag !== 'eval') {
              if (typeof selfProto[tag] === 'function')
                // Custom evaluators
                evaluators[tag] = (function(tag){ return function(){ return selfProto[tag].apply(evaluators, arguments); }; })(tag);
              else 
                // Constant constructor (return the constant value)
                evaluators[tag] = (function(tag){ return function(){ return selfProto[tag]; }; })(tag);
            }
        }
      // Create an identity constructor for the fall through pattern if none was supplied
      if (typeof selfProto['_'] === 'undefined') {
        selfProto['_'] = function(){
          return this._datatype !== 'ADT'? arguments[0] : construct(this._tag, arguments);
        },
        evaluators['_'] = function(){ return selfProto['_'].apply(evaluators, arguments); };
      }
      
      return evaluators;
    };

  // Automatically create constructors for any dispatch table
  adt.constructors = function(obj) {
    var key, keys = [];
    if (obj != null)
      for (key in obj)
        keys.push(key);
    return adt.apply(null, keys);
  };

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
  adt.recursive = function(f) {
    if (typeof f !== 'function')
      throw "Expected a function or ADT interface in adt.recursive"
    var self = isInterface(f)? f : adt({_: f});

    var recurse = function (data) {
        var i, results = [], subResult;
        if (!isADT(data)) {
          return self(data);
        }
        for (i = 0; i < data.length; ++i) {
          subResult = recurse(data[i]);
          //if (typeof subResult !== 'undefined')
          results.push(subResult);
        }
        // TODO: Take into account pattern matching requirements...
        return self(construct(data._tag, results));
    };
    // Assign all the methods in the interface to the recursive interface too
    // TODO: But shouldn't these methods also run recursively?
    for (var key in self)
      recurse[key] = self[key];
    return recurse;
  };
  // Create ADT's from an object's own property names (both enumerable + non-enumerable)
  adt.own = function() {
    var i, j, arg, names, key, dispatchTable = {};
    for (i = 0; i < arguments.length; ++i) {
      arg = arguments[i];
      names = Object.getOwnPropertyNames(arg);
      for (j = 0; j < names.length; ++j) {
        key = names[j];
        dispatchTable[key] = arg[key];
      }
    }
    return adt(dispatchTable);
  }
  adt.own.constructors = function(obj) {
    var i, names = [];
    for (i = 0; i < arguments.length; ++i)
      names.push(Object.getOwnPropertyNames(arguments[i]));
    return adt.apply(null, Array.prototype.concat.apply([], names));
  };

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
          for (i = 0;; ++i) {
            str += escapeString(k[i], escapes) + ':' + serializeEval(a[k[i]]);
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
  var 
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
    },
    eatWhiteSpace = function(str) {
      for (var i = 0; i < str.length; ++i) {
        switch (str[i]) {
          case ' ':
          case '\n': 
          case '\r': 
          case '\t':  
            continue;
        }
        return str.slice(i);
      }
      return '';
    },

    lexString = function(str) {
      var i, searchIndex = 1;
      // pre-condition: str.length > 1
      while (true) {
        searchIndex = str.indexOf(str[0], searchIndex);
        if (searchIndex === -1)
          throw "No closing quotation mark was found for the string starting with " + str.slice(0, Math.min(5, str.length)) + "...";
        // Check if there's an odd number of escape characters before the quotation mark character
        for (i = searchIndex - 1; i >= 0; --i)
          if (str[i] !== '\\') {
            if ((searchIndex - i) & 1 === 1) // There is an even number of slashes (or none)
              return { head: str.slice(0, searchIndex + 1), tail: str.slice(searchIndex + 1) };
            else // There is an odd number of slashes, so continue searching
              break;
          }
        searchIndex += 1;
      }
    },
    lex = function(str) {
      var 
        nextWhiteSpace,
        skip = 1;
      str = eatWhiteSpace(str);
      if (str.length === 0)
        return ['','']; // empty string
      switch (str[0]) {
        case '(':
        case ')':
        case '[':
        case ']':
        case ',': 
          return { head: str[0], tail: str.slice(1) };
        case '\"': 
        case '\'':
          return lexString(str);
        case '\\':
          skip = 2;
      }
      for (var i = skip; i < str.length; ++i) {
        switch (str[i]) {
          case '(':
          case ')':
          case '[':
          case ']':
          case ',':
          case ' ':
          case '\n':
          case '\r':
          case '\t':
            return { head: str.slice(0, i), tail: str.slice(i) };
          case '\"': 
          case '\'':
            throw "Illegal quote character `" + str[i] + "` found in lexeme. Quotes should be escaped using `\\" + str[i] + "`."
          case '\\':
            if (i === str.length - 1)
              throw "Escape character `\\` found at the end of the input string, followed by nothing."
            ++i; // skip the next character
        }
      }
      return { head: str, tail: "" };
    },
    parseADTTail = function(head, input) {
      var
        tag = unescapeString(head),
        tail = input,
        args = [];
      
      while (tail.length > 0)
        switch (tail[0]) {
          // Look ahead for terminating characters
          case ')':
          case ']':
          case ',':
            return { result: construct(tag, args), tail: tail };
          default:
            var parseResult = parseArgument(tail);
            if (parseResult == null)
              continue;
            args.push(parseResult.result);
            tail = parseResult.tail;
        }
      return { result: construct(tag, args), tail: tail };
    },
    parseArrayTail = function(input) {
      if (input.length < 2)
        throw "No data supplied after array opening bracket `[`.";
      var 
        tail = input,
        commaCount = 0,
        array = [];
      while (tail.length > 0)
        switch (tail[0]) {
          case ')':
            throw "Invalid character `" + tail[0] + "` found in the data."
          case ',':
            ++commaCount;
            if (commaCount < array.length)
              array.push(undefined);
            // post-condition: array.length === commaCount
            tail = tail.slice(1);
            continue;
          case ']':
            return { result: array, tail: tail.slice(1) };
          default:
            if (commaCount < array.length)
              throw "Expected `,` separator between array elements."
            var parseResult = parse(tail);
            if (parseResult == null)
              continue;
            array.push(parseResult.result);
            tail = parseResult.tail;
        }
      throw "Could not find the closing bracket for the array `[" + input.slice(0, Math.max(input.length,4)).join('') + "...`";
      // TODO...
      //return tail;
    },
    parseParensTail = function(input) {
      if (input.length < 1)
        throw "No data after opening parenthesis.";
      var head = input[0], tail = input.slice(1);
      if (head.length === 0)
        return parseParensTail(tail); // no argument (two whitespace characters next to each other causes this)
      switch (head) {
        case '(':
          throw "Invalid double opening parentheses `((` found."
        case ')':
          throw "No data supplied after opening parenthesis `(`. The unit type, (), is not supported.";
        case '[':
        case ']':
        case ',':
        case '\"':
        case '\'':
          // Note that primitives are not allowed inside `(...)`
          throw "Invalid character `" + head + "` found after opening parenthesis."
      }
      // Parse the ADT constructor and arguments
      var parseResult = parseADTTail(head, tail);
      if (parseResult.tail.length === 0 || parseResult.tail[0] !== ')')
        throw "Could not find the closing parenthesis for the data `(" + input.slice(0, Math.max(input.length,4)).join(' ') + "...`";
      return { result: parseResult.result, tail: parseResult.tail.slice(1) };
    },
    parsePrimitive = function(head, input) {
      switch (head) {
        case '(':
          return parseParensTail(input);
        case '[':
          return parseArrayTail(input);
      }
      switch (head[0]) {
        case '\"':
          //pre-condition: head[head.length - 1] === '\"'
          //pre-condition: head.length > 1
          return { result: unescapeString(head.slice(1, head.length - 1)), tail: input };
        case '\'':
          //pre-condition: head[head.length - 1] === '\"'
          //pre-condition: head.length > 1
          return { result: unescapeString(head.slice(1, head.length - 1)), tail: input };
      }
      var numberCast = Number(head);
      if (!isNaN(numberCast))
        return { result: numberCast, tail: input };
      return null;
    },
    parseArgument = function(input) {
      // This is almost identical to parse, except it only allows argumentless ADT constructors
      if (input.length == 0)
        return null;
      // pre-condition: input.length > 0
      var head = input[0], tail = input.slice(1);
      if (head.length === 0)
        return parseArgument(tail); // no argument (two whitespace characters next to each other causes this)
      // Try to parse a primitive from the stream
      var parseResult = parsePrimitive(head, tail);
      if (parseResult != null)
        return parseResult;
      // The next token is not a primitive type, so it must be a constructor tag
      var tag = unescapeString(head);
      return { result: construct(tag, []), tail: tail };
    },
    parse = function(input) {
      if (input.length == 0)
        return null;
      var head = input[0], tail = input.slice(1);
      if (head.length === 0)
        return parse(tail); // no argument (two whitespace characters next to each other causes this)
      // Try to parse a primitive from the stream
      var parseResult = parsePrimitive(head, tail);
      if (parseResult != null)
        return parseResult;
      // The next token is not a primitive type, so it must be a constructor tag
      return parseADTTail(head, tail);
    };
  adt.deserialize = function(str){
    var
      lexemes = [],
      lexState = { head: '', tail: str },
      stack = [];
    while (lexState.tail.length > 0) {
      lexState = lex(lexState.tail);
      lexemes.push(lexState.head);
    }
    // Remove all empty lexemes from the start of the array
    while (lexemes.length > 0 && lexemes[0].length == 0)
      lexemes = lexemes.slice(1);
    // Test whether the list of lexemes is empty (the string was empty or whitespace only)
    if (lexemes.length == 0)
      return;
    // Allow lisp style constructors with starting and ending parentheses
    if (lexemes[0] === '(')
      if (lexemes[lexemes.length - 1] !== ')') {
        lexemesStr = lexemes.join(' ');
        throw "Optional opening parenthesis used for the data " + lexemesStr.slice(0, Math.min(10, lexemesStr.length)) + "... but could not find the closing parenthesis.";
      }
    return parse(lexemes).result;
    // post-condition: parse(lexemes) != null (because all empty lexemes at the beginning were explicitly removed)
    // post-condition: parse(lexemes).tail.length === 0
  };
//*/



/*
  var 
    lexADT()
  adt.deserialize = function(str) {
    var
      head,
      tail,
      result;
    if (lexemes.length === 0)
      return;

    head = lexemes[0];
    tail = lexemes.slice(1);
    result = deserializeWithKey(0, head, tail);
    // post-condition: result[1].length === 0
    return result[0];
  };
*/
  // Export adt to a CommonJS module if exports is available
  if (typeof(exports) !== "undefined" && exports !== null)
    module.exports = adt;
  return adt;
})();

