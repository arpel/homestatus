function SetupMoment(){
	moment.lang('fr', {
    months : "Janvier_Février_Mars_Avril_Mai_Juin_Juillet_Aout_Septembre_Octobre_Novembre_Décembre".split("_"),
    monthsShort : "Jan_Fev_Mar_Avr_Mai_Juin_Juil_Aou_Sep_Oct_Nov_Dec".split("_"),
    weekdays : "Dimanche_Lundi_Mardi_Mercredi_Jeudi_Vendredi_Samedi".split("_"),
    weekdaysShort : "Dim_Lun_Mar_Mer_Jeu_Ven_Sam".split("_"),
    longDateFormat : {
        L : "DD/MM/YYYY",
        LL : "D MMMM YYYY",
        LLL : "D MMMM YYYY HH:mm",
        LLLL : "dddd, D MMMM YYYY HH:mm"
    },
    meridiem : {
        AM : 'AM',
        am : 'am',
        PM : 'PM',
        pm : 'pm'
    },
    calendar : {
        sameDay: "[Ajourd'hui à] LT",
        nextDay: '[Demain à] LT',
        nextWeek: 'dddd [à] LT',
        lastDay: '[Hier à] LT',
        lastWeek: 'dddd [denier à] LT',
        sameElse: 'L'
    },
    relativeTime : {
        future : "dans %s",
        past : "il y a %s",
        s : "secondes",
        m : "une minute",
        mm : "%d minutes",
        h : "une heure",
        hh : "%d heures",
        d : "un jour",
        dd : "%d jours",
        M : "un mois",
        MM : "%d mois",
        y : "une année",
        yy : "%d années"
    },
    ordinal : function (number) {
        return (~~ (number % 100 / 10) === 1) ? 'er' : 'ème';
    }
  });

  moment.lang('fr');
}

