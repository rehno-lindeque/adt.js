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
    };
  adt.isADT = isADT;
  adt.isInterface = isInterface;
  var construct = function(tag, args) {
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

  // ADT evaluators api
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
          /* TODO: (version 3.0): Construct a pattern for pattern matching
          var
            pattern = data[0],
            i;
          for (i = 1; i < data.length; ++i) {
            if (isADT(data[i])) {
              pattern = pattern.concat(' '.concat(data[i][0]));
            else
              pattern = pattern.concat(' '.concat(typeof data[i]));
          }*/
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
    var recurse = function (data) {
        var i, results = [], subResult;
        if (!isADT(data))
          return f(data);
        for (i = 1; i < data.length; ++i) {
          subResult = recurse(data[i]);
          if (typeof subResult !== 'undefined')
            results.push(subResult);
        }
        // TODO: Take into account pattern matching requirements...
        return f(construct(data[0], results));
    };
    // Assign all the methods in the interface to the recursive interface too
    // TODO: But shouldn't these methods also run recursively?
    for (var key in f)
      recurse[key] = f[key];
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
  var 
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
        for (i = searchIndex - 1; i > 0; --i)
          if (str[i] !== '\\') {
            if ((searchIndex - i) & 1 === 1) // There is an even number of slashes
              return { head: str.slice(0, searchIndex + 1), tail: str.slice(searchIndex + 1) };
            else // There is an odd number of slashes
              break;
          }
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
    parseADTTail = function(input) {
      if (input.length < 1)
        throw "No data supplied after opening parenthesis `(`.";
      var
        tag = unescapeString(input[0]),
        tail = input.slice(1),
        args = [];
      if (input.length > 0 && input[0] === '(')
        throw "Invalid double opening parentheses `((` found."
      while (tail.length > 0)
        switch (tail[0]) {
          case ']':
          case ',':
            throw "Invalid character `" + tail[0] + "` found in the data."
          case ')':
            return { result: construct(tag, args), tail: tail.slice(1) };
          default:
            var parseResult = parse(tail);
            if (parseResult == null)
              continue;
            args.push(parseResult.result);
            tail = parseResult.tail;
        }
      throw "Could not find the closing parenthesis for the data `(" + input.slice(0, Math.max(input.length,4)).join(' ') + "...`";
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
    parse = function(input) {
      // pre-condition: input.length > 0
      var head = input[0], tail = input.slice(1);
      if (head.length === 0)
        return; // no argument (two whitespace characters next to each other causes this)
      switch (head) {
        case '(':
          return parseADTTail(tail);
        case '[':
          return parseArrayTail(tail);
      }
      switch (head[0]) {
        case '\"':
          //pre-condition: head[head.length - 1] === '\"'
          //pre-condition: head.length > 1
          return { result: unescapeString(head.slice(1, head.length - 1)), tail: tail };
        case '\'':
          //pre-condition: head[head.length - 1] === '\"'
          //pre-condition: head.length > 1
          return { result: unescapeString(head.slice(1, head.length - 1)), tail: tail };
      }
      var numberCast = Number(head);
      if (!isNaN(numberCast))
        return { result: numberCast, tail: tail };
      // The token is not a primitive type, so it must be an empty constructor tag
      return { result: construct(unescapeString(head), []), tail: tail };
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
    if (lexemes[0] === '(') {
      if (lexemes[lexemes.length - 1] !== ')') {
        lexemesStr = lexemes.join(' ');
        throw "Optional opening parenthesis used for the data " + lexemesStr.slice(0, Math.min(10, lexemesStr.length)) + "... but could not find the closing parenthesis."
      }
    }
    else {
      // pre-condition: lexemes[0].length > 0 (because empty lexemes at the beginning were removed)
      switch (lexemes[0][0]) {
        case '\"':
        case '\'':
        case '[':
          break; // adt is a string or an array
        default: 
          lexemes = ['('].concat(lexemes).concat([')']);
      }
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

