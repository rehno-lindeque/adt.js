  // ADT evaluator api
  var 
    evaluator = function(selfProto) {
      var 
        key,
        evaluator = function(){
          return evaluator.eval.apply(evaluator, arguments);
        },
        self = Object.create(selfProto);

      evaluator.recursive = function() {
        evaluator.eval = evaluator.recurse;
        return evaluator;
      };

      var evalPrimitiveType = function(data) {
        // TODO (version 2): perform pattern matching
        // E.g. split the data around whitespace and in order of specific to general...
        self._key = self._pattern = data;
        if (typeof evaluator[data] === 'function')
          return evaluator[data].apply(self, [].slice.call(arguments, 1));
        return evaluator['_'].apply(self, [].slice.call(arguments, 1));
      };

      evaluator.eval = evaluator._eval = function(data) {
        // Determine if the data is a type name (a data type constructor name)
        if (typeof data === 'string' || typeof data === 'number')
          return evalPrimitiveType.apply(this, arguments);
        // Determine if the data is a construction (built by a constructor)
        if (isADTData(data)) {
          // pre-condition: No empty constructions
          if (data.length < 1)
            throw "It shouldn't be possible to have empty ADT constructions";
          /* TODO: (version 2.0): Construct a key for pattern matching
          var
            pattern = data[0],
            i;
          for (i = 1; i < data.length; ++i) {
            if (isADTData(data[i])) {
              key = key.concat(' '.concat(data[i][0]));
            else
              key = key.concat(' '.concat(typeof data[i]));
          }*/
          self._key = self._pattern = data[0];
          return evaluator.eval.apply(evaluator, data);
        }
        // If the argument is neither a constructor name, nor a construction (ADTData)
        // then simply return it
        return data;
      };

      evaluator.recurse = function(data) {
        // Determine if the data is a type name (a data type constructor name)
        if (typeof data === 'string' || typeof data === 'number')
          return evalPrimitiveType.apply(this, arguments);
        // Determine if the data is a construction (built by a constructor)
        if (isADTData(data)) {
          // pre-condition: empty construction (built by a constructor)
          if (data.length < 1)
            throw "It shouldn't be possible to have empty ADT constructions";
          // Evaluate sub-trees
          var
            result = new Array(data.length),
            pattern = '',
            i;
          result._ADTData = true;
          pattern = String(data[0]);
          for (i = 1; i < data.length; ++i) {
            var subResult = isADTData(data[i])? evaluator.recurse(data[i]) : data[i];
            if (isADTData(subResult)) {
              pattern = pattern.concat(' '.concat(subResult[0]));
              result[i] = subResult;
            }
            else {
              pattern = pattern.concat(' '.concat(typeof subResult));
              result[i] = subResult;
            }
          }
          /* TODO (version 2): for pattern matching
          result[0] = pattern;*/
          result[0] = data[0];
          self._key = self._pattern = result[0]; //key
          return evaluator.recurse.apply(evaluator, result);
        }
        // If the argument is neither a constructor name, nor a construction (ADTData)
        // then simply return it
        return data;
      };

      /* TODO (version 2/3)?
      // Iterate over an array of values (while carrying state, like a finite state machine)
      // Similar to a haskell enumerator + iteratee with "map" as the enumerator and "iteratee" as the iteratee carying state
      evaluator.mapIteratee = function() { console.log("mapIterate", arguments); return 0; };

      // Similar to a haskell enumerator + iteratee with "fold" as the enumerator and "iteratee" as the iteratee carying state
      evaluator.foldIteratee = function() { console.log("iterate", arguments); return 0; };
      */

      // Add adt constructors / methods to the evaluator
      for (key in selfProto)
        switch(key) {
          case 'eval':
          case 'recurse':
          case 'recursive':
            continue;  // Warning? trying to overide standard functions
          default:
            if (key !== 'eval') {
              if (typeof selfProto[key] === 'function')
                // Custom evaluator
                evaluator[key] = (function(key){ return function(){ return selfProto[key].apply(self, arguments); }; })(key);
              else 
                // Constant constructor (return the constant value)
                evaluator[key] = (function(key){ return function(){ return selfProto[key]; }; })(key);
            }
        }

      /* TODO: Can't work right now because the data isn't available
      // Create an identity constructor for the default constructor if none was supplied
      if (typeof selfProto['_'] === 'undefined') {
        selfProto['_'] = function(data){ return data; };
        evaluator['_'] = function(){ return selfProto['_'].apply(self, arguments); }
      }*/
      
      return evaluator;
    };

