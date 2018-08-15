const {ipcRenderer} = require('electron');
var analysis_input = {};

ipcRenderer.send('send-me-data');
ipcRenderer.on('data', (event, data) => {
    analysis_input = data;
    generateTimeseries();
})

var input_keyword = document.getElementById('keyword');
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

function generateTimeseries(){
    var keyword = input_keyword.value;
    var time_div = input_time.value;
    var unix_time_div = interpretTimeDiv(time_div);
    var time_series = {word: keyword, division: time_div,counts: {}};
    // Initialise time series array:
    var last_tweet_time  = Date(analysis_input[0].original.created_at).getTime();
    var first_tweet_time = Date(analysis_input[0].original.created_at).getTime();
    for(var i=0; i<analysis_input.length;i++){
        var time_i = Date(analysis_input[i].original.created_at).getTime();
        if(time_i > last_tweet_time){
            last_tweet_time = time_i;
        }else if(time_i < first_tweet_time){
            first_tweet_time = time_i;
        }
    }
    // round to multiples of time div:
    var range_max = unix_time_div * Math.round(last_tweet_time / unix_time_div);
    var range_min = unix_time_div * Math.round(first_tweet_time / unix_time_div);
    // populate bins:
    for(var time = range_min; time <= range_max; time += unix_time_div){
        time_series.counts[time] = 0;
    }
    console.log(time_series);
}

function plotTimeseries(){

}

function exportSVG(data){

}

