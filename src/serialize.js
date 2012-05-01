  adt.serialize = function(){
    var 
    serializeEval = adt('serialized', 
      {'_': function() { 
        var i, str = this._key, data;
        for (i = 0; i < arguments.length; ++i) {
          data = adt.deconstruct(arguments[i]);
          str += ' ' + (data.key === 'string'? '"' + data.value + '"' : (data.key === 'serialized'? "(" + data.value + ")" : String(data.value)));
        }
        return this.serialized(str); 
      }}
    );
    
    return String(adt.deconstruct(serializeEval.apply(serializeEval, arguments)).value);
  };