function Tempmonitor(feedelement){
    this.minmax = feedelement.minmax;
    this.greenzone = feedelement.greenzone;
    this.element = feedelement.element;
    this.feed = feedelement;

    this.valueToRatio = function(self, value){
      return 100*(Math.abs(parseFloat(value)-self.minmax[0]))/(self.minmax[1]-self.minmax[0]);
    };

    this.colorbyValue = function(self, value){
      if(value < this.valueToRatio(self, self.greenzone[0]))
        return "blue";
      if(value < this.valueToRatio(self, self.greenzone[1]))
        return "green";

      return "red";
    };

    this.cosmOneTime = function(){
      //console.log(this);
      xively.datastream.get( this.feed.feed, this.feed.datastream, ( function(self) {
        return function( data ) {
          //console.log(self);
          self.element.data('easyPieChart').update(self.valueToRatio(self, data.current_value));
          $('span', self.element).text(data.current_value+data.unit.label);
          $('#at', self.feed.masterelement).text(moment(data.at).fromNow());
        //console.log( data.current_value ); // Logs value changes in realtime
        };
      })(this));
    };

    this.cosmRealTime = function(){
      //console.log(this);
      xively.datastream.subscribe( this.feed.feed, this.feed.datastream, ( function(self) {
        return function( event, data ) {
          self.element.data('easyPieChart').update(self.valueToRatio(self, data.current_value));
          $('span', self.element).text(data.current_value+data.unit.label);
          $('#at', self.feed.masterelement).text(moment(data.at).fromNow());
          console.log( data.current_value ); // Logs value changes in realtime
        };
      })(this));
    };

    this.createPie = function (){
      this.element.easyPieChart({
        animate: 1000,
        barColor: ( function(self) { return function(data) { return self.colorbyValue(self, data); } } )(this),
        lineWidth: 5
      });
    };
  }

  function Graph(title, target, streamsparams, feed, history_params, type)
  {
    var self = this;

    self.graphdata = [];
    
    self.streams = streamsparams;
    self.feed = feed;
    self.history_params = history_params;
    
    self.markers = [];
    self.labels = [];

    self.target = target;
    $("#detailedgraphs").append("<div><h3>"+title+"</h3><div id=\""+target+"\"></div></div><hr>");

    self.toggle = false;
    self.nbH = 0;
    self.nbL = 0;

    if (type == "D3"){
      self.graphtype = 3;
    }
    else if(type == 10){
      self.graphtype = 10;
      self.toggledata = [];
      self.heating = false;
    }
  }

  Graph.prototype.getData = function()
  {
    deferred_calls = [];
    for (s in this.streams)
    {
      stream = this.streams[s].stream;
      marker = this.streams[s].marker;
      label = this.streams[s].label;

      if(this.streams[s].toggle == undefined)
      {
        toggle = false;
      } else 
      {
        toggle = this.streams[s].toggle;
        this.toggle = true;
      }

      for(history_seq in this.history_params){
        history_params = this.history_params[history_seq];

        var dfd = $.Deferred();

        xively.datastream.history(this.feed, stream, history_params, ( function(self, marker, label, dfd, toggle) { 
          return function( data ) {
            //console.log(data); // Logs value changes in realtime
            previous = 50;
            current = 0;
            nbH = 0;
            nbL = 0;

            if((self.graphtype == 3) && (self.graphdata[marker] === undefined)){
              self.graphdata[marker] = [];
              if(toggle && self.graphtype != 10)
                self.graphdata["tt"] = [];
            }

            if (data.datapoints !== undefined)
            {
              for(var i = 0; i < data.datapoints.length; i++)
              {
                if(self.graphtype == 3)
                {
                  when =  moment(data.datapoints[i].at).valueOf();
                  //self.graphdata[marker].push({x: moment(data.datapoints[i].at).valueOf(), y: parseFloat(data.datapoints[i].value)});
                  self.graphdata[marker].push({x: when, y: parseFloat(data.datapoints[i].value)});
                  if(toggle)
                  {
                    current = parseFloat(data.datapoints[i].value);
                    if(current > (previous + 0.1)) { self.graphdata["tt"].push({x: when, y: 10.0}); nbH++; }
                    else { self.graphdata["tt"].push({x: when, y: 0.0}); nbL++; }
                    previous = current;
                  }
                } else {
                  if ( self.graphdata[data.datapoints[i].at] === undefined )
                  {
                    self.graphdata[data.datapoints[i].at] = {y: data.datapoints[i].at}; 
                  }
                  /* Insert Value */
                  self.graphdata[data.datapoints[i].at][marker] = data.datapoints[i].value;
                  if(toggle)
                  {
                    current = parseFloat(data.datapoints[i].value);
                    if(self.graphtype == 10){
                      if(current > (previous + 0.15)) { 
                        if(self.heating == false){
                          self.toggledata.push([data.datapoints[i].at]);
                          self.heating = true;
                        }
                        nbH++; 
                      }else {
                        if(self.heating == true){
                          self.toggledata[self.toggledata.length-1].push(data.datapoints[i].at);
                          self.heating = false;
                        }
                        nbL++;
                      }
                    }
                    else {
                      if(current > (previous + 0.15)) { self.graphdata[data.datapoints[i].at]["tt"] = 10; nbH++; }
                      else { self.graphdata[data.datapoints[i].at]["tt"] = 0; nbL++; }
                    }
                    previous = current;
                  }
                }
              }
            }
            
            console.log("Low : %d | High : %d", nbL, nbH);
            self.nbH += nbH;
            self.nbL += nbL;

            if ($.inArray(marker, self.markers) < 0){
              self.markers.push(marker); 
              self.labels.push(label);
            }

            dfd.resolve();
          }
        })(this, marker, label, dfd, toggle));

        deferred_calls.push(dfd.promise());
      }
    }
    return deferred_calls;
  }

  Graph.prototype.getAllData = function()
  {
    $.when.apply(this, this.getData()).done( ( function(self) {
      return function () {
        //console.log(self.graphdata);
        data = [];
        for ( k in self.graphdata ){
          data.push(self.graphdata[k]);
        }
        //console.log(data);
        markers = self.markers;
        labels = self.labels;

        if(self.toggle) {
          markers.push("tt");
          labels.push("Toggle");
        }

        Morris.Line({
          element: self.target,
          data: data,
          xkey: 'y',
          ykeys: markers,
          labels: labels,
          ymin : 'auto'
        });
      }
    })(this));
  }


  Graph.prototype.getAllDataGenSlidingGraph = function()
  {
    $.when.apply(this, this.getData()).done( ( function(self) {
      return function () {
        //console.log(self.graphdata);
        
        markers = self.markers;
        labels = self.labels;

        if(self.toggle) {
          markers.push("tt");
          labels.push("Toggle");
        }

        dataforD3 = [];
        for(l in labels){
          dataforD3.push({ key: labels[l], values: self.graphdata[markers[l]]});
        }

        //console.log(dataforD3);

        $("#"+self.target).append("<svg style=\"height: 500px;\"></svg>");

        nv.addGraph(function() {
          var chart = nv.models.lineWithFocusChart();

          chart.xAxis.tickFormat(function(d) {
            return d3.time.format('%H:%M:%S')(new Date(d))
          }); 

          chart.x2Axis.tickFormat(function(d) {
            return d3.time.format('%H:%M:%S')(new Date(d))
          }); 

          chart.yAxis.tickFormat(d3.format(',.2f'));
          chart.y2Axis.tickFormat(d3.format(',.2f'));

          d3.select('#'+self.target+' svg')
              .datum(dataforD3)
              .call(chart);

          //nv.utils.windowResize(chart.update);

          return chart;
        });

        /* Some stats */
        $("#"+self.target).append("<p class=\"stats\"> On : "+self.nbH+" | Off : "+self.nbL+" | % On : "+(self.nbH*100/(self.nbH+self.nbL))+"</p>");
      }
    })(this));

  }

  Graph.prototype.getAllDataGenSlidingGraphDygraph = function()
  {
    $.when.apply(this, this.getData()).done( ( function(self) {
      return function () {
        //console.log(self.graphdata);
        
        markers = self.markers;
        labels = self.labels;

        if(self.toggle) {
          markers.push("tt");
          labels.push("Toggle");
        }

        $("#"+self.target).append("<div class=\"noroll\" id=\"slidingDygraph_"+self.target+"\"></div>");
        
        data = [];

        for (di in self.graphdata) 
        {
          item = [ new Date(self.graphdata[di].y) ];
          for(t in markers)
          {
            if(self.graphdata[di][markers[t]] !== undefined)
              item.push(parseFloat(self.graphdata[di][markers[t]]));
            else
              item.push(null);
          }
          data.push(item);
        };

        //console.log(data);

        data.sort( function compareFunction(a, b){
          return a[0] - b[0];
        });

        //console.log(data);

        g1 = new Dygraph(
          document.getElementById("slidingDygraph_"+self.target),
          data,
          {
            //title: 'Daily Temperatures in New York vs. San Francisco',
            ylabel: 'Température (C)',
            labels: ["x"].concat(labels),
            legend: 'always',
            labelsDivStyles: { 'textAlign': 'right' },
            showRangeSelector: true,
            rangeSelectorPlotFillColor: "",
            connectSeparatedPoints: true
          }
        );

        /* Some stats */
        $("#"+self.target).append("<p class=\"stats\"> On : "+self.nbH+" | Off : "+self.nbL+" | % On : "+(self.nbH*100/(self.nbH+self.nbL))+"</p>");
      }
    })(this));

  }

   Graph.prototype.getAllDataGenSlidingGraphDygraphNew = function()
  {
    $.when.apply(this, this.getData()).done( ( function(self) {
      return function () {
        //console.log(self.graphdata);
        
        markers = self.markers;
        labels = self.labels;

        if(self.toggle) {
          markers.push("tt");
          labels.push("Toggle");
        }

        $("#"+self.target).append("<div class=\"noroll\" id=\"slidingDygraph_"+self.target+"\"></div>");
        
        data = [];

        for (di in self.graphdata) 
        {
          item = [ new Date(self.graphdata[di].y.substring(0, 20)+"000000Z") ];
          for(t in markers)
          {
            if(self.graphdata[di][markers[t]] !== undefined)
              item.push(parseFloat(self.graphdata[di][markers[t]]));
            else
              item.push(null);
          }
          data.push(item);
        };

        //console.log(data);

        data.sort( function compareFunction(a, b){
          return a[0] - b[0];
        });

        //console.log(data);

        g1 = new Dygraph(
          document.getElementById("slidingDygraph_"+self.target),
          data,
          {
            //title: 'Daily Temperatures in New York vs. San Francisco',
            ylabel: 'Température (C)',
            labels: ["x"].concat(labels),
            legend: 'always',
            labelsDivStyles: { 'textAlign': 'right' },
            showRangeSelector: true,
            rangeSelectorPlotFillColor: "",
            connectSeparatedPoints: true,
            underlayCallback: function(canvas, area, g) {
              canvas.fillStyle = "rgba(255, 30, 0, 0.5)";

              function highlight_period(x_start, x_end) {
                var canvas_left_x = g.toDomXCoord(x_start);
                var canvas_right_x = g.toDomXCoord(x_end);
                var canvas_width = canvas_right_x - canvas_left_x;
                canvas.fillRect(canvas_left_x, area.y, canvas_width, area.h);
              }

              console.log(self.toggledata);

              for (zi in self.toggledata){
                if(self.toggledata[zi].length == 2)
                {
                  highlight_period(new Date(self.toggledata[zi][0]), new Date(self.toggledata[zi][1]));
                }
              }
            }
          }
        );

        /* Some stats */
        $("#"+self.target).append("<p class=\"stats\"> On : "+self.nbH+" | Off : "+self.nbL+" | % On : "+(self.nbH*100/(self.nbH+self.nbL))+"</p>");
      }
    })(this));

  }

  // var g = new Dygraph(
  //       document.getElementById("div_g"),
  //       data,
  //       {
  //         labels: ['Date','Value'],
  //         underlayCallback: function(canvas, area, g) {

  //           canvas.fillStyle = "rgba(255, 255, 102, 1.0)";

  //           function highlight_period(x_start, x_end) {
  //             var canvas_left_x = g.toDomXCoord(x_start);
  //             var canvas_right_x = g.toDomXCoord(x_end);
  //             var canvas_width = canvas_right_x - canvas_left_x;
  //             canvas.fillRect(canvas_left_x, area.y, canvas_width, area.h);
  //           }

  //           var min_data_x = g.getValue(0,0);
  //           var max_data_x = g.getValue(g.numRows()-1,0);

  //           // get day of week
  //           var d = new Date(min_data_x);
  //           var dow = d.getUTCDay();
  //           var ds = d.toUTCString();

  //           var w = min_data_x;
  //           // starting on Sunday is a special case
  //           if (dow == 0) {
  //             highlight_period(w,w+12*3600*1000);
  //           }
  //           // find first saturday
  //           while (dow != 6) {
  //             w += 24*3600*1000;
  //             d = new Date(w);
  //             dow = d.getUTCDay();
  //           }
  //           // shift back 1/2 day to center highlight around the point for the day
  //           w -= 12*3600*1000;  
  //           while (w < max_data_x) {
  //             var start_x_highlight = w;
  //             var end_x_highlight = w + 2*24*3600*1000;
  //             // make sure we don't try to plot outside the graph
  //             if (start_x_highlight < min_data_x) {
  //               start_x_highlight = min_data_x;
  //             }
  //             if (end_x_highlight > max_data_x) {
  //               end_x_highlight = max_data_x;
  //             }
  //             highlight_period(start_x_highlight,end_x_highlight);
  //             // calculate start of highlight for next Saturday 
  //             w += 7*24*3600*1000;
  //           }
  //         }
  //       });
  //   }
