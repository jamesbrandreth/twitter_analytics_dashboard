const {ipcRenderer} = require('electron');
const plotly        = require('../plotly/plotly-latest.min.js');
const fs            = require('fs');
const timeseries    = require('./timeseries.js');
const {dialog}      = require('electron').remote;
var sentiment       = require('wink-sentiment');

function updatePlot(){
    var data = [];
    var layout = {
        title: chart.title,
        titlefont: {
          family: "helvetica"
        },
        showlegend:true,
        xaxis: {
          title: chart.x_label,
          family: "helvetica"
        },
        yaxis: {
          title: chart.y_label,
          family: "helvetica"
        }
      };
    for(var series_name in chart.plots){
        var series = chart.plots[series_name];
        var fill = 'none';
        var type = series.type;
        if(series.type=="area"){
            type = 'scatter';
            fill = 'tozeroy'
        }
        data.push({x:series.x,y:series.y,name:series.name,fill:fill,type:type});
    }
    console.log(data);
    plotly.newPlot('plot',data,layout);
}

var btn_toggle_splom    = document.getElementById('splom-button');
var btn_toggle_star     = document.getElementById('star-button');
var plot_splom          = document.getElementById('splom-plot');
var plot_star           = document.getElementById('star-plot');

btn_toggle_splom.onclick = function(){
    plot_splom.style.display = "block";
    plot_star.style.display = "none";
    btn_toggle_splom.className = "button button-action";
    btn_toggle_star.className = "button button-default";
}
btn_toggle_star.onclick = function(){
    plot_splom.style.display = "none";
    plot_star.style.display = "block";
    btn_toggle_splom.className = "button button-default";
    btn_toggle_star.className = "button button-action";
}
btn_toggle_splom.click();

function clusterTweets(algorithm, tweets){
    var points = new Array(tweets.length);

}
