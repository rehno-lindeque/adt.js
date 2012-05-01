  // ADT evaluator api
  var 
    evaluator = function(selfProto) {
      var 
        key,
        evaluator = function(){
          return evaluator.eval.apply(self, arguments);
        },
        self = Object.create(selfProto);

      evaluator.eval = function(data) { 
        // Determine if the data is a type name (a data type constructor name)
        if (typeof data === 'string' || typeof data === 'number') {
          // TODO (version 2): perform pattern matching
          // E.g. split the data around whitespace and in order of specific to general...
          var result;
          self._key = self._pattern = data;
          if (typeof evaluator[data] === 'function')
            result = evaluator[data].apply(self, [].slice.call(arguments, 1));
          else
            result = evaluator['_'].apply(self, [].slice.call(arguments, 1));
          /*
          if (Array.isArray(result) && result['_ADTData'] === true)
            return result;
          result = [result];
          //result._ADTPrimitive = true;*/
          return result;
        }
        // Determine if the data is a construction (built by a constructor)
        if (Array.isArray(data) && data['_ADTData'] === true) {
          //assert(data.length > 0, "It shouldn't be possible to have empty ADT constructions");
          // Evaluate sub-trees
          var
            result = new Array(data.length),
            key = '',
            i;
          result._ADTData = true;
          for (i = 1; i < data.length; ++i) {
            var subResult = (Array.isArray(data[i]) && data[i]['_ADTData'] === true)? evaluator.eval(data[i]) : data[i];
            if (Array.isArray(subResult) && subResult['_ADTData'] === true) {
              key = key.concat(' '.concat(subResult[0]));
              result[i] = subResult;
            }
            else {
              key = key.concat(' '.concat(typeof subResult));
              result[i] = subResult;
            }
          }
          // TODO (version 2): for pattern matching
          //result[0] = key;
          result[0] = data[0];
          self._key = self._pattern = result[0]; //key
          return evaluator.eval.apply(self, result);
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
        if (key !== 'eval') {
          if (typeof selfProto[key] === 'function')
            // Custom evaluator
            evaluator[key] = (function(key){ return function(){ return selfProto[key].apply(self, arguments); }; })(key);
          else 
            // Constant constructor (return the constant value)
            evaluator[key] = (function(key){ return function(){ return selfProto[key]; }; })(key);
        }
        // TODO: else
        //   Warning? trying to overide standard functions

      /* TODO: Can't work right now because the data isn't available
      // Create an identity constructor for the default constructor if none was supplied
      if (typeof selfProto['_'] === 'undefined') {
        selfProto['_'] = function(data){ return data; };
        evaluator['_'] = function(){ return selfProto['_'].apply(self, arguments); }
      }*/
      
      return evaluator;
    };

