  // ADT evaluators API (version 3)
  var 
    evaluators = function(selfProto) {
      var 
        tag,
        evaluators = function(){
          // TODO: Add a second private method called `_run` which includes composition/recursion etc as applied by external plugins.
          //       This would hopefully allow people to write generic higher-order functions that work together seamlesly.
          return evaluators._eval.apply(evaluators, arguments);
        };

      var _eval = function(pattern, tag, datatype, args) {
        // TODO (version 1.0 & 2.0): The first argument can be removed
        // TODO (version 3.0): perform pattern matching
        // E.g. split the data around whitespace and in order of specific to general...
        var result;
        evaluators._pattern = (pattern != null? pattern : (tag != null? tag : datatype));
        evaluators._tag = (tag != null? tag : datatype);
        evaluators._datatype = (datatype != null? datatype : 'ADT');
        var f = (pattern? evaluators[pattern] : null)
          || (tag? evaluators[tag] : null)
          || evaluators[evaluators._datatype]
          || evaluators['_'];
        return f.apply(evaluators, args);
      };

      evaluators._eval = function() {
        // Determine if the data is a construction (built by a constructor)
        var i,j, 
          datum, 
          pattern = '',
          tag = '',
          dataType = '',
          data = [];

        for (i = 0; i < arguments.length; ++i) {
          if (i > 0) {
            pattern += ',';
            tag += ',';
            dataType += ',';
          }
          datum = arguments[i];
          if (isADT(datum)) {
            // Get the pattern for this element
            var innerPattern = datum._tag;            
            for (j = 0; j < datum.length; ++j) {
              data.push(datum[j]);
              if (isADT(datum[j]))
                innerPattern += ' ' + datum[j]._tag;
              else
                innerPattern += ' ' + getObjectType(datum[j]);
            }
            // Concat patterns / tags / data types
            pattern += innerPattern;
            tag += datum._tag;
            dataType += 'ADT';
          }
          else {
            // Add to list arguments
            data.push(datum);
            // Concat patterns / tags / data types
            var dataType = getObjectType(datum);
            pattern += dataType;
            tag += dataType;
            dataType += dataType;
          }
        }
        /*if (arguments.length > 1) {
          pattern = '(' + pattern + ')';
          tag = '(' + tag + ')';
          tag = '(' + dataType + ')';
        }*/
        // Evaluate primitive type
        return _eval(pattern, tag, dataType, data);
      };

      /* TODO (version )?
      // Iterate over an array of values (while carrying state, like a finite state machine)
      // Similar to a haskell enumerator + iteratee with "map" as the enumerator and "iteratee" as the iteratee carying state
      evaluators.mapIteratee = function() { console.log("mapIterate", arguments); return 0; };

      // Similar to a haskell enumerator + iteratee with "fold" as the enumerator and "iteratee" as the iteratee carying state
      evaluators.foldIteratee = function() { console.log("iterate", arguments); return 0; };
      */

      // Add adt constructors / methods to the evaluators
      for (tag in selfProto)
        switch(tag) {
          case 'eval':
            continue;  // Warning? trying to overide standard functions
          default:
            if (tag !== 'eval') {
              if (typeof selfProto[tag] === 'function')
                // Custom evaluators
                evaluators[tag] = (function(tag){ return function(){ return selfProto[tag].apply(evaluators, arguments); }; })(tag);
              else 
                // Constant constructor (return the constant value)
                evaluators[tag] = (function(tag){ return function(){ return selfProto[tag]; }; })(tag);
            }
        }
      // Create an identity constructor for the fall through pattern if none was supplied
      if (typeof selfProto['_'] === 'undefined') {
        selfProto['_'] = function(){
          return this._datatype !== 'ADT'? arguments[0] : construct(this._tag, arguments);
        },
        evaluators['_'] = function(){ return selfProto['_'].apply(evaluators, arguments); };
      }
      
      return evaluators;
    };
