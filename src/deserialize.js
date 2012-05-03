  adt.deserialize = function(str){
    var
    deserializeEval = 
      adt({'(': 
        adt({ _: 
          adt.compose(
            adt({')': 
              adt(this._key)
            })
        })
      });

    deserializeEval.fold("(b)");

    var 
    deserializeEval = adt({
      '(': function() { console.log('('); },
      ')': function() { console.log(')'); },
      '[': function() { console.log('['); },
      ',': function() { console.log(','); },
      ']': function() { console.log(']'); },
      '_': function() {}
    });
    return deserializeEval(str);
  };

