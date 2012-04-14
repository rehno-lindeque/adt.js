# adt.js

**adt.js** is an unusual interpretation of [Algebraic Data Types (ADT)](http://en.wikipedia.org/wiki/Algebraic_data_type) repurposed for a dynamic scripting language (JavaScript).

Essentially, **adt.js** lets you eval structured data. Using OO lingo you could view this library as emulating the following design patterns

* [Command](http://en.wikipedia.org/wiki/Command_pattern)
* [Visitor](http://en.wikipedia.org/wiki/Visitor_pattern)
* [Builder](http://en.wikipedia.org/wiki/Builder_pattern)

## Usage

ADT's in **adt.js** consist of *constructors* and *evaluators*.

* *constructors* are used to build and annotate hierarchical data structures
* *evaluators* deconstruct the hierarchy using pattern matching

In practice, the library gives you access to the following capabilities

* Structured [pattern matching](http://en.wikipedia.org/wiki/Pattern_matching)
* Evaluators in the form of [state machines](http://en.wikipedia.org/wiki/Finite-state_machine)
* Separation of interface from (multiple) implementations

For example, using adt.js you could do a bunch of cool stuff with expression trees, like

* Defining [Domain Specific Languages](http://en.wikipedia.org/wiki/Domain-specific_language) with multiple implementations
* Compilers capable of arbitrarily transforming/reducing/expanding expression trees
* Parsers defined by finite state machines


## Examples

### A simple non-hierarchical example

```javascript
  transportation = adt('car', 'train', 'plane'),
  travelFare = adt({
    car: function(miles) { miles * 0.3; },
    train: function(miles,speed) { miles * 0.1 + 0.2 * speed; },
    plane: function(miles) { miles * miles * 0.3 + 22.0; }
  }),
  travelTime = adt({
    car: function(miles) { miles / 55.3; },
    train: function(miles,speed) { 0.5 + miles / 60.0; },
    plane: function(miles) { (miles < 600? 2.5 : 4.0) + miles / 300.0; }
  }),
  tripToGrandma = transportation.train(52, 0.6),
  costOfTripToGrandma = travelFare(tripToGrandma),
  timeOfTripToGrandma = travelTime(tripToGrandma);
```

## More information

**What is a data type and how exactly is it algebraic?**

There is some confusion around the usage of various terms such as *data types*, *type classes*, *algebraic data types (ADT's)*, *abstract data types (also ADT's)*.
This is all a bit of a tangled mess in my personal opinion and the vocabulary for these terms probably needs an overhaul... but then, what can you do? 
These terms have already been established and are currently in wide-spread use.

So! If you were looking for the textbook answer I'll assume that you'd simply go to wikipedia / google.
What follows here is a common sense practical definition for JavaScript hackers...

        A 'variable' is a symbol that stands in place of some quatity (in our case data)
        A 'type' or 'data type' annotates a variable with a logical proposition about the quantity that the variable represents (this annotation is added to the variable and thus can only be accessed at compile-time)
        An 'algebraic data type' (or ADT) annotates the variable's **quantity** with type information (that can only be accessed at run-time by the application)
          ...additionally algebraic data types works on structured data.

In math *algebraic* usually refers to the ability to manipulate and interpret structures instead of working directly with underlying quantities.
For those of you with an academic slant, this [blog post](http://blog.lab49.com/archives/3011) by Kalani Thielen describes some more meta-algebraic stuff that can be done with ADT's.

