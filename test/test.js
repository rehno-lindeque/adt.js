console.log("-- Test 1 (Built-in types - dispatch values) --");
(function(){
  // Pretty print various primitive types
  var
    literalClass = adt({
      Number: 'numeric',
      String: 'text',
      Array: 'list'
    }),
    value = 2.75,
    html = "<span class='" + literalClass(value) + "'>" + String(value) + "</span>";
  console.log(html);
})();

console.log("-- Test 2 (Built-in types - dispatch functions) --");
(function(){
  // Pretty print with function dispatch
  var
    prettyPrintLiteral = adt({
      Number: function(val) { return "<span class='numeric'>" + String(val) + "</span>" },
      String: function(val) { return "<span class='text'>" + val /*TODO: htmlEncode(val)*/ + "</span>" },
      Object: function(val) { return "<span class='record'>" + JSON.stringify(val) + "</span>" },
      Array: function(val) { 
        return "<ol>\n" + val.map(function(a){ return "<li>" + this(a) + "</li>\n"; }, this).join('') + "</ol>";
      }
    }),
    html = prettyPrintLiteral(["hello", 2.7, ["a","b"], { foo: "bar" }, 8]);
  console.log(html);
})();

console.log("-- Test 3 (Custom constructors) --");
(function(){
var 
  D = adt('Word', 'Root', 'Syllable'),
  supercalifragilisticexpialidocious =
    D.Word(
      D.Root(
        D.Syllable('su'),
        D.Syllable('per')),
      D.Root(
        D.Syllable('cal'),
        D.Syllable('i')),
      D.Root(
        D.Syllable('frag'),
        D.Syllable('i'),
        D.Syllable('lis'),
        D.Syllable('tic')),
      D.Root(
        D.Syllable('ex'),
        D.Syllable('pi'),
        D.Syllable('al'),
        D.Syllable('i'),
        D.Syllable('do'),
        D.Syllable('cious'))),
  serializeD = adt({
    Word: function() {
      var 
        children = [],
        i;
      for (i = 0; i < arguments.length; ++i)
        children.push(this(arguments[i]));
      return children.join(' - ');
    },
    Root: function() {
      var 
        children = [],
        i;
      for (i = 0; i < arguments.length; ++i)
        children.push(this(arguments[i]));
      return children.join('.');
    },
    Syllable: function(syl) { return syl; }
  });
console.log(serializeD(supercalifragilisticexpialidocious));
})();

console.log("-- Test ? (Fall through error) --");
(function(){
  var 
    cons = adt('A','B','C'),
    eval = adt({
      A: function() { return "matched A"; },
      B: function() { return "matched B"; },
      _: function() { throw "Unknown data type `" + this._pattern + "`"; }
    });
  try {
    console.log(eval(cons.A()));
    console.log(eval(cons.C()));
  } catch(error) {
    console.log(error);
  }
})();

console.log("-- Test 4 (multiple implementations) --");
(function(){
  var 
    transportation,
    travelFare,
    travelTime,
    tripToGrandma,
    costOfTripToGrandma,
    timeOfTripToGrandma;

  transportation = adt('car','train','plane');
  console.log("transportation: ", transportation);
  travelFare = adt({
    car: function(miles) { return miles * 0.3; },
    train: function(miles,speed) { return miles * 0.1 + 0.2 * speed; },
    plane: function(miles) { return miles * miles * 0.3 + 22.0; }
  });
  travelTime = adt({
    car: function(miles) { return miles / 55.3; },
    train: function(miles,speed) { return 0.5 + miles / 60.0; },
    plane: function(miles) { return (miles < 600? 2.5 : 4.0) + miles / 300.0; }
  });
  tripToGrandma = transportation.train(52, 0.6);
  console.log("trip to grandma: ", tripToGrandma);
  costOfTripToGrandma = travelFare(tripToGrandma);
  console.log("cost of trip to grandma: ", costOfTripToGrandma);
  timeOfTripToGrandma = travelTime(tripToGrandma);
  console.log("time of trip to grandma: ", timeOfTripToGrandma);
})();

