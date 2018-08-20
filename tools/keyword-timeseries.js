const {ipcRenderer} = require('electron');
const plotly = require('../plotly/plotly-latest.min.js');
const fs = require('fs');
const timeseries = require('./timeseries.js');
const {dialog} = require('electron').remote;
const 

var analysis_input = {};
var ts = null;
var input_keyword = document.getElementById('keyword');
var input_time    = document.getElementById('time-increment');

function keywordFractionFunction(keyword){
    return function(tweets){
        var n_with_keyword = 0;
        var n_total = tweets.length;
        for(var i=0; i<n_total;i++){
            if(tweets[i].original.text.includes(keyword) || tweets[i].cleaned.join(' ').includes(keyword)){
                n_with_keyword =+ 100;
            }
        }
        console.log(n_with_keyword);
        console.log(n_total);
        return n_with_keyword/n_total;
    }
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
    var keyword = document.getElementById('keyword').value;
    console.log(keyword);
    var metric = keywordFractionFunction(keyword);
    ts = timeseries.generateTimeSeries(input_time.value,analysis_input,metric);
    timeseries.plot('plot',ts);
}

var btn_csv = document.getElementById('export-raw');
btn_csv.onclick = function(){
    exportCSV(ts);
}
