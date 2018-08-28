const {ipcRenderer} = require('electron');
const plotly = require('../plotly/plotly-latest.min.js');
const fs = require('fs');
const timeseries = require('./timeseries.js');
const {dialog} = require('electron').remote;
var sentiment = require( 'wink-sentiment' );

var topics;
var analysis_input = {};
var input_time = document.getElementById('time-increment');
var ts = null;

document.getElementById('width').value = 2000;
document.getElementById('height').value = 500;

var chart = {};
chart.title = "";
chart.x_label = "";
chart.y_label = "";
chart.plots = {};

class Series{
    constructor(name,div,keyword,topic,type,data,x,y){
        this.name = name;
        this.time_division = div;
        this.keyword = keyword;
        this.topic = topic;
        this.type = type;
        this.data_type = data;
        this.x = x;
        this.y = y;        
    }
}

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
            type = 'line';
            fill = 'tozeroy'
        }
        data.push({x:series.x,y:series.y,name:series.name,fill:fill,type:type});
    }
    console.log(data);
    plotly.newPlot('plot',data,layout);
}

function updateTopicList(topics){
    console.log(topics);
    var list = document.getElementById('select-topic');
    list.innerHTML = "";
    for(var i=0;i<topics.length;i++){
        list.innerHTML += "\n<option>" + String(i+1) + "</option>";
    }
}

function updateDeleteList(){
    var list = document.getElementById('select-delete');
    var options = "";
    for(var series_name in chart.plots){
        var series = chart.plots[series_name];
        options += "<option>" + series.name + "</option>";
    }
    list.innerHTML = options;
}

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

