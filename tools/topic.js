const {ipcRenderer} = require('electron');
const plotly = require('../plotly/plotly-latest.min.js');
const fs = require('fs');
const lda = require('lda');

var n_words = document.getElementById('n-words');
var n_topics = document.getElementById('n-topics');

var topics = new Array;

var analysis_input = new Array;

ipcRenderer.send('send-me-data');
ipcRenderer.on('data', (event, data) => {
    analysis_input = data;
})

function getTopics(tweets,n_t,n_w){
    var documents = new Array(tweets.length);
    for(var i=0; i<tweets.length;i++){
        documents[i] = tweets[i].raw.text;
    }
    console.log(documents);
    console.log(n_t);
    console.log(n_w);
    var topics = lda(documents,n_t,n_w);
    console.log(topics);
    return topics;
}

function updateTopicTable(topics){
    var table = document.getElementById('topic-table');
    table.innerHTML = "";
    for(var i=0;i<topics.length;i++){
        var row = table.insertRow(i);
        var string = "";
        for(var j=0;j<topics[i].length;j++){
            t = topics[i][j];
            string += t.term + ": " + t.probability + ", ";
        }
        row.innerHTML = string;
    }
}

function updateTweetTable(){

}

function tagTweets(){

}

var btn_topics = document.getElementById('get-topics');
btn_topics.onclick = function(){
    var topics = getTopics(analysis_input,n_topics.value,n_words.value);
    updateTopicTable(topics);
}

var btn_tag = document.getElementById('tag-tweets');
btn_tag.onclick = function(){

}
