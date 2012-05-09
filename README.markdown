# adt.js

**adt.js** is an unusual interpretation of [Algebraic Data Types (ADT's)](http://en.wikipedia.org/wiki/Algebraic_data_type) repurposed for a dynamic scripting language (JavaScript).

Essentially, **adt.js** lets you eval structured data which turns out to be very useful for building [embedded domain specific languages (EDSL's)](http://en.wikipedia.org/wiki/Embedded_domain-specific_language#Usage_patterns) in JavaScript.

In practice this library gives you access to the following programming facilities:

* Structured [pattern matching](http://en.wikipedia.org/wiki/Pattern_matching).
* Various forms of polymorphism and method dispatch.

## Usage

ADT's in **adt.js** consist of *constructors* and *evaluators*.

* *constructors* are used to build and annotate hierarchical data structures (a.k.a. boxing)
* *evaluators* deconstruct the hierarchy using pattern matching (a.k.a. unboxing)

The library is stratified into several major versions each of which trades some additional features at the expense of a little bit of internal complexity.

**Released:**

None yet!

**Work in progress:**

* *Version 1* (Unreleased)
  * Pattern match on the constructor names only
* *Version 2* (Unreleased)
  * Recursive evaluators

**Planned:**

* *Version 3*
  * Shallow pattern matching (matches nested constructor names and primitive types)
* *Version 4*
  * Deep pattern matching (multiple levels of constructor nesting)
  * Primitive types behave like constructor names in patterns
* *Version 5*
  * Higher order `fold` function for constructing finite state machines
* *Version 6*
  * Primitive values can be matched inside of their primitive types
  * Use regular expressions in evaluator patterns

The simplest way to illustrate the utility of **adt.js** is to run through a couple of basic examples, using *only* constructors and evaluators.

### Version 1.0

#### Providing multiple implementations

```javascript
  // Create constructors for these three algebraic data types (car, train and plane)
  transportation = adt('car', 'train', 'plane'),

  // Create a set of evaluators for the adt's to calculate a travel fare by unboxing their arguments
  travelFare = adt({
    car: function(miles) { return miles * 0.3; },
    train: function(miles,speed) { return miles * 0.1 + 0.2 * speed; },
    plane: function(miles) { return miles * miles * 0.3 + 22.0; }
  }),

  // Create an alternative set of evaluators for the adt's to calculate a travel time using the same arguments
  travelTime = adt({
    car: function(miles) { return miles / 55.3; },
    train: function(miles,speed) { return 0.5 + miles / 60.0; },
    plane: function(miles) { return (miles < 600? 2.5 : 4.0) + miles / 300.0; }
  }),

  // Now we can calculate not only the time needed to get to grandma's house but also the cost of the trip.
  // So, should we take the train?
  tripToGrandma = transportation.train(52, 0.6),
  costOfTripToGrandma = travelFare(tripToGrandma),
  timeOfTripToGrandma = travelTime(tripToGrandma);
```

This example takes the standard object-oriented style of method dispatch and turns it inside-out!
Instead of dispatching on a method table (travelFare, travelTime) we dispatch on type names (car, train, plane).

See also the [expression problem](http://en.wikipedia.org/wiki/Expression_problem).

### Version 2.0

#### Constructing and evaluating nested expressions

In order to operate on nested expressions it is often useful to make our evaluators *recursive*.
A set of evaluators can be evaluated in a recursive manner by using the `recurse(...)` member function instead of calling it directly.

```javascript
  math = adt('plus', 'mul'),
  calc = adt({
    plus: function(a,b) { return a + b; },
    mul: function(a,b) { return a * b; }
  }),
  serialize = adt({
    plus: function(a,b) { return "(" + String(a) + " + " + String(b) + ")"; },
    mul: function(a,b) { return "(" + String(a) + " * " + String(b) + ")"; }
  }),
  expr = math.mul(math.plus(5, 9), math.plus(33, math.mul(20, 1))),
  answer = calc.recurse(expr), // <- Recursively call the calc evaluator
  detailedAnswer = serialize.recurse(expr) + " = " + String(answer); // <- Recursively call the serialize evaluator
```

...alternatively it is also possible to make a set of evaluators recursive directly
calling `recursive()` so that it is not necessary to call `recurse` explicitly.

```javascript
  math = adt('plus', 'mul'),
  calc = adt({
    plus: function(a,b) { return a + b; },
    mul: function(a,b) { return a * b; }
  }).recursive(),  // <- Make calc recursive
  serialize = adt({
    plus: function(a,b) { return "(" + String(a) + " + " + String(b) + ")"; },
    mul: function(a,b) { return "(" + String(a) + " * " + String(b) + ")"; }
  }).recursive(), // <- Make serialize recursive
  expr = math.mul(math.plus(5, 9), math.plus(33, math.mul(20, 1))),
  answer = calc(expr),
  detailedAnswer = serialize(expr) + " = " + String(answer);
```

See also [language-oriented programming](http://en.wikipedia.org/wiki/Language-oriented_programming).

### Automatic constructors

```javascript
  mathOps = {
    plus: function(a,b) { return a + b; },
    mul: function(a,b) { return a * b; }
  },
  mathEval = adt(mathOps).recursive(),
  mathCons = adt.constructors(mathOps),
  // or equivalently:
  // mathCons = adt.constructors(mathEval)
  expr = mathCons.mul(
    mathCons.plus(5, 9),
    mathCons.plus(33, mathCons.mul(20, 1))),
  answer = mathEval(expr);
```

### Version 3.0

#### Shallow pattern matching

Patterns are tested in the order of most specific to most general...

```javascript
  TODO
```

### Version 4.0

#### Deep pattern matching

```javascript
  TODO
```

### Version 5.0

#### Folding arrays into tree structures using Finite State Machines

adt.js provides a `[fold](http://en.wikipedia.org/wiki/Fold_(higher-order_function))` method for evaluators that can be used to write [fsm](http://en.wikipedia.org/wiki/Finite-state_machine)'s... (TODO)

```javascript
  TODO
```

## ADT extras

You can find additional utilities for manipulating and building ADT's in the [adt-util.js](https://github.com/rehno-lindeque/adt-util.js)submodule.

* TODO: Move `adt.compose()` here... + example
* TODO: Move `adt.constructors()` here + example
* TODO: Move `adt.own` here + example
* TODO: Perhaps move `adt.fold` here? + example (finite state machine)

In addition to this generic funcionality, there are also some existing ADT definitions in other submodules for you to use.

* [adt-html.js](https://github.com/rehno-lindeque/adt-html.js) - A library for constructing, traversing and transforming HTML structures and their attributes.

## Advanced usage

Using only a few primitive programming constructs ADT's never-the-less give rise to a suprisingly large variety of programming patterns.
**adt.js** also exposes few more advanced features that happen to fit snugly with JavaScript's dynamic philosophy.

### Version 1.0

#### Shortening code

* TODO: example of using the `with` keyword with **adt.js** and warning about deprecation in ECMAScript 5.0 Strict.
* TODO: a safer alternative method using the `(function(_){ _.cons(...); })(api);` style syntax
* TODO: another alternative in CoffeeScript, passing in the api as `this` where the `@` character can be used `@cons(...)`...

##### Evaluators with state

* TODO: Example of `evalWith`

### Version 2.0

#### Private members and reserved names

When an evaluator is eval'ed the whole set of evaluators is passed in as the `this` parameter (read it as "this DSL implementation").

```javascript
  // TODO...
  peano = adt({
    succ: adt('succ'),
    zero: 0,
    one: function() { return this.succ(this.zero()); },
    two: function() { return this.succ(this.one()); },
    three: function() { return this.succ(this.two()); },
    four: function() { return this.succ(this.three()); }
  });
```

The following private member names are reserved for use by **adt.js** (your own private members will be replaced).

* `_pattern`: Gives you access to the pattern that was matched in order to unbox the evaluator's arguments
* `_key`: Is the same as `_pattern` in version 1 of **adt.js**.
* **TODO: perhaps `_full_pattern`: `(pattern _key (pattern ... (pattern ...) ...)`** (breadth-first tree of patterns)

```javascript
  // Yes, yes... we know - "this succ". Very funny wise guy.
  thisSucc = function() { this.succ(this[this._pattern]()); };
  word = adt('zero','one','two','three','four');

  wordToPeano = adt({
    succ: adt('succ'),
    zero: 0,
    _: thisSucc
  });
  wordToNumber = adt({
    succ: function(num) { return num++; },
    zero: 0,
    _: thisSucc
  }).recursive();

  four = word.four();
  console.log("The word is '" + adt.serialize(four) + "'");
  // > "The word is 'four'"

  console.log("The peano number:'" + adt.serialize(four)) + "'");
  // > "The number is 'four'"

  // TODO: TO BE CONTINUED....

  wordToPeano(word);
```

For those of you with a computer science bent, see also [Peano axioms](http://en.wikipedia.org/wiki/Peano_axioms) or [Peano numbers](http://www.haskell.org/haskellwiki/Peano_numbers) a.k.a. [Church numerals](http://en.wikipedia.org/wiki/Church_numeral).
Find a more complete/elegant implementation of Peano numbers in the appendix.

#### Wrapping native (non-enumerable) API's (JavaScript >= 1.8.5)

Unfortunately the native `Math` object in JavaScript is not directly enumerable.
To list its properties you need to make use of the [Object.getOwnPropertyNames](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames)
function from the JavaScript 1.8.5 spec.

```javascript
  MathCons = adt.apply(null, Object.getOwnPropertyNames(Math)),
  formula = MathCons.pow(MathCons.random(), MathCons.cos(0.1)),
  // But how do we eval it?
```

As you can see, it is possible to create constructors for the Math object. However,
creating evaluators is more difficult!
Fortunately **adt.js** supplies you with its `own` api which takes care of
enumerating an object's enumerable and non-enumerable properties for you by
leveraging `Object.getOwnPropertyNames`.

```javascript
  MathCons = adt.own.constructors(Math),
  MathEval = adt.own(Math).recursive(),
  formula = MathCons.pow(MathCons.random(), MathCons.cos(0.1)),
  result = MathEval(formula);
```

#### Combining ADT's

```javascript
  mathCons = adt(adt.own.constructors(Math), adt('plus', 'minus', 'mul', 'div')),
  // or equivalently:
  // mathCons = adt(adt.own.constructors(Math), 'plus', 'minus', 'mul', 'div'),
  mathEval = adt(adt.own(Math), adt({
    plus: function(a,b) { return a + b; },
    minus: function(a,b) { return a - b; }
    mul: function(a,b) { return a * b; }
    div: function(a,b) { return a / b; }
  })).recursive(),
  // or equivalently:
  // mathEval = adt(adt.own(Math), { ... }),
  formula = mathCons.pow(mathCons.plus(0.5, 3.9), mathCons.mul(0.1, mathCons.exp(4.3))),
  result = mathEval(formula);
```

#### Automatic serialization (can be used as an alternative to JSON)

Interestingly, if we can easily serialize and deserialize our ADT's we could
actually use them as an alternative to JSON - a safely executable kind of JSON.

```javascript
  // Serialize expression
  mathCons = adt('plus', 'mul'),
  expr = mathCons.mul(mathCons.plus(5.0,22), mathCons.mul(0.1,0.1)),
  exprSerialized = adt.serialize(expr);
  // exprSerialized == "(mul (plus 5.0 22) (mul 0.1 0.1))"
```

```javascript
  // Deserialize expression
  mathEval = adt({
    plus: function(a,b) { return a + b; },
    mul: function(a,b) { return a * b; }
  }).recursive(),
  exprSerialized = "(mul (plus 5.0 22) (mul 0.1 0.1))",
  exprDeserialized = adt.deserialize(exprSerialized),
  result = mathEval(exprDeserialized),
  detailedResult = exprString + " = " + String(result);
```

By the way, can you guess what `serialize` and `deserialize` look like?

#### ADT's with object constructors (??)

**TODO... POSSIBLY...**

And with prototypes and javascript native constructors...

```javascript
  $Cons = adt.constructors($),
  $Eval = adt($),
  $ObjCons = adt.proto.constructors($),
  $ObjEval = adt.proto($),
  hideTheElephant = $ObjCons.constructor('#elephant').hide(),
  showTheElephant = $ObjCons(['constructor', '#elephant'])('show'),
  result = $ObjEval(hideTheElephant);
```

#### Combining ADT's without merging them

```javascript
  // TODO... perhaps something like...

  api = adt({ 
    math: adt.constructors(Math), 
    expr: adt('plus','minus','mul','div') 
  }),
  calc = adt({ 
    math: adt(Math), 
    expr: adt({plus: ..., minus: ..., mul: ..., div: ...})
  }),
  formula = api.math.pow(api.expr.plus(5,10), api.expr.mul(10, api.math.cos(-0.3))),
  result = calc(formula);

```

## More information

**What is a data type and how exactly can it be algebraic?**

There is some confusion around the usage of various terms such as *data types*, *type classes*, *algebraic data types (ADT's)*, *abstract data types (also ADT's)*.
This is all a bit of a tangled mess in my personal opinion and the vocabulary for these terms probably needs an overhaul... but then, what can you do? 
These terms have already been established and are currently in wide-spread use.

So! If you were looking for the textbook answer I'll assume that you'd simply go to wikipedia / google.
What follows here is a common sense practical definition for JavaScript hackers...

* A 'variable' is a symbol that stands in place of some quatity (in our case data)
* A 'type' or 'data type' annotates a variable with a logical proposition about the quantity that the variable represents (this annotation is added to the variable and thus can only be accessed at compile-time)
* An 'algebraic data type' (or ADT) annotates the variable's **quantity** with type information (that can only be accessed at run-time by the application)
  ...additionally algebraic data types works on structured data.

In math *algebraic* usually refers to the ability to manipulate and interpret structures instead of working directly with underlying quantities.
For those of you with an academic slant, this [blog post](http://blog.lab49.com/archives/3011) by Kalani Thielen describes some more meta-algebraic stuff that can be done with ADT's.

**How can I relate to this library given my object-oriented programming background?**

Using OO lingo you could view this library as an emulation of the following design patterns...

* [Command](http://en.wikipedia.org/wiki/Command_pattern)
* [Visitor](http://en.wikipedia.org/wiki/Visitor_pattern) (depth-first only)
* [Builder](http://en.wikipedia.org/wiki/Builder_pattern)
* [Template method](http://en.wikipedia.org/wiki/Template_method_pattern) (except [better](http://en.wikipedia.org/wiki/Domain-specific_language))

With pattern matching thrown into the mix (in version 2.0 and later), we can also talk polymorphism.
See if you can apply the following concepts 

* [Multiple dispatch](http://en.wikipedia.org/wiki/Multiple_dispatch)
* [Function overloading (ad-hoc polymorphism)](http://en.wikipedia.org/wiki/Method_overloading)
* [Operator overloading](http://en.wikipedia.org/wiki/Operator_overloading)

**Actually... I'm a functional programmer, what do you have for me?**

Besides  [Algebraic data types](http://www.haskell.org/haskellwiki/Algebraic_data_type) you mean? 
Well, ostensibly **adt.js** brings you a little bit closer to [Lisp](http://en.wikipedia.org/wiki/Lisp_%28programming_language%29) because, after all, [you know how it is](http://en.wikipedia.org/wiki/Greenspun%27s_tenth_rule).
In combination with [CoffeeScript](http://coffeescript.org/) you can even write [s-expressions](http://en.wikipedia.org/wiki/S-expression).

ADT's built-in serialization is designed to work with [Haskell](http://www.haskell.org/haskellwiki/Haskell)'s default `Read` and `Show` derivations.
So if you happen to be using Haskell server-side there's no need to even convert to json.

**Nice examples, are you using it for anything practical?**

Sure, **adt.js** is being used in both production code as well as in open source projects.
The most obvious application for ADT's is obviously in the construction of compilers.
Pattern matching lends itself to transforming/reducing/expanding expression trees.

**Why the weird license?**

Simplicity - that's all.
When I tell you this code is in the public domain, you know that you're free to do whatever you want with it - for realsies!
No need to figure out whether you need to include the license with your code if all you want is to copy a little snippet of code.
In a library that provides basic language extensions you really don't want to worry about the licensing implications.
Unlike "no bullshit"-style public domain licenses, you know you're also covered in unusual situations where public domain isn't legally recognized (CC0 falls through to an extremely permissive license in this case).
CC0 is also very [easy to understand](http://creativecommons.org/publicdomain/zero/1.0/) and even takes the time to briefly inform you of the practical distinctions between copyright and other legal protections.

## Size of various distributions

* version 1.0 (unreleased, as of 2012-05-04): *14.3 kb* unminified, *5.1 kb* minified

## Appendix

### Natural numbers: Church versus Peano

Now we go on a [Curry-Howard](http://en.wikipedia.org/wiki/Curry-Howard_correspondence) style exploration of the natural numbers.
In other words, we're gonna define `nat` using dual computational and logical interprations (as *church numerals* and *peano numbers* respectively).
In this case peano numbers are boxed by data types and church numerals are boxed by lambda abstractions.
The `numNat` implementation is unboxed (or you might say, boxed by the javascript/machine implementation of numbers).

```javascript
  word = adt('zero','one','two','three','four');

  // Construct natural numbers (either church or peano depending on the implementation of `succ`)
  nat = adt({
    0: 0,
    _: function() { this.succ(this[Number(this._pattern) - 1]()); }
  });

  // Natural numbers implemented using church numerals
  churchNat = adt(nat, {
    0: function(f) { return function(n) { return n; }; },
    succ: function(f) { return function(n) { return f(n); }; }
  }).recursive();

  console.log("Church numerals: ");
  console.log("church(0) = ", churchNat[0]());
  console.log("church(1) = ", churchNat[1]());
  console.log("church(2) = ", churchNat[2]());
  console.log("church(5) = ", churchNat[5]());

  // Let's pretend that "peano" is simply the boxed edition of church numerals (via a 'succ' constructor)...
  // (I.e. 'succ' is interpreted as a logical proposition that annotates the value it wraps)
  peanoNat = adt(nat, { succ: adt('succ') }).recursive();

  console.log("Peano numbers: ");
  console.log("peano(0) = ", peanoNat[0]());
  console.log("peano(1) = ", peanoNat[1]());
  console.log("peano(2) = ", peanoNat[2]());
  console.log("peano(5) = ", peanoNat[5]());

  /* SIDE-NOTE:
     To assert the correctness of the proposition (i.e. provide proof-carying code)
     one might consider writing
     succ: function (n) { 
       assert(arguments.length == 1 && (n === 0 || (adt.isBoxed(n) && adt.getKey(n) === 'succ')));
       return adt('succ')(n); 
     }
     Unfortunately this kind of induction is not really enforcable since `succ` can be applied 
     outside of `peanoNat` and an expression built using `peanoNat` is not read-only.
     For a "fun" time, try to imagine how ecmascript5 `Object.defineProperty` could be used to
     construct truely enforcable proof-carrying code.
     (Hint: by-reference equality is necessary to guarantee uniqueness of the constructor name)
  */


  // Convert a nat to a javascript number
  numberNat = adt(nat, { 
    succ: function(num) { return num + 1; },
  }).recursive();

  console.log("JavaScript numbers: ");
  console.log("number(0) = ", numberNat[0]());
  console.log("number(1) = ", numberNat[1]());
  console.log("number(2) = ", numberNat[2]());
  console.log("number(5) = ", numberNat[5]());


  // Convert a church numeral to a javascript number
  churchToNumber = function(churchNum) { churchNum(numberNat.succ)(0); };

  // Convert a peano number to a javascript number
  peanoToNumber = function(peanoNum) { numberNat(peanoNum); };

  // Words 
  wordToNat = adt({
    zero: this[0](),
    one: this[1](),
    two: this[2](),
    three: this[3](),
    four: this[4]()
  });
  // alternatively { zero: 0, one: 1, two: 2, ... };

  wordToPeano = adt(peanoNat, wordNat);
  wordToNumber = adt(numberNat, wordNat);

  // TODO... (to be continued)
  // ....

  // Church style natural number arithmetic
  arithNat = adt({
    '+': function(a,b) { /* todo... */ },
    '-': function(a,b) { /* todo... */ },
    '*': function(a,b) { /* todo... */ },
    'exp': function(a,b) { /* todo... */ }
  }).recursive();
```
