  // ADT evaluator api
  var 
    evaluator = function(selfProto) {
      var 
        tag,
        evaluator = function(){
          return evaluator.eval.apply(evaluator, arguments);
        },
        self = Object.create(selfProto);

      evaluator.recursive = function() {
        evaluator.eval = evaluator.recurse;
        return evaluator;
      };

      var _eval = function(pattern, tag, args) {
        // TODO (version 3.0): perform pattern matching
        // E.g. split the data around whitespace and in order of specific to general...
        self._tag = tag;
        self._pattern = pattern;
        if (typeof evaluator[pattern] === 'function')
          return evaluator[pattern].apply(self, args);
        return evaluator['_'].apply(self, args);
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
          return _eval(data[0], data[0], data);
        }
        // NEW:
        throw "TODO: evaluate primitive type"

        // OLD:
        // If the argument is neither a constructor name, nor a construction (ADTData)
        // then simply return it
        //return data;
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
          return _eval(pattern,data[0], result);
        }
        // NEW:
        throw "TODO: evaluate primitive type"
        
        // OLD:
        // If the argument is neither a constructor name, nor a construction (ADTData)
        // then simply return it
        //return data;
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
                evaluator[tag] = (function(tag){ return function(){ return selfProto[tag].apply(self, arguments); }; })(tag);
              else 
                // Constant constructor (return the constant value)
                evaluator[tag] = (function(tag){ return function(){ return selfProto[tag]; }; })(tag);
            }
        }
      /* Create an identity constructor for the default constructor if none was supplied
      if (typeof selfProto['_'] === 'undefined') {
        selfProto['_'] = function(data){ return data; };
        evaluator['_'] = function(){ return selfProto['_'].apply(self, arguments); }
      }*/
      
      return evaluator;
    };