function generateTimeSeries(time_div,input_tweets,metric){
    var unix_time_div = interpretTimeDiv(time_div);

    var array_times = new Array;
    var array_values = new Array;
    var array_tweet_bins = new Array;
    var indices = {};

    var time_series = {division: time_div, values: [], times: []};

    var last_tweet_time = new Date(input_tweets[0].raw.created_at);
    var first_tweet_time = new Date(input_tweets[0].raw.created_at);
    for(var i=0; i<input_tweets.length;i++){
        var time_i = new Date(input_tweets[i].raw.created_at);
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
    if(time_div=="1 hour"||time_div=="1 day"){
        range_max.setUTCMinutes(0);
        range_min.setUTCMinutes(0);
    }
    if(time_div=="1 day"){
        range_max.setUTCHours(0);
        range_min.setUTCHours(0);
    }
    // console.log(range_max.toUTCString());
    // console.log(range_min.toUTCString());
    var time_i = range_min;
    var i = 0;
    while(time_i.getTime() <= range_max.getTime()){
        // console.log(time_i.getTime());
        // console.log(time_i.toString());
        var t = new Date(time_i);
        array_times.push(t);
        array_values.push(0);
        array_tweet_bins.push([]);
        indices[t] = i;
        time_i.setTime(time_i.getTime() + unix_time_div);
        i++;
    }
    for(var i=0; i<input_tweets.length; i++){
        var t = new Date(input_tweets[i].raw.created_at);
        t.setSeconds(0);
        if(time_div=="1 hour"||time_div=="1 day"){
            t.setUTCMinutes(0);
        }
        if(time_div=="1 day"){
            t.setUTCHours(0);
        }
        array_tweet_bins[indices[t]].push(input_tweets[i]);
    }
    for(var i=0; i<array_tweet_bins.length; i++){
        array_values[i] = metric(array_tweet_bins[i]);
    }
    time_series.values = array_values;
    time_series.times = array_times;
    // console.log(array_values);
    // console.log(array_times);
    // console.log(indices);
    // console.log(time_series);
    return time_series;
}

function totalVolume(array_tweets){
    return array_tweets.length;
}

function keywordFractionFunction(keyword){
    return function(tweets){
        var n_with_keyword = 0;
        var n_total = tweets.length;
        for(var i=0; i<n_total;i++){
            if(tweets[i].raw.text.includes(keyword) || tweets[i].cleaned.join(' ').includes(keyword)){
                n_with_keyword =+ 1;
            }
        }
        console.log(n_with_keyword);
        console.log(n_total);
        return n_with_keyword/n_total;
    }
}

function topicPresenceFunction(topic){
    return function(tweets){
        var bin_topic_score = 0;
        for(var i=0; i<tweets.length;i++){
            bin_topic_score += tweets[i].features.topic_scores[topic].score;
        }
        return bin_topic_score;
    }
}

function topicFractionFunction(topic){
    return function(tweets){
        var bin_topic_score = 0;
        var bin_all_topics_score = 0;
        for(var i=0; i<tweets.length;i++){
            bin_topic_score += tweets[i].features.topic_scores[topic].score;
            for(var j=0; j<topics.length;j++){
                bin_all_topics_score += tweets[i].features.topic_scores[j].score;
            }
        }
        return bin_topic_score/bin_all_topics_score;
    }
}

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

function addSeries(timeseries){
    var name = document.getElementById('series-name').value;
    var div = timeseries.division;
    var type = document.getElementById('series-type').value;
    var data = document.getElementById('type').value;
    var x = timeseries.times;
    var y = timeseries.values;
    chart.plots[name] = new Series(name,div,"","",type,data,x,y);
    console.log(chart);
}

function removeSeries(series_name){
    delete chart.plots[series_name];
    updatePlot();
}

function exportPNG(plot_id){
    var width = document.getElementById('width').value;
    var height = document.getElementById('height').value;
    plotly.toImage(plot_id, {format: 'png', width: width, height: height}).then(function(dataUrl){
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
ipcRenderer.on('data', (event, data, topic_list) => {
    analysis_input = data;
    topics = topic_list;
    updateTopicList(topics);
})

// Show hidden fields:
var data_menu = document.getElementById('type');
var div_keyword = document.getElementById('keyword_div');
var div_user = document.getElementById('user_div');
var div_topic = document.getElementById('topic_div');
data_menu.onchange = function(){
    console.log("click");
    val = data_menu.value;
    if(val=="User Tweet Frequency"){
        div_keyword.style.display = "none";
        div_user.style.display = "block";
        div_topic.style.display = "none";
    }else if(val=="Topic Presence (absolute)"||val=="Topic Sentiment"||val=="Topic Presence (fraction)"){
        div_keyword.style.display = "none";
        div_user.style.display = "none";
        div_topic.style.display = "block";
    }else if(val=="Keyword Frequency"||val=="Keyword Sentiment"||val=="Keyword TF-IDF"){
        div_keyword.style.display = "block";
        div_user.style.display = "none";
        div_topic.style.display = "none";
    }else{
        div_keyword.style.display = "none";
        div_user.style.display = "none";
        div_topic.style.display = "none";
    }
}

var title_box = document.getElementById('title');
title_box.onkeyup = function(event){
    chart.title = title_box.value;
    if(event.keyCode===13){
        updatePlot();
    }
}

var x_box = document.getElementById('x');
x_box.onkeyup = function(event){
    chart.x_label = x_box.value;
    if(event.keyCode===13){
        updatePlot();
    }
}

var y_box = document.getElementById('y');
y_box.onkeyup = function(event){
    chart.y_label = y_box.value;
    if(event.keyCode===13){
        updatePlot();
    }
}

var btn_add = document.getElementById('add');
btn_add.onclick = function(){
    var series_type = document.getElementById('')
    var type = document.getElementById('type').value;
    metric_function = totalVolume;
    switch(type){
        case "Total Tweet Volume":
            metric_function = totalVolume;
            break;
        case "Topic Presence (absolute)":
            var topic = Number(document.getElementById('select-topic').value)-1;
            metric_function = topicPresenceFunction(topic);
            break;
        case "Topic Presence (fraction)":
            var topic = Number(document.getElementById('select-topic').value)-1;
            metric_function = topicFractionFunction(topic);
            break;
        case "User Tweet Frequency":
            break;
        case "Keyword Frequency":
            var word = document.getElementById('keyword').value;
            metric_function = keywordFractionFunction(word);
            break;
        case "Keyword TF-IDF":
            break;
        case "Overall Sentiment":
            metric_function = tweetSentiment;
            break;
        case "Keyword Sentiment":
            break;
        case "Topic Sentiment":
            break;
    }
    ts = generateTimeSeries(input_time.value,analysis_input,metric_function);
    console.log(ts);
    addSeries(ts);
    updatePlot();
    updateDeleteList();
}

var btn_del = document.getElementById('delete');
btn_del.onclick = function(){
    var series_name = document.getElementById('select-delete').value;
    removeSeries(series_name);
    updateDeleteList();
}

var btn_csv = document.getElementById('export-raw');
btn_csv.onclick = function(){
    exportCSV(ts);
}

var btn_png = document.getElementById('export-png');
btn_png.onclick = function(){
    exportPNG('plot');
}
