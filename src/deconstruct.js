  adt.deconstruct = function(data){
    return (data && data['_ADTData'] === true? 
      { key: data[0], value: data.slice(1) } : 
      { key: typeof data, value: data });
  };