(function(){
  console.log("-- Test 5 (nested expressions) --");
  (function(){
    var
      math = adt('plus', 'mul'),
      calc = adt.recursive(adt({
        plus: function(a,b) { return a + b; },
        mul: function(a,b) { return a * b; }
      })),
      serialize = adt.recursive(adt({
        plus: function(a,b) { return "(" + String(a) + " + " + String(b) + ")"; },
        mul: function(a,b) { return "(" + String(a) + " * " + String(b) + ")"; }
      })),
      expr = math.mul(math.plus(5, 9), math.plus(33, math.mul(20, 1))),
      answer = calc(expr),
      detailedAnswer = serialize(expr) + " = " + String(answer);
    console.log("detailed answer: ", detailedAnswer);
  })();

  console.log("-- Test 5.1 (recurse using a function) --");
  (function(){
    var 
      r = adt("A","B","C"),
      printDepth = adt.recursive(function() { 
        var i, d = 0;
        for (i = 0; i < arguments.length; ++i)
          d = Math.max(d, arguments[i]);
        return d + 1;
      }),
      printTrace = adt.recursive(function() { 
        var i, s = arguments.length > 0? arguments[0] : "";
        for (i = 1; i < arguments.length; ++i)
          s += " -> " + arguments[i];
        return s.length > 0? s + " -> " + this._tag : this._tag;
      }),
      A = r.A(),
      A_B = r.A(r.B()),
      A_B_C = r.A(r.B(r.C())),
      A_BC = r.A(r.B(), r.C());
    console.log("depth: " + printDepth(A) + "  trace: " + printTrace(A));
    console.log("depth: " + printDepth(A_B) + "  trace: " + printTrace(A_B));
    console.log("depth: " + printDepth(A_B_C) + "  trace: " + printTrace(A_B_C));
    console.log("depth: " + printDepth(A_BC) + "  trace: " + printTrace(A_BC));
  })();
})();

console.log("-- Test 6 (automatic constructors) --");
(function(){
  var
    mathOps = {
      plus: function(a,b) { return a + b; },
      mul: function(a,b) { return a * b; }
    },
    mathEval = adt.recursive(adt(mathOps)),
    mathCons = adt.constructors(mathOps),
    // or equivalently: mathCons = adt.constructors(mathEval)
    expr = mathCons.mul(mathCons.plus(5, 9), mathCons.plus(33, mathCons.mul(20, 1))),
    answer = mathEval(expr);
  console.log("answer: ", answer);
})();

console.log("-- Test 7 (non-enumerable api's) --");
(function(){
  var
    MathCons = adt.own.constructors(Math),
    MathEval = adt.recursive(adt.own(Math)),
    formula = MathCons.pow(MathCons.random(), MathCons.cos(0.1)),
    result = MathEval(formula);
  console.log("result: ", result);
})();

console.log("-- Test 8 (combining adt's) --");
(function(){
  var
    mathCons = adt(adt.own.constructors(Math), adt('plus', 'minus', 'mul', 'div')),
    // or equivalently:
    // mathCons = adt(adt.own.constructors(Math), 'plus', 'minus', 'mul', 'div'),
    mathEval = adt.recursive(adt(adt.own(Math), adt({
      plus: function(a,b) { return a + b; },
      minus: function(a,b) { return a - b; },
      mul: function(a,b) { return a * b; },
      div: function(a,b) { return a / b; }
    }))),
    // or equivalently:
    // mathEval = adt(adt.own(Math), { ... }),
    formula = mathCons.pow(mathCons.plus(0.5, 3.9), mathCons.mul(0.1, mathCons.exp(4.3))),
    result = mathEval(formula);
  console.log("result: ", result);
})();

