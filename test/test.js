(function(){
  var 
    transportation,
    travelFare,
    travelTime,
    tripToGrandma,
    costOfTripToGrandma,
    timeOfTripToGrandma;

  transportation = adt('car','train','plane');
  console.log("transportation: ", transportation);
  travelFare = adt({
    car: function(miles) { return miles * 0.3; },
    train: function(miles,speed) { return miles * 0.1 + 0.2 * speed; },
    plane: function(miles) { return miles * miles * 0.3 + 22.0; }
  });
  travelTime = adt({
    car: function(miles) { return miles / 55.3; },
    train: function(miles,speed) { return 0.5 + miles / 60.0; },
    plane: function(miles) { return (miles < 600? 2.5 : 4.0) + miles / 300.0; }
  });
  tripToGrandma = transportation.train(52, 0.6);
  console.log("tripToGrandma: ", tripToGrandma);
  costOfTripToGrandma = travelFare(tripToGrandma);
  console.log("costOfTripToGrandma: ", costOfTripToGrandma);
  timeOfTripToGrandma = travelTime(tripToGrandma);
  console.log("timeOfTripToGrandma: ", timeOfTripToGrandma);
})();
