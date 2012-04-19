# adt.js

**adt.js** is an unusual interpretation of [Algebraic Data Types (ADT)](http://en.wikipedia.org/wiki/Algebraic_data_type) repurposed for a dynamic scripting language (JavaScript).

Essentially, **adt.js** lets you eval structured data. Using OO lingo you could view this library as emulating the following design patterns...

* [Command](http://en.wikipedia.org/wiki/Command_pattern)
* [Visitor](http://en.wikipedia.org/wiki/Visitor_pattern) (depth-first only)
* [Builder](http://en.wikipedia.org/wiki/Builder_pattern)
* [Template method](http://en.wikipedia.org/wiki/Template_method_pattern) (except [better](http://en.wikipedia.org/wiki/Domain-specific_language))

## Usage

ADT's in **adt.js** consist of *constructors* and *evaluators*.

* *constructors* are used to build and annotate hierarchical data structures
* *evaluators* deconstruct the hierarchy using pattern matching

In practice, the library gives you access to the following capabilities

* Structured [pattern matching](http://en.wikipedia.org/wiki/Pattern_matching)
* Evaluators in the form of [state machines](http://en.wikipedia.org/wiki/Finite-state_machine)
* Separation of interface from (multiple) implementations

For example, using adt.js you could do a bunch of cool stuff with expression trees, like

* Defining [Domain Specific Languages (DSL)](http://en.wikipedia.org/wiki/Domain-specific_language) with multiple implementations
* Compilers capable of arbitrarily transforming/reducing/expanding expression trees
* Parsers defined by finite state machines

## What else?

With pattern matching in the mix (in version 2.0 and later) we can talk polymorphism.

* [Multiple dispatch](http://en.wikipedia.org/wiki/Multiple_dispatch)
* [Function overloading (ad-hoc polymorphism)](http://en.wikipedia.org/wiki/Method_overloading)
* [Operator overloading](http://en.wikipedia.org/wiki/Operator_overloading)

If you're more of a FP person, **adt.js** gives you something similar to...

* [Algebraic data types](http://www.haskell.org/haskellwiki/Algebraic_data_type) (obviously)
* [Embedded domain-specific languages](http://en.wikipedia.org/wiki/Domain-specific_language)
* [Enumerator + Iteratee](http://www.haskell.org/haskellwiki/Enumerator_and_iteratee)
* [Lisp](http://en.wikipedia.org/wiki/Lisp_%28programming_language%29), because well, [you know how it is](http://en.wikipedia.org/wiki/Greenspun%27s_tenth_rule).

## Examples

### Version 1.0 

#### Providing multiple implementations

```javascript
  transportation = adt('car', 'train', 'plane'),
  travelFare = adt({
    car: function(miles) { return miles * 0.3; },
    train: function(miles,speed) { return miles * 0.1 + 0.2 * speed; },
    plane: function(miles) { return miles * miles * 0.3 + 22.0; }
  }),
  travelTime = adt({
    car: function(miles) { return miles / 55.3; },
    train: function(miles,speed) { return 0.5 + miles / 60.0; },
    plane: function(miles) { return (miles < 600? 2.5 : 4.0) + miles / 300.0; }
  }),
  tripToGrandma = transportation.train(52, 0.6),
  costOfTripToGrandma = travelFare(tripToGrandma),
  timeOfTripToGrandma = travelTime(tripToGrandma);
```

This example takes object oriented style dispatch and turns it inside-out, 
providing dispatchers based on type names (car, train, plane) instead of method
names (travelFare, travelTime).

See also the [expression problem](http://en.wikipedia.org/wiki/Expression_problem).

#### Constructing and evaluating nested expressions

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
  answer = calc(expr),
  detailedAnswer = serialize(expr) + " = " + String(answer);
```

See also [language-oriented programming](http://en.wikipedia.org/wiki/Language-oriented_programming).

#### Combining ADT's

```javascript
  TODO
```

#### Stateful visitors

```javascript
  TODO
```

#### Automatic serialization (can be used as an alternative to JSON)

```javascript
  TODO
```

### Version 2.0

#### Shallow pattern matching

```javascript
  TODO
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

## Bragging rights

**adt.js** is pretty small for what it accomplishes. In fact, right now it weighs in at only...

* version 1.0 (unreleased, as of 2012-04-19): *5.2 kb* unminified, *1.6 kb* minified
