# adt.js

**adt.js** is an unusual interpretation of [Algebraic Data Types (ADT)](http://en.wikipedia.org/wiki/Algebraic_data_type) in a dynamic language with 
JavaScript.

ADT's in **adt.js** consist of a *constructor* and *evaluators*.

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

In OO style lingo you could view this library as emulating the following design patterns

* [Command](http://en.wikipedia.org/wiki/Command_pattern)
* [Visitor](http://en.wikipedia.org/wiki/Visitor_pattern)
* [Builder](http://en.wikipedia.org/wiki/Builder_pattern)