console.log("-- Test 9 (serialize) --");
(function(){
  // Serialize expression
  var
    mathCons = adt('plus', 'mul'),
    expr = mathCons.mul(mathCons.plus(5.0,22), mathCons.mul(0.1,0.1)),
    exprSerialized = adt.serialize(expr);
  console.log("expression: ", expr);
  console.log("expression serialized: ", exprSerialized);
})();

console.log("-- Test 10.1 (deserialize) --");
(function(){
  var
    mathEval = adt.recursive(adt({
      plus: function(a,b) { return a + b; },
      mul: function(a,b) { return a * b; }
    })),
    exprSerialized = "(mul (plus 5.0 22) (mul 0.1 0.1))",
    exprDeserialized = adt.deserialize(exprSerialized),
    result = mathEval(exprDeserialized),
    detailedResult = exprSerialized + " = " + String(result);
  console.log("expression deserialized: ", exprDeserialized);
  console.log("detailed result: ", detailedResult);
})();

console.log("-- Test 10.2 (deserialize adt in array) --");
(function(){
  var
    exprSerialized = "[arrayelement 0.1 0.1,anotherelement argumentlessconstructor \"astring\"]",
    exprDeserialized = adt.deserialize(exprSerialized),
    exprReserialized = adt.serialize(exprDeserialized);
  console.log("expression deserialized: ", exprDeserialized);
  console.log("expression re-serialized: ", exprReserialized);
})();

console.log("-- Test 11 (advanced serialize: special case primitives (string, array, records, strings with escapes)) --");
(function(){
  var
    outerCons = adt('list', 'record'),
    innerCons = adt('foo', 'bar'),
    list = outerCons.list([
      innerCons.foo(111),
      innerCons.bar("Bar"),
      innerCons.foo(innerCons.bar())
    ]),
    record = outerCons.record({
      fooKey: innerCons.foo(111),
      barKey: innerCons.bar("Bar"),
      fooBarKey: innerCons.foo(innerCons.bar())
    }),
    listSerialized = adt.serialize(list),
    recordSerialized = adt.serialize(record);
  console.log("list serialized: ", listSerialized);
  console.log("record serialized: ", recordSerialized);
  
  console.warn("TODO: more....");
})();

console.log("-- Test 12 (advanced deserialize: special case primitives (string, array, records, strings with escapes)) --");
(function(){
  var
    exprSerialized = "{ foo=\"bar\", something = 5,array = [Cons 9] , anEmptyRecord ={} }",
    exprDeserialized = adt.deserialize(exprSerialized),
    exprReserialized = adt.serialize(exprDeserialized);
  console.log("expression deserialized: ", exprDeserialized);
  console.log("expression re-serialized: ", exprReserialized);
})();

console.log("-- Test 13 (advanced serialize: constructor keys with escapes) --");
(function(){
  escapedCons = adt('cons with spaces', 'cons\'quote', 'cons\"dbl\"quote');
  a = escapedCons['cons with spaces'](0, escapedCons['cons\'quote'](1, escapedCons['cons\"dbl\"quote'](2)));
  aSerialized = adt.serialize(a);
  console.log("cons: ", a);
  console.log("cons serialized with escapes: ", aSerialized);
})();

console.log("-- Test 14 (advanced deserialize: constructor keys with escapes) --");
(function(){
  var
    aSerialized = "cons\\ with\\ spaces 0 (cons\\\'quote 1 (cons\\\"dbl\\\"quote 2))";
  console.log("cons serialized with escapes: ", aSerialized);
  a = adt.deserialize(aSerialized);
  console.log("cons with escapes deserialized: ", a);
  console.log("cons serialized again: ", adt.serialize(a));
})();

console.log("-- Test 15 (advanced deserialize: optional outer parentheses) --");
(function(){
  console.warn("TODO")
})();

console.log("-- Test 16 (advanced deserialize: direct primitive (number, string, array, record) --");
(function(){
  console.warn("TODO")
})();

