  adt.deserialize = function(str){
    console.log("TODO: deserialize", str);
    adt({
      '(': function() { console.log('('); },
      ')': function() { console.log(')'); },
      '[': function() { console.log('['); },
      ',': function() { console.log(','); },
      ']': function() { console.log(']'); },
      '_': function() {}
    });
  };

