# adjt.js

adt.js is an unusual implementation of [Algebraic Data Types (ADT)](http://en.wikipedia.org/wiki/Algebraic_data_type) in JavaScript.

In practice, the library gives you access to the following capabilities

* Pattern matching
* finite state machine
* Separate interface and implementation

For example, adt.js let's you do bunch of cool stuff with expression trees, like

* [Domain Specific Languages](http://en.wikipedia.org/wiki/Domain-specific_language)
* Compilers by transforming/reducing/expanding expression trees
* Parsers by finite state machine

In OO style lingo this is similar to the following patterns

* Visitor
* Command
* Builder

