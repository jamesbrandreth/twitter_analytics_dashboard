const {ipcRenderer} = require('electron');
const plotly = require('../plotly/plotly-latest.min.js');
const fs = require('fs');
const timeseries = require('./timeseries.js');
const {dialog} = require('electron').remote;

var analysis_input = {};
var input_time = document.getElementById('time-increment');
var ts = null;

function totalVolume(array_tweets){
    return array_tweets.length;
}

function plotTimeseries(time_series){
    var data = [{
        x: time_series.times,
        y: time_series.values,
        fill: 'tozeroy',
        type: 'line'
    }];
    plotly.plot('plot',data);
}

function exportCSV(data){
    var filepath = dialog.showSaveDialog({
        filters: [{
            name: 'comma separated variable file',
            extensions: ['csv']
        }]
    });
    for(var i=0;i<data.times.length;i++){
        fs.appendFileSync(filepath,String(data.times[i])+","+String(data.values[i])+"\n");
    };
}

ipcRenderer.send('send-me-data');
ipcRenderer.on('data', (event, data) => {
    analysis_input = data;
})

var btn_go = document.getElementById('go');
btn_go.onclick = function(){
    ts = timeseries.generateTimeSeries(input_time.value,analysis_input,totalVolume);
    plotTimeseries(ts);
}

var btn_csv = document.getElementById('export-raw');
btn_csv.onclick = function(){
    exportCSV(ts);
}
