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
        for (i = searchIndex - 1; i > 0; --i)
          if (str[i] !== '\\') {
            if ((searchIndex - i) & 1 === 1) // There is an even number of slashes
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
