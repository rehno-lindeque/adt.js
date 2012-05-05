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
        searchIndex = string.indexOf(str[0], searchIndex);
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
        nextWhiteSpace;
      str = eatWhiteSpace(str);
      if (str.length === 0)
        return ['','']; // empty string
      switch (str[0]) {
        case '(':
        case ')':
        case '"': 
        case '\'':
        case '[':
        case ']':
        case ',': 
          return { head: str[0], tail: str.slice(1) };
      }
      for (var i = 0; i < str.length; ++i) {
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
        }
      }
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
