  adt.deconstruct = function(data){
    return (isADTData(data)? 
      { tag: data[0], args: data.slice(1) } : 
      { tag: typeof data, args: data });
  };

