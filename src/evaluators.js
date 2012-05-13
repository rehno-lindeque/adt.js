  // ADT evaluators api
  var 
    evaluators = function(selfProto) {
      var 
        tag,
        evaluators = function(){
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
        var f = evaluators[evaluators._pattern]; 
        if (typeof f !== 'function')
          f = evaluators['_'];
        return f.apply(evaluators, args);
      };

      evaluators._eval = function(data) {
        // Determine if the data is a construction (built by a constructor)
        if (isADTData(data)) {
          // pre-condition: No empty constructions
          if (data.length < 1)
            throw "It shouldn't be possible to have empty ADT constructions";
          /* TODO: (version 3.0): Construct a pattern for pattern matching
          var
            pattern = data[0],
            i;
          for (i = 1; i < data.length; ++i) {
            if (isADTData(data[i])) {
              pattern = pattern.concat(' '.concat(data[i][0]));
            else
              pattern = pattern.concat(' '.concat(typeof data[i]));
          }*/
          return _eval(null, data[0], 'ADT', [].slice.call(data,1));
        }
        // Evaluate primitive type
        return _eval(null, null, getObjectType(data), [data]);
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
          return this._datatype !== 'ADT'? arguments[0] : adt.construct.apply(null, [this._tag].concat([].slice.call(arguments, 0)));
        },
        evaluators['_'] = function(){ return selfProto['_'].apply(evaluators, arguments); };
      }
      
      return evaluators;
    };

