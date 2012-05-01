  adt.serialize = adt({"_": 
    function() { 
      var i, str = this._key;
      for (i = 0; i < arguments.length; ++i)
        str += ' ' + (typeof arguments[i] == 'string'? '"' + arguments[i] + '"' : String(arguments[i]));
      return arguments.length > 1? "(" + str + ")" : str;
    }
  });

