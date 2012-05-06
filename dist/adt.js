/*
 * adt.js - Algebraic Data Types for JavaScript
 * adt.js is free, public domain software (http://creativecommons.org/publicdomain/zero/1.0/)
 * Originally created by Rehno Lindeque of http://www.mischievousmeerkat.com
 */
var adt = (function() {
"use strict";
  // Define a local copy of adt
  var
    init = function(selfProto, args) {
      var i, key, strA;
      for (i = 0; i < args.length; ++i) {
        var a = args[i];
        if (Array.isArray(a))
          init(selfProto, a);
        else if (typeof(a) === 'string' || typeof(a) === 'number') {
          if (a !== '_' && String(a).charAt(0) === '_')
            continue; // ignore constructors for private members starting with _
          else
            selfProto[a] = makeConstructor(a);
        }
        else if (typeof(a) === 'object' || typeof(a) == 'function') {
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
          replacement = escapes[str[i + 1]]
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

  adt.construct = function(id) {
    if (arguments.length < 1)
      throw "Incorrect number of arguments passed to `construct()`."
    // (make sure the identifier is a string not a number to call the correct Array constructor)
    var data = [String(id)].concat([].slice.call(arguments, 1));
    data._ADTData = true;
    return data;
  };

  adt.deconstruct = function(data){
    return (data && data['_ADTData'] === true? 
      { key: data[0], value: data.slice(1) } : 
      { key: typeof data, value: data });
  };

  // ADT evaluator api
  var 
    evaluator = function(selfProto) {
      var 
        key,
        evaluator = function(){
          return evaluator.eval.apply(evaluator, arguments);
        },
        self = Object.create(selfProto);

      evaluator.recursive = function() {
        evaluator.eval = evaluator.recurse;
        return evaluator;
      };

      evaluator.eval = function(data) {
        // Determine if the data is a type name (a data type constructor name)
        if (typeof data === 'string' || typeof data === 'number') {
          // TODO (version 2): perform pattern matching
          // E.g. split the data around whitespace and in order of specific to general...
          var result;
          self._key = self._pattern = data;
          if (typeof evaluator[data] === 'function')
            return evaluator[data].apply(self, [].slice.call(arguments, 1));
          return evaluator['_'].apply(self, [].slice.call(arguments, 1));
        }
        // Determine if the data is a construction (built by a constructor)
        if (Array.isArray(data) && data['_ADTData'] === true) {
          // pre-condition: No empty constructions
          if (data.length < 1)
            throw "It shouldn't be possible to have empty ADT constructions";
          /* TODO: (version 2.0): Construct a key for pattern matching
          var
            pattern = data[0],
            i;
          for (i = 1; i < data.length; ++i) {
            if (Array.isArray(data[i]) && data[i]['_ADTData'] === true) {
              key = key.concat(' '.concat(data[i][0]));
            else
              key = key.concat(' '.concat(typeof data[i]));
          }*/
          self._key = self._pattern = data[0];
          return evaluator.eval.apply(evaluator, data);
        }
        // If the argument is neither a constructor name, nor a construction (ADTData)
        // then simply return it
        return data;
      };

      evaluator.recurse = function(data) {
        // Determine if the data is a type name (a data type constructor name)
        if (typeof data === 'string' || typeof data === 'number') {
          // TODO (version 2): perform pattern matching
          // E.g. split the data around whitespace and in order of specific to general...
          var result;
          self._key = self._pattern = data;
          if (typeof evaluator[data] === 'function')
            result = evaluator[data].apply(self, [].slice.call(arguments, 1));
          else
            result = evaluator['_'].apply(self, [].slice.call(arguments, 1));
          return result;
        }
        // Determine if the data is a construction (built by a constructor)
        if (Array.isArray(data) && data['_ADTData'] === true) {
          // pre-condition: data.length > 0
          if (data.length < 1)
            throw "It shouldn't be possible to have empty ADT constructions";
          // Evaluate sub-trees
          var
            result = new Array(data.length),
            pattern = '',
            i;
          result._ADTData = true;
          pattern = String(data[0]);
          for (i = 1; i < data.length; ++i) {
            var subResult = (Array.isArray(data[i]) && data[i]['_ADTData'] === true)? evaluator.recurse(data[i]) : data[i];
            if (Array.isArray(subResult) && subResult['_ADTData'] === true) {
              pattern = pattern.concat(' '.concat(subResult[0]));
              result[i] = subResult;
            }
            else {
              pattern = pattern.concat(' '.concat(typeof subResult));
              result[i] = subResult;
            }
          }
          /* TODO (version 2): for pattern matching
          result[0] = pattern;*/
          result[0] = data[0];
          self._key = self._pattern = result[0]; //key
          return evaluator.recurse.apply(evaluator, result);
        }
        // If the argument is neither a constructor name, nor a construction (ADTData)
        // then simply return it
        return data;
      };

      /* TODO (version 2/3)?
      // Iterate over an array of values (while carrying state, like a finite state machine)
      // Similar to a haskell enumerator + iteratee with "map" as the enumerator and "iteratee" as the iteratee carying state
      evaluator.mapIteratee = function() { console.log("mapIterate", arguments); return 0; };

      // Similar to a haskell enumerator + iteratee with "fold" as the enumerator and "iteratee" as the iteratee carying state
      evaluator.foldIteratee = function() { console.log("iterate", arguments); return 0; };
      */

      // Add adt constructors / methods to the evaluator
      for (key in selfProto)
        switch(key) {
          case 'eval':
          case 'recurse':
          case 'recursive':
            continue;  // Warning? trying to overide standard functions
          default:
            if (key !== 'eval') {
              if (typeof selfProto[key] === 'function')
                // Custom evaluator
                evaluator[key] = (function(key){ return function(){ return selfProto[key].apply(self, arguments); }; })(key);
              else 
                // Constant constructor (return the constant value)
                evaluator[key] = (function(key){ return function(){ return selfProto[key]; }; })(key);
            }
        }

      /* TODO: Can't work right now because the data isn't available
      // Create an identity constructor for the default constructor if none was supplied
      if (typeof selfProto['_'] === 'undefined') {
        selfProto['_'] = function(data){ return data; };
        evaluator['_'] = function(){ return selfProto['_'].apply(self, arguments); }
      }*/
      
      return evaluator;
    };

  // Automatically create constructors for any dispatch table
  adt.constructors = function(obj) {
    var key, keys = [];
    if (obj != null)
      for (key in obj)
        keys.push(key);
    return adt.apply(null, keys);
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

    // TODO: id's will be escaped...

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
          case '"': 
          case '\'':
            return lexString(str);
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
        throw "No data given after empty opening parenthesis `(`.";
      var
        key = unescapeString(input[0]),
        tail = input.slice(1),
        args = [key];
      if (input.length > 0 && input[0] === '(')
        throw "Invalid double opening parentheses `((` found."
      while (tail.length > 0)
        switch (tail[0]) {
          case ']':
          case ',':
            throw "Invalid character `" + tail[0] + "` found in the data."
          case ')':
            return { result: adt.construct.apply(null, args), tail: tail.slice(1) };
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
        throw "No closing bracket found for array [...";
      // TODO...
      //return tail;
      throw "TODO: Parsing arrays not yet implemented";
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
      throw "Unexpected token `" + head + "` in data.";
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
    exports.adt = adt;
  return adt;
})();