console.log("-- Test 17 (advanced deserialize: numeric escapes in strings) --");
(function(){
  var
    decSerialized = "DecimalEscape \"An arrow looks like this: \\8594 (\\\\8594)\"",
    hexSerialized = "HexadecimalEscape \"An arrow looks like this: \\x2192 (\\\\x2192)\"",
    octSerialized = "OctalEscape \"An arrow looks like this: \\o20622 (\\\\o20622)\"";
  console.log("string serialized with numeric decimal escape: ", decSerialized);
  console.log("string serialized with numeric hexadecimal escape: ", hexSerialized);
  console.log("string serialized with numeric octal escape: ", octSerialized);
  var 
    decDeserialized = adt.deserialize(decSerialized),
    hexDeserialized = adt.deserialize(hexSerialized),
    octDeserialized = adt.deserialize(octSerialized);
  console.log("string with numeric decimal escape deserialized: ", decDeserialized);
  console.log("string with numeric hexadecimal escape deserialized: ", hexDeserialized);
  console.log("string with numeric octal escape deserialized: ", octDeserialized);
})();

console.log("-- Test 18.1 (shallow pattern matching) --");
(function(){
  var
    cons = adt('Cons'),
    evalCallInfo = adt({
      "Cons String Number": function(a,b) { return "Cons " + a + " " + String(b); },
      "Cons Cons Number": function(a,b) { return "Cons (" + a._tag + " \"" + a[0] + "\" \"" + a[1] + "\") " + String(b); },
      _: function() { throw "Could not match pattern " + this._pattern; }
    });
  console.log("The `Cons String Number` evaluated:              ", evalCallInfo(cons.Cons("zed", 11)));
  console.log("The `Cons (Cons String String) Number` evaluated:", evalCallInfo(cons.Cons(cons.Cons("foo", "bar"), 55)));
})();

console.log("-- Test 18.2 (shallow pattern matching + tuples) --");
(function(){
  var
    cons = adt('Cons'),
    evalCallInfo = adt({
      "String,Number": function(a,b) { return "\"" + a + "\"," + String(b); },
      "Number,String": function(a,b) { return String(a) + ",\"" + b + "\""; },
      "Cons,Number,Cons Number String": function(a,b,c,d,e) {
        return "Cons \"" + a + "\" " + String(b) + ","
          + String(c) 
          + ",Cons " + String(d) + " \"" + e + "\""; },
      _: function() { throw "Could not match pattern " + this._pattern; }
    });
  console.log("The `String,Number` evaluated:                               ", evalCallInfo("foo", 88));
  console.log("The `Number,String` evaluated:                               ", evalCallInfo(55, "bar"));
  console.log("The `Cons String Number,Number,Cons Number String` evaluated:", evalCallInfo(cons.Cons("zed", 11), 101, cons.Cons(22, "foo")));
})();

console.log("-- Test 19.1 (deep pattern matching) --");
(function(){
  var
    cons = adt('Cons'),
    evalCallInfo = adt({
      "Cons (Cons String String) (Cons Number Number)": function(a,b) { return "(Cons (Cons \"" + a[0] + "\" \"" + a[1] + "\") (Cons " + String(b[0]) + " " + String(b[1]) + "))"; },
      "(Cons Number Number)": function(a) { return "(Cons " + String(a[0]) + " " + String(a[1]) + ")"; },
      _: function() { throw "Could not match pattern " + this._pattern; }
    });
  console.log("The `Cons (Cons String String) (Cons Number Number)` evaluated:", evalCallInfo(cons.Cons(cons.Cons("foo", "bar")), cons.Cons(33, 44)));
  console.log("The `(Cons Number Number)` evaluated:                          ", evalCallInfo(cons.Cons(88,99)));
})();

