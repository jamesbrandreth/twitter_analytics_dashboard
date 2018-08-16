const {ipcRenderer} = require('electron');
const plotly = require('../plotly/plotly-latest.min.js');
var analysis_input = {};

var input_time    = document.getElementById('time-increment');

function interpretTimeDiv(text){
    switch(text){
        case "1 minute":
            return 60000;
            break;
        case "15 minutes":
            return 900000;
            break;
        case "30 minutes":
            return 1800000;
            break;
        case "1 hour":
            return 3600000;
            break;
        case "1 day":
            return 86400000;
            break;
        case "1 week":
            return 604800000;
            break;
    }
}

function generateMinuteSeries(){
    var time_div = input_time.value;
    var unix_time_div = interpretTimeDiv(time_div);

    var array_times = new Array;
    var array_counts = new Array;
    var indices = {};

    var time_series = {division: time_div, counts: [], times: []};

    var last_tweet_time = new Date(analysis_input[0].original.created_at);
    var first_tweet_time = new Date(analysis_input[0].original.created_at);
    for(var i=0; i<analysis_input.length;i++){
        var time_i = new Date(analysis_input[i].original.created_at);
        if(time_i.getTime() > last_tweet_time.getTime()){
            last_tweet_time = time_i;
        }else if(time_i.getTime() < first_tweet_time.getTime()){
            first_tweet_time = time_i;
        }
    }    
    var range_max = new Date();
    var range_min = new Date();
    range_max.setTime(last_tweet_time.getTime());
    range_min.setTime(first_tweet_time.getTime());
    range_max.setUTCSeconds(0);
    range_min.setUTCSeconds(0);
    // console.log(range_max.toUTCString());
    // console.log(range_min.toUTCString());
    var time_i = range_min;
    var i = 0;
    while(time_i.getTime() <= range_max.getTime()){
        // console.log(time_i.getTime());
        // console.log(time_i.toString());
        var t = new Date(time_i);
        array_times.push(t);
        array_counts.push(0);
        indices[t] = i;
        time_i.setTime(time_i.getTime() + unix_time_div);
        i++;
    }
    for(var i=0; i<analysis_input.length; i++){
        var t = new Date(analysis_input[i].original.created_at);
        t.setSeconds(0);
        array_counts[indices[t]] += 1;
    }
    time_series.counts = array_counts;
    time_series.times = array_times;
    // console.log(array_counts);
    // console.log(array_times);
    // console.log(indices);
    // console.log(time_series);
    return time_series;
}

function plotTimeseries(time_series){
    var data = [{
        x: time_series.times,
        y: time_series.counts,
        fill: 'tozeroy',
        type: 'line'
    }];
    plotly.plot('plot',data);
}

function exportSVG(data){

}

ipcRenderer.send('send-me-data');
ipcRenderer.on('data', (event, data) => {
    analysis_input = data;
})

var btn_go = document.getElementById('go');
btn_go.onclick = function(){
    ts = generateMinuteSeries();
    plotTimeseries(ts);
}
