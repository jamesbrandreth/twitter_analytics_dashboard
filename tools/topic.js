const {ipcRenderer} = require('electron');
const plotly = require('../plotly/plotly-latest.min.js');
const fs = require('fs');
const lda = require('lda');

var n_words = document.getElementById('n-words');
var n_topics = document.getElementById('n-topics');

var topics = new Array;

var input_tweets = new Array;

ipcRenderer.send('send-me-data');
ipcRenderer.on('data', (event, data) => {
    input_tweets = data;
})

function getTopics(tweets,n_t,n_w){
    var documents = new Array(tweets.length);
    for(var i=0; i<tweets.length;i++){
        documents[i] = tweets[i].raw.text;
    }
    var topics = lda(documents,n_t,n_w);
    return topics;
}

function updateTopicTable(topics){
    var table = document.getElementById('topic-table');
    table.innerHTML = "";
    for(var i=0;i<topics.length;i++){
        var row = table.insertRow(i);
        var string = "Topic " + String(i+1) + ": ";
        for(var j=0;j<topics[i].length;j++){
            t = topics[i][j];
            string += t.term + ": " + t.probability + ", ";
        }
        row.innerHTML = string;
    }
}

function updateTweetTable(){

}

function scoreTweet(tweet,topics){
    var topic_space_vector = new Array(topics.length);
    var text = tweet.raw.text;
    // iterate over topics:
    for(var i=0; i<topics.length;i++){
        var tweet_score = 0;
        // iterate through topic:
        for(var j=0;j<topics[i].length;j++){
            var word_count = (text.match(new RegExp(topics[i][j].term,'i')) || []).length;
            tweet_score += word_count*topics[i][j].probability;
        }
        var topic_name = "Topic: " + String(i+1);
        topic_space_vector[i] = {topic: topic_name, score: tweet_score};
    }
    return topic_space_vector;
}

function tagTweets(topics){
    for(var i=0;i<input_tweets.length;i++){
        input_tweets[i].features.topic_scores = scoreTweet(input_tweets[i],topics);
        var top_topic = {topic: "None", score: 0};
        for(var j=0; j<input_tweets[i].features.topic_scores.length;j++){
            var topic = input_tweets[i].features.topic_scores[j];
            if(topic.score >= top_topic.score){
                top_topic = topic;
            }
        }
        input_tweets[i].features.topic_tag = top_topic;
    }
}

var btn_topics = document.getElementById('get-topics');
btn_topics.onclick = function(){
    topics = getTopics(input_tweets,n_topics.value,n_words.value);
    updateTopicTable(topics);
}

var btn_tag = document.getElementById('tag-tweets');
btn_tag.onclick = function(){
    tagTweets(topics);
    console.log(input_tweets);

}
