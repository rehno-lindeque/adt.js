# adt.js

**adt.js** is a language extension for JavaScript - in library form!
It embodies an unusual interpretation of [Algebraic Data Types (ADT's)](http://en.wikipedia.org/wiki/Algebraic_data_type) repurposed for a dynamic scripting language (JavaScript).

In practice this library gives you access to the following programming facilities:

* Structural [pattern matching](http://en.wikipedia.org/wiki/Pattern_matching).
* Various forms of [polymorphism](http://en.wikipedia.org/wiki/Polymorphism_%28computer_science%29) and [dynamic dispatch](http://en.wikipedia.org/wiki/Dynamic_dispatch).

Essentially, **adt.js** lets you eval structured data which turns out to be very useful for building [embedded domain specific languages (EDSL's)](http://en.wikipedia.org/wiki/Embedded_domain-specific_language#Usage_patterns) in JavaScript.

## Usage

ADT's in **adt.js** are described by interfaces that consist of *constructors* and *evaluators*.

* *constructors* are used to build and annotate hierarchical data structures (a.k.a. boxing data)
* *evaluators* deconstruct data structures using pattern matching (a.k.a. unboxing data)

The library is stratified into several major versions each of which trades some additional features at the expense of a little bit of internal complexity.

**Released:**

None yet!

**Roadmap:**

* *Version 1* (Unreleased)
  * Pattern match on the constructor names only
* *Version 2* (Unreleased)
  * Recursive evaluators
* *Version 3* (Unreleased)
  * Shallow pattern matching (matches nested constructor names and built-in (primitive) types)
* *Version 4* (Unreleased)
  * Deep pattern matching (multiple levels of constructor nesting)
  * JavaScript built-in (primitive) types behave like constructor names in patterns
* *Version 5* (Unreleased)
  * Higher order `fold` function for constructing finite state machines
* *Version 6* (Unreleased)
  * Primitive values can be matched inside of their built-in types
  * Use regular expressions in evaluator patterns

The simplest way to illustrate the utility of **adt.js** is to run through a couple of basic examples, using *only* constructors and evaluators.

### Version 1.0

#### Dispatch on built-in object classes

The most basic application of **adt.js** is to provide dispatch on data types.
In this first example we'll construct an interface called `literalClass` consisting of *evaluators* that match JavaScript's built-in data types.

```javascript
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
```

    Result:
    <span class='numeric'>2.75</span>

Of course, you may think that this piece of code is entirely trivial...

    Note: What is wrong with the following snippet of code?
    literalClass = { object: 'record', array: 'list' }[typeof []];

Most of the time you'll want your evaluators to do something more than simply returning a constant value.
The next example dispatches to functions in order to perform more complex evaluations.
The object itself is passed into the matching evaluator as an argument.
Notice that to deconstruct the argument of type `Array` evaluators interface is invoked recursively by calling `this(...)` on each of the elements.

```javascript
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
```

    Result:
    <ol>
    <li><span class='text'>hello</span></li>
    <li><span class='numeric'>2.7</span></li>
    <li><ol>
    <li><span class='text'>a</span></li>
    <li><span class='text'>b</span></li>
    </ol></li>
    <li><span class='record'>{"foo":"bar"}</span></li>
    <li><span class='numeric'>8</span></li>
    </ol>

This kind of automatic type matching relies on the internal `[[Class]]` property of JavaScript objects.
In practice this means it works on the following built-in objects (from the [ECMAScript 5 specification](http://es5.github.com/#x15.2.4.2))...

<table>
  <thead><tr><th>Built-in data types</th></tr></thead>
  <tbody>
    <tr><td>Arguments</td></tr>
    <tr><td>Array</td></tr>
    <tr><td>Boolean</td></tr>
    <tr><td>Date</td></tr>
    <tr><td>Error</td></tr>
    <tr><td>Function</td></tr>
    <tr><td>JSON</td></tr>
    <tr><td>Math</td></tr>
    <tr><td>Number</td></tr>
    <tr><td>Object</td></tr>
    <tr><td>RegExp</td></tr>
    <tr><td>String</td></tr>
    <tr><td>Null</td></tr>
    <tr><td>Undefined</td></tr>
  </tbody>
</table>

Regrettably, due to a flaw in the language design it is not tractable to implement pattern matching for custom object constructors (invoked via `new` or bypassed via `Object.create`) in a reliable manner.
(This is, unfortunately, only aggravated by the non-standard constructor [name property](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/Name).)

#### Custom constructors

**adt.js** provides a way of creating your own custom data type constructors.
In fact: in this library constructors are simply evaluators that *box* their arguments rather than *unboxing* them.
Once again, a set of constructors is defined inside an *interface*.
When `adt(...)` is called with strings (or even numbers) as arguments the library assumes these are *tags* and automatically generates constructor functions for each one.
Constructors and evaluators can be mixed together in a single interface without any problems.

```javascript
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
```

    Result:
    su.per - cal.i - frag.i.lis.tic - ex.pi.al.i.do.cious

Unlike the built-in data types a custom constructor can box any number of values passed in as arguments - or none at all.

#### The underscore fall through pattern

To create an evaluator that matches any pattern not handled by the rest of the interface, use the `_` pattern.
By default, **adt.js** assigns the identity function to `_`. 

If you want to enforce exhaustive pattern matching in your interfaces you will need to implement the error check yourself. 
To see which pattern was matched **adt.js** assigns `this._pattern` in all evaluators, including `_`.

```javascript
var 
  cons = adt('A','B','C'),
  eval = adt({
    A: function() { return "matched A"; },
    B: function() { return "matched B"; },
    _: function() { throw "Unknown data type `" + this._pattern + "`"; }
  });
try {
  console.log(eval(cons.A());
  console.log(eval(cons.C());
} catch(error) {
  console.log(error);
}
```

    Result:
    matched A test.js:87
    Unknown data type `C`

#### The this parameter, private members and reserved members.

As you have already seen, an interface can be invoked recursively using `this(...)`.
In fact in **adt.js** `this` is exactly the interface that is being evaluated.
It also allows us to write things like the following...

```javascript
TODO
```

Any key in an interface that is prefixed by an underscore is considered to be *private* and will not be included.

Inside an evaluator **adt.js** attaches its own private members to `this`.
Besides `this._pattern`, **adt.js** also provides.... (TODO)

* `this._eval` - TODO (this is a private member, but still accessible to the outside world - it may be useful at times for extending **adt.js**)
* `this._tag` - TODO
* `this._datatype` - TODO

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

To avoid the tedium of calling `this(...)` on each argument of the ADT when evaluating them in a recursive manner you can simply wrap up your interface in `adt.recursive(...)`.

```javascript
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
  answer = calc(expr), // <- Recursively call the calc evaluator
  detailedAnswer = serialize(expr) + " = " + String(answer); // <- Recursively call the serialize evaluator
```

One convenient aspect of `adt.recursive is that it works with non-evaluator functions too.

```javascript
TODO... 
adt.recursive(function(a) { return a; });
```

See also [language-oriented programming](http://en.wikipedia.org/wiki/Language-oriented_programming).

### Automatic constructors

```javascript
  mathOps = {
    plus: function(a,b) { return a + b; },
    mul: function(a,b) { return a * b; }
  },
  mathEval = adt.recursive(adt(mathOps)),
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

adt.js provides a [fold](http://en.wikipedia.org/wiki/Fold_(higher-order_function)) method for evaluators that can be used to write [fsm](http://en.wikipedia.org/wiki/Finite-state_machine)'s... (TODO)

```javascript
  TODO
```

## ADT extras

You can find additional utilities for manipulating and building ADT's in the [adt-util.js](https://github.com/rehno-lindeque/adt-util.js)submodule.

* TODO: Move `adt.compose()` here... + example (pretty print a tree...)
* TODO: Move `adt.constructors()` here + example
* TODO: Move `adt.own` here + example
* TODO: Perhaps move `adt.fold` here? + example (finite state machine)

In addition to this generic funcionality, there are also some existing ADT definitions in other submodules for you to use.

* [adt-html.js](https://github.com/rehno-lindeque/adt-html.js) - A library for constructing, traversing and transforming HTML structures and their attributes.

## Advanced usage

Using only a few primitive programming constructs ADT's never-the-less give rise to a suprisingly large variety of programming patterns.
**adt.js** also exposes few more advanced features that happen to fit snugly with JavaScript's dynamic philosophy.

### Version 1.0

#### Accessing ADT arguments directly

```javascript
TODO a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
```

#### Shortening constructor code

With interface that have lengthy names, creating large structures can get somewhat heavy handed! For example...

```javascript
tree = BinarySearchTree.Node(5,
  BinarySearchTree.Node(3,
    BinarySearchTree.Leaf(1),
    BinarySearchTree.Leaf(4)
  ),
  BinarySearchTree.Node(9,
    BinarySearchTree.Leaf(7),
  )
)
```

Instead we can create an anonymous function and pass in the `BinarySearchTree` interface as `this`. For example:

```javascript
tree = (function(){
  return this.Node(5,
    this.Node(3,
      this.Leaf(1),
      this.Leaf(4)
    ),
    this.Node(9,
      this.Leaf(7)
    )
  )
}).call(BinarySearchTree);
```

This is the convention that many **adt.js** based libraries use and is the recommended form, primarily because it is very efficient in [CoffeeScript](http://coffeescript.org/):

```coffeescript
tree = (->
  (@Node 5,
    (@Node 3,
      (@Leaf 1),
      (@Leaf 4)
    ),
    (@Node 9,
      (@Leaf 7)
    )
  )
).call BinarySearchTree
```

Or even shorter... (however, take care with this syntax - CoffeeScript has many strange corner cases in its parser)

```coffeescript
tree = (->
  @Node 5,
    @Node 3,
      @Leaf 1
      @Leaf 4
    @Node 9,
      @Leaf 7
).call BinarySearchTree
```

An alternative form (which is shorter to write in regular JavaScript but conflicts with the [underscore.js](http://underscorejs.org/) library) is to use the `_` underscore character as follows.

```javascript
tree = (function(){
  return _.Node(5,
    _.Node(3,
      _.Leaf(1),
      _.Leaf(4),
    ),
    _.Node(9,
      _.Leaf(7)
    )
  )
})(_);
```

Finally, it is also possible to use the `with` keyword. However, you should be aware that `with` is deprecated in [ECMAScript 5.0 Strict](https://developer.mozilla.org/en/JavaScript/Strict_mode) and its use is frowned upon by most JavaScript programmers. This is also completely unsuppported in CoffeeScript.

```javascript
with(BinarySearchTree){
  tree = Node(5,
    Node(3,
      Leaf(1),
      Leaf(4)
    ),
    Node(9,
      Leaf(7)
    )
  );
}
```

##### Evaluators with state

* TODO: Example of `evalWith`

### Version 2.0

#### Private members and reserved names

When an evaluator is eval'ed the whole set of evaluators is passed in as the `this` parameter (read it as "this DSL implementation").

```javascript
  // TODO...
  peano = adt({
    succ: adt('succ').succ, // TODO: CAN BE BETTER...
    zero: 0,
    one: function() { return this.succ(this.zero()); },
    two: function() { return this.succ(this.one()); },
    three: function() { return this.succ(this.two()); },
    four: function() { return this.succ(this.three()); }
  });
```

The following private member names are reserved for use by **adt.js** (your own private members will be replaced).

* `_pattern`: Gives you access to the pattern that was matched in order to unbox the evaluator's arguments
* `_tag`: Is the same as `_pattern` in version 1 and 2 of **adt.js**.
* `_datatype`: Is either `typeof arguments[0]` or `'adt'` depending on whether the evaluated argument was a built-in (primitive) type or an ADT.
* **TODO: perhaps `_full_pattern`: `(pattern _tag (pattern ... (pattern ...) ...)`** (breadth-first tree of patterns)

```javascript
  // Yes, yes... we know - "this succ". Very funny wise guy.
  thisSucc = function() { this.succ(this[this._pattern]()); };
  word = adt('zero','one','two','three','four');

  wordToPeano = adt.recursive(adt({
    succ: adt('succ'),
    zero: 0,
    _: thisSucc
  }));
  wordToNumber = adt.recursive(adt({
    succ: function(num) { return num++; },
    zero: 0,
    _: thisSucc
  }));

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
  MathEval = adt.recursive(adt.own(Math)),
  formula = MathCons.pow(MathCons.random(), MathCons.cos(0.1)),
  result = MathEval(formula);
```

#### Combining ADT's

```javascript
  mathCons = adt(adt.own.constructors(Math), adt('plus', 'minus', 'mul', 'div')),
  // or equivalently:
  // mathCons = adt(adt.own.constructors(Math), 'plus', 'minus', 'mul', 'div'),
  mathEval = adt.recursive(adt(adt.own(Math), adt({
    plus: function(a,b) { return a + b; },
    minus: function(a,b) { return a - b; }
    mul: function(a,b) { return a * b; }
    div: function(a,b) { return a / b; }
  }))),
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
  mathEval = adt.recursive(adt({
    plus: function(a,b) { return a + b; },
    mul: function(a,b) { return a * b; }
  })),
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

* A 'variable' is a symbol that stands in the place of some quantity (data)
* A 'type' or - more precisely - 'data type' annotates a variable with a logical proposition about the quantity that the variable denotes (in other words, a type annotates the variable not the value it denotes and therefore should be considered a compile-time concept)
* An 'algebraic data type' (or ADT) annotates the variable's **quantity** with type information about the data (that can only be accessed at run-time by the application)
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
See if you can apply the following concepts:

* [Multiple dispatch](http://en.wikipedia.org/wiki/Multiple_dispatch)
* [Function overloading (ad-hoc polymorphism)](http://en.wikipedia.org/wiki/Method_overloading)
* [Operator overloading](http://en.wikipedia.org/wiki/Operator_overloading)
* [Variant type](http://en.wikipedia.org/wiki/Variant_type)

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

## Future work

Some other features being considered:

* Naked interfaces (avoid monkey patching evaluator keys onto interfaces for better performance)

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
  churchNat = adt.recursive(adt(nat, {
    0: function(f) { return function(n) { return n; }; },
    succ: function(f) { return function(n) { return f(n); }; }
  }));

  console.log("Church numerals: ");
  console.log("church(0) = ", churchNat[0]());
  console.log("church(1) = ", churchNat[1]());
  console.log("church(2) = ", churchNat[2]());
  console.log("church(5) = ", churchNat[5]());

  // Let's pretend that "peano" is simply the boxed edition of church numerals (via a 'succ' constructor)...
  // (I.e. 'succ' is interpreted as a logical proposition that annotates the value it wraps)
  peanoNat = adt.recursive(adt(nat, { succ: adt('succ') }));

  console.log("Peano numbers: ");
  console.log("peano(0) = ", peanoNat[0]());
  console.log("peano(1) = ", peanoNat[1]());
  console.log("peano(2) = ", peanoNat[2]());
  console.log("peano(5) = ", peanoNat[5]());

  /* SIDE-NOTE:
     To assert the correctness of the proposition (i.e. provide proof-carying code)
     one might consider writing
     succ: function (n) { 
       assert(arguments.length == 1 && (n === 0 || (adt.isBoxed(n) && adt.getTag(n) === 'succ')));
       return adt('succ')(n); 
     }
     Unfortunately this kind of induction is not really enforcable since `succ` can be applied 
     outside of `peanoNat` and an expression built using `peanoNat` is not read-only.
     For a "fun" time, try to imagine how ecmascript5 `Object.defineProperty` could be used to
     construct truely enforcable proof-carrying code.
     (Hint: by-reference equality is necessary to guarantee uniqueness of the constructor name)
  */


  // Convert a nat to a javascript number
  numberNat = adt.recursive(adt(nat, { 
    succ: function(num) { return num + 1; },
  }));

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
  arithNat = adt.recursive(adt({
    '+': function(a,b) { /* todo... */ },
    '-': function(a,b) { /* todo... */ },
    '*': function(a,b) { /* todo... */ },
    'exp': function(a,b) { /* todo... */ }
  }));
```

### Rule 110

```javascript
var
  rule110 = adt({
    111: 0,
    110: 1,
    101: 1,
    100: 0,
    011: 1,
    010: 1,
    001: 1,
    000: 0
  });
```

TODO...

### Safe multi-target SQL serialization

### Huffman tree
