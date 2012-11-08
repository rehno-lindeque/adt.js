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

      // Create an identity constructor for the fall through pattern if none was supplied
      if (typeof selfProto['_'] === 'undefined') {
        selfProto['_'] = function(){
          return this._datatype !== 'ADT'? arguments[0] : construct(this._tag, arguments);
        },
        evaluators['_'] = function(){ return selfProto['_'].apply(evaluators, arguments); };
      }
        
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

      /* METHOD 1 (FAST DISPATCH - TODO) Generate pattern matcher + dispatch function
      var 
        patternMatcher = "\"use strict\";\n",
        merge = function(dict,k,v) { return dict[k] ? dict[k].push(v) : [v]; },
        tuples = {},
        variableTuples = false, // (Are there variable length tuples in the pattern?)
        prevLength = null,
        tuple,
        i,
        generateTupleMatcher = function(){
        };
      for (tag in evaluators)
        switch(tag) {
          case '_eval': continue;
          default: 
            tuple = tag.split(',');
            merge(tuples, tuple.length, tuple);
            variableTuples = (prevLength !== null && prevLength !== tuple.length);
            prevLength = tuple.length;
        }
      if (variableTuples)
        patternMatcher.concat("switch(arguments.length){\n")
      for (i in tuples) {
        if (variableTuples)
          patternMatcher.concat("case " + i + ":\n");
        patternMatcher.concat(generateTupleMatcher(tuples[i]));        
      }
      if (variableTuples)
        patternMatcher.concat(
          "default:\n"
          + "return false;\n"
          + "}\n")
      //*/

      //* METHOD 2 (FAST COMPILATION)
      // Tokenize patterns into (length, (pattern,tuple))
      var 
        appendAt = function(dict,k,v) { 
          if (dict[k]) dict[k].push(v); else dict[k] = [v]; 
        },
        pattern,
        patternTuples = {};
      for (pattern in evaluators)
        switch(pattern) {
          case '_eval': continue;
          default: 
            var tuple = pattern.split(',').map(function(s) { 
              return s.split(' ').filter(function(s) { return s !== ''; }); 
            });
            appendAt(patternTuples, tuple.length, [pattern, tuple]);
        }

      // Order patternTuples in order from most specific to most general (order of patterns in evaluators cannot be relied upon)
      (function(){
        var l, pt;
        for (l in patternTuples) {
          pt = patternTuples[l];
          pt.sort(function(a,b) {
            // Pre-condition: a[1].length == b[1].length (patternTuples are already grouped by length)
            var i,j;
            for (i = 0; i < a[1].length; ++i) {
              // Calculate relative generality of the two patterns
              // 1. The most specific constructor is always the one with the largest number of arguments specified, even if they are wildcards...
              //    I.e. The most general constructor is always the one with the fewest arguments specified...
              if (a[1][i].length !== b[1][i].length)
                return a[1][i].length > b[1][i].length? -1 : 1;
              // 2. Wild card patterns > ADT > Everything else
              for (j = 0; j < a[1][i].length; ++j) {
                if (a[1][i][j] !== '_' && b[1][i][j] === '_')
                  return -1; // a less general than b
                if (a[1][i][j] === '_' && b[1][i][j] !== '_')
                  return 1; // a more general than b
                if (a[1][i][j] !== 'ADT' && b[1][i][j] === 'ADT')
                  return -1; // a less general than b
                if (a[1][i][j] === 'ADT' && b[1][i][j] !== 'ADT')
                  return 1; // a more general than b
              }
            }
            // 3. For the remainder, simply sort patterns alphabetically
            return a[0] < b[0]? -1 : 1;
          });
        }
      })();

      var 
        matchShallow = function(tag, datum) {
          return tag === getTypeTag(datum) || tag == '_' || (isADT(datum) && tag == 'ADT');
        },
        matchCons = function(consPattern, datum) {
          // Pre-condition: consPattern.length > 0
          // The function returns a list of unboxed arguments to send to the evaluator
          var i;
          if (isADT(datum)) {
            if (consPattern[0] == '_')
              return datum.slice(0);
            if (consPattern[0] !== datum._tag)
              return null;
            if (consPattern.length === 1)
              return datum.slice(0);
            for (i = 0; i < datum.length; ++i)
              if (!matchShallow(consPattern[i + 1], datum[i]))
                return null;
            return datum.slice(0);
          }
          else if (consPattern.length === 1 
              && (consPattern[0] === getObjectType(datum) || consPattern[0] === '_'))
            return [datum];
          return null;
        },
        matchTuple = function(tuplePattern, args) {
          // Pre-condition: tuplePattern.length == args.length
          var 
            i,
            d,
            data = [];
          for (i = 0; i < tuplePattern.length; ++i) {
            d = matchCons(tuplePattern[i], args[i]);
            if (d == null)
              return null;
            data = data.concat(d);
          }
          return {
            data: data,
            pattern: tuplePattern.map(function(s){ return s.join(' ') }).join(','),
            datatype: Array.prototype.map.call(args, getDataType).join(','),
            tag: Array.prototype.map.call(args, getTypeTag).join(','),
          };
        },
        matcherFunc = function() {
          var i, m, pt = patternTuples[arguments.length];
          if (pt != null)
            for (i = 0; i < pt.length; ++i) {
              m = matchTuple(pt[i][1], arguments);
              if (m != null) {
                m.eval = evaluators[pt[i][0]];
                // TODO: m.exactPattern = pt[i][0];
                return m;
              }
            }
          return null;
        };
      //*/

      evaluators._eval = function() {
        // Determine if the data is a construction (built by a constructor)
        var i,
          tags = [],
          dataTypes = [];
        
        var m = matcherFunc.apply((void 0), arguments);
        if (m == null) {
          evaluators._pattern = '_';
          evaluators._tag = Array.prototype.map.call(arguments, getTypeTag).join(',');
          evaluators._datatype = Array.prototype.map.call(arguments, getDataType).join(',');
          var data = Array.prototype.reduce.call(arguments, function(a,b){ return a.concat(isADT(b)? b : [b]); }, []);
          return evaluators._.apply(evaluators, data);
        }
        evaluators._pattern = m.pattern;
        evaluators._tag = m.tag;
        evaluators._datatype = m.datatype;
        return m.eval.apply(evaluators, m.data);
      };
      return evaluators;
    };
