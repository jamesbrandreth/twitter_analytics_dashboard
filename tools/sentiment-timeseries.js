const {ipcRenderer} = require('electron');
const plotly = require('../plotly/plotly-latest.min.js');
const fs = require('fs');
const timeseries = require('./timeseries.js');
const {dialog} = require('electron').remote;
var sentiment = require( 'wink-sentiment' );

var analysis_input = {};
var input_time = document.getElementById('time-increment');
var ts = null;

function tweetSentiment(array_tweets){
    var length = array_tweets.length;
    var total_score = 0;
    for(var i=0;i<length;i++){
        total_score += sentiment(array_tweets[i].raw.text).normalizedScore;
    }
    if(length==0){
        return 0;
    }else{
        return total_score/length;
    }
}

function exportPNG(plot_id){
    plotly.toImage(plot_id, {format: 'png', width: 2000, height: 500}).then(function(dataUrl){
        var data = window.atob(dataUrl.substring( "data:image/png;base64,".length ));
        var asArray = new Uint8Array(data.length);
        for( var i = 0, len = data.length; i < len; ++i ) {
            asArray[i] = data.charCodeAt(i);    
        }
        var filepath = dialog.showSaveDialog({
            filters: [{
                name: 'PNG file',
                extensions: ['png']
            }]
        });
        fs.writeFile(filepath,asArray);
    })
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
    ts = timeseries.generateTimeSeries(input_time.value,analysis_input,tweetSentiment);
    timeseries.plot('plot',ts);
}

var btn_csv = document.getElementById('export-raw');
btn_csv.onclick = function(){
    exportCSV(ts);
}

var btn_png = document.getElementById('export-png');
btn_png.onclick = function(){
    exportPNG('plot');
}
