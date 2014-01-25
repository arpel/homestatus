$(document).ready(function() {

  SetupMoment();

  xively.setKey( "bI-PWNeyFPrHnJOq7tclJGLVjDiSAKxOSlRJNVVYMTBnbz0g" );

  var containers = "tempholder_";

  var feedtable = [ { feed: "97289", datastream: "1", title: "Thermostat",    minmax: [10, 30],  greenzone: [15, 25]},
                    { feed: "97289", datastream: "3", title: "Extérieur",     minmax: [-10, 40], greenzone: [10, 25]},
                    { feed: "97289", datastream: "9", title: "Salon",         minmax: [10, 30],  greenzone: [15, 25]},
                    { feed: "97289", datastream: "8", title: "Chambre",       minmax: [10, 30],  greenzone: [15, 25]},
                    { feed: "97289", datastream: "6", title: "Chaudière IN",  minmax: [15, 85],  greenzone: [20, 55]},
                    { feed: "97289", datastream: "5", title: "Chaudière OUT", minmax: [15, 85],  greenzone: [20, 55]}];

  /* Generate all detailled sliding graphs */

  streams = [ { stream: 5, marker: 'o', label: 'Out', toggle: true}, 
              { stream: 6, marker: 'i', label: 'In'},
              { stream: 1, marker: 't', label: 'Thermostat'}];

/*  var gen5 = new Graph("Températures chaudière - 6h",'graph_intemp5', streams, feedtable[0].feed, {start: moment().subtract('hours', 6).format(), interval: 30, limit: 1000});
  gen5.getAllData();
*/

var slide1 = new Graph("Températures chaudière - 24h", 'chart', streams, feedtable[0].feed,
    [ {start: moment().subtract('hours', 48).format(), end: moment().format(), interval: 30} ],
    10);
/*
var slide1 = new Graph("Températures chaudière - 24h", 'chart', streams, feedtable[0].feed,
    [ {start: moment().subtract('hours', 24).format(), duration: '1hours', interval: 30, limit: 800}]);
*/
slide1.getAllDataGenSlidingGraphDygraphNew();


 streams = [ { stream: 1, marker: 't', label: 'Thermostat'},
              { stream: 3, marker: 'e', label: 'Exterieur'}];

var slide2 = new Graph("Températures intérieur / extérieur - 3mois",'chart2', streams, feedtable[0].feed, 
  [{start: moment().subtract('days', 88).format(), interval: 21600, limit : 500, interval_type: 'discrete'}]);

//slide2.getAllDataGenSlidingGraphDygraph();

});