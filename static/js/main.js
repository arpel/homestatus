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

  /* Generate all Temp monitors */
  for(var i = 0; i < feedtable.length; i++){
    break;
    feedtable[i].container = containers+i;

    $("#tempmonitors").append("<div class=\"tempmonitor "+feedtable[i].container+"\"><p>"+feedtable[i].title+"</p><div class=\"tempgauge\" data-percent=\"0\"><span></span></div><p id=\"at\">TEST</p></div>");

    feedtable[i].masterelement =  $("."+feedtable[i].container);
    feedtable[i].element =  $(".tempgauge", feedtable[i].masterelement);

    feedtable[i].monitor = new Tempmonitor(feedtable[i]);
    feedtable[i].monitor.createPie();
    feedtable[i].monitor.cosmOneTime();
    feedtable[i].monitor.cosmRealTime();
  }

  streams = [ { stream: 1, marker: 't', label: 'Thermostat'}, 
              { stream: 8, marker: 'c', label: 'Chambre'},
              { stream: 9, marker: 's', label: 'Salon'}];

  //var gen1 = new Graph("Températures intérieures - 6h", 'graph_intemp1', streams, feedtable[0].feed, [{start: moment().subtract('hours', 6).format(), interval: 300, limit: 300, interval_type: 'discrete'}]);
  //gen1.getAllData();

  streams = [ { stream: 5, marker: 'o', label: 'Out'}, 
              { stream: 6, marker: 'i', label: 'In'}];

  //var gen2 = new Graph("Températures chaudière - 6h",'graph_intemp2', streams, feedtable[0].feed, [{start: moment().subtract('hours', 6).format(), interval: 300, limit: 300, interval_type: 'discrete'}]);
  //gen2.getAllData();


  streams = [ { stream: 1, marker: 't', label: 'Thermostat'},
              { stream: 3, marker: 'e', label: 'Exterieur'}];

  //var gen3 = new Graph("Températures intérieur / extérieur - 48h",'graph_intemp3', streams, feedtable[0].feed, [{start: moment().subtract('hours', 48).format(), interval: 2400, limit: 300, interval_type: 'discrete'}]);
  //gen3.getAllData();

  streams = [ { stream: 5, marker: 'o', label: 'Out', toggle: true}, 
              { stream: 6, marker: 'i', label: 'In'}];

  //var gen4 = new Graph("Températures chaudière - 24h",'graph_intemp4', streams, feedtable[0].feed, [{start: moment().subtract('hours', 24).format(), interval: 300, limit: 1000, interval_type: 'discrete'}]);
  //gen4.getAllData();

//durlist =  [{start: moment().subtract('hours', 48).format(), end: moment().format(), interval: 300, limit: 1000, interval_type: 'discrete'}];

durlist =  [{start: moment('2013-07-01T18:32:40').subtract('hours', 48).format(), end: moment('2013-07-01T22:45:10').format(), interval: 30, limit: 1000, interval_type: 'discrete'}];

  $.ajax({
    type: 'GET',
    dataType: "json",
    url: "/getdata",
    data: { "streams": JSON.stringify(streams),
            "dlist": JSON.stringify(durlist) },
    success: (function( data ) {
        alert("Success");
      })
  });

});