console.log("-- Test 19.2 (deep pattern matching + tuples) --");
(function(){
  var
    cons = adt('Cons'),
    evalCallInfo = adt({
      "(String,Number)": function(a,b) { return "(\"" + a[0] + "\"," + String(a[1]) + ")"; },
      "(Number,String)": function(a) { return "(" + String(a[0]) + ",\"" + a[1] + "\")"; },
      "(Cons, Cons Number String)": function(a,b) { 
        return "(Cons \"" + a[0][0] + "\" " + String(a[0][1]) + ","
          + "(Cons " + String(a[1][0]) + " \"" + a[1][1] + "\")" ; },
      _: function() { throw "Could not match pattern " + this._pattern; }
    });
  console.log("The `(String,Number)` evaluated...     ", evalCallInfo("foo", 88));
  console.log("The `(Number,String)` evaluated...     ", evalCallInfo(55, "bar"));
  console.log("The `(Cons String Number, Cons Number String)` evaluated...", evalCallInfo(cons.Cons("zed", 11), cons.Cons(22, "foo")));
})();

console.log("-- Test 19.3 (deep pattern matching + cons unpacking) --");
(function(){
  var
    cons = adt('Cons'),
    evalCallInfo = adt({
      "Cons (Cons :String String) (Cons :Number :Number)": function(a,b) { return "(Cons (Cons \"" + a[0] + "\" \"" + a[1] + "\") (Cons " + String(b[0]) + " " + String(b[1]) + "))"; },
      "(Cons :Number :Number)": function(a,b) { return "(Cons " + String(a[0]) + " " + String(a[1]) + ")"; },
      _: function() { throw "Could not match pattern " + this._pattern; }
    });
  console.log("The `Cons (Cons String String) (Cons Number Number)` evaluated:", evalCallInfo(cons.Cons(cons.Cons("foo", "bar")), cons.Cons(33, 44)));
  console.log("The `(Cons Number Number)` evaluated:                          ", evalCallInfo(cons.Cons(88,99)));
})()

console.log("-- Test 19.4 (deep pattern matching + tuple unpacking) --");
(function(){
  var
    cons = adt('Cons'),
    evalCallInfo = adt({
      "(:String,:Number)": function(a,b) { return "(\"" + a + "\":String," + String(b) + ":Number)"; },
      "(Cons :String :Number)": function(a,b) { return "(Cons \"" + a + "\":String " + String(b) + ":Number)"; },
      "Cons Number (Cons :Number :String)": function(a,b,c) { 
        return "Cons " + String(a) + " (Cons " + String(b) + ":Number \"" + c + "\")"; },
      "(:Cons,Number,(Cons :Number String))": function(a,b,c) { 
        return "(:Cons \"" + a[0] + "\" " + String(a[1]) + ",Number,(Cons " + String(b) + ":Number String))"; },
      _: function() { throw "Could not match pattern " + this._pattern; }
    });
  console.log("The `(:String,:Number)` evaluated...     ", evalCallInfo("foo", 88));
  console.log("The `(Cons :String :Number)` evaluated...", evalCallInfo(cons.Cons("zed", 11)));
  console.log("The `Cons Number (Cons :Number :String)` evaluated...", evalCallInfo(cons.Cons(22,cons.Cons("zed", 11))));
  console.log("The `(:Cons,Number,Cons :Number String)` evaluated...", evalCallInfo(cons.Cons("zed", 11), 101, cons.Cons(22, "foo")));
})();

console.log("-- Test 19.5 (deep pattern matching + cons/tuple double unpacking) --");
(function(){
  var
    cons = adt('Cons'),
    evalCallInfo = adt({
      ":(Cons :(Cons :String String) :(Cons Number :Number))": function(a,b,c,d,e) { 
        return "...TODO..."; },
      "a:(Cons b:(Cons c:String String),Number,d:Number)": function(a,b,c,d) { 
        return "...TODO..."; },
      _: function() { throw "Could not match pattern " + this._pattern; }
    });
  console.log("TODO...");
})()