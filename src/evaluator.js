  // ADT evaluator api
  var 
    evaluator = function(selfProto) {
      var 
        tag,
        evaluator = function(){
          return evaluator.eval.apply(evaluator, arguments);
        };

      evaluator.recursive = function() {
        evaluator.eval = evaluator.recurse;
        return evaluator;
      };

      var _eval = function(pattern, tag, datatype, args) {
        // TODO (version 1.0 & 2.0): The first argument can be removed
        // TODO (version 3.0): perform pattern matching
        // E.g. split the data around whitespace and in order of specific to general...
        var result;
        evaluator._pattern = (pattern != null? pattern : (tag != null? tag : datatype));
        evaluator._tag = (tag != null? tag : datatype);
        evaluator._datatype = (datatype != null? datatype : 'ADT');
        var f = evaluator[evaluator._pattern]; 
        if (typeof f !== 'function')
          f = evaluator['_'];
        return f.apply(evaluator, args);
      };

      evaluator.eval = function(data) {
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

      evaluator.recurse = function(data) {
        if (isADTData(data)) {
          // pre-condition: empty construction (built by a constructor)
          if (data.length < 1)
            throw "It shouldn't be possible to have empty ADT constructions";
          // Evaluate sub-trees
          var
            result = new Array(data.length - 1),
            pattern = '',
            i;
          result._ADTData = true;
          pattern = String(data[0]);
          for (i = 1; i < data.length; ++i) {
            result[i - 1] = evaluator.recurse(data[i]);
            pattern = pattern.concat(' '.concat(isADTData(result[i - 1])? result[i - 1][0] : typeof result[i - 1]));
          }
          // TODO (version 3.0): Use pattern
          return _eval(null/*pattern*/, data[0], 'adt', result);
        }
        return _eval(null, null, getObjectType(data), [data]);
      };

      /* TODO (version 2/3)?
      // Iterate over an array of values (while carrying state, like a finite state machine)
      // Similar to a haskell enumerator + iteratee with "map" as the enumerator and "iteratee" as the iteratee carying state
      evaluator.mapIteratee = function() { console.log("mapIterate", arguments); return 0; };

      // Similar to a haskell enumerator + iteratee with "fold" as the enumerator and "iteratee" as the iteratee carying state
      evaluator.foldIteratee = function() { console.log("iterate", arguments); return 0; };
      */

      // Add adt constructors / methods to the evaluator
      for (tag in selfProto)
        switch(tag) {
          case 'eval':
          case 'recurse':
          case 'recursive':
            continue;  // Warning? trying to overide standard functions
          default:
            if (tag !== 'eval') {
              if (typeof selfProto[tag] === 'function')
                // Custom evaluator
                evaluator[tag] = (function(tag){ return function(){ return selfProto[tag].apply(evaluator, arguments); }; })(tag);
              else 
                // Constant constructor (return the constant value)
                evaluator[tag] = (function(tag){ return function(){ return selfProto[tag]; }; })(tag);
            }
        }
      // Create an identity constructor for the fall through pattern if none was supplied
      if (typeof selfProto['_'] === 'undefined') {
        selfProto['_'] = function(){
          return this._datatype !== 'ADT'? arguments[0] : adt.construct.apply(null, [this._tag].concat([].slice.call(arguments, 0)));
        },
        evaluator['_'] = function(){ return selfProto['_'].apply(evaluator, arguments); };
      }
      
      return evaluator;
    };

