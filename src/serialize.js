  adt.serialize = adt({"_": 
    function() { 
      var i, str = arguments.length > 0? String(arguments[0]) : "";
      for (i = 1; i < arguments.length; ++i)
        str += ' ' + String(arguments[i]);
      return arguments.length > 1? "(" + str + ")" : str;
    }
  });

