const {app} = require('electron').remote;
const {dialog} = require('electron').remote;
const {shell} = require('electron').remote;
const Twit = require('twit');
const fs = require('fs');
const path = require('path');
const natural = require('natural');
var lodash = require('lodash');


// Getting the Path
const path_app_data = app.getPath('userData');

class Tweet{
    constructor(raw,cleaned,features){
        this.raw = raw;
        this.cleaned = cleaned;
        this.features = features;
    }
}

// Remembering user settings:
var default_results_save_location
var default_language

// Initialising Array of Tweets:
var tweets = new Array;

var harvest_output_indices = new Array;

var filter_input_indices = new Array;
var filter_output_indices = new Array;

var clean_input_indices = new Array;
var clean_output_indices = new Array;

var analysis_input_indices = new Array;

function stringifyTweet(tweet){
    var str_tweet = '';
    var tweet_tokens = tweet.cleaned;
    for(var i=0;i<tweet_tokens.length;i++){
        str_tweet += ' ' + tweet_tokens[i];
    };
    return str_tweet;
};

function loadRawTweets(index_array){
    // get filepaths from dialog
    var filepaths = dialog.showOpenDialog({
        filters: [{name: 'JSON file', extensions: ['json','jsonl']}]    });
    // load those tweets
    for(var i=0; i<filepaths.length;i++){
        var file_content = fs.readFileSync(filepaths[i]);
        var file_content_array = String(file_content).split("\n");
        if(file_content_array[file_content_array.length-1]==""){
            file_content_array.pop();
        }
        var array_length = file_content_array.length;
        var existing_tweet_array_length = tweets.length;
        var file_tweets = new Array(array_length);
        var new_indices = new Array(array_length)
        for(var j=0;j<file_tweets.length;j++){
            file_tweets[j] = new Tweet(JSON.parse(file_content_array[j]),[],null);
            new_indices[j] = existing_tweet_array_length + j;
        }
        tweets = tweets.concat(file_tweets);
        index_array = index_array.concat(new_indices);
    }
    return index_array;
}

function loadCleanedTweets(index_array){
    // get filepaths from dialog
    var filepaths = [];
    filepaths = dialog.showOpenDialog({
        filters: [{name: 'TAD tweets file', extensions: ['TADt']}]
    });
    // load those tweets
    for(var i=0; i<filepaths.length;i++){
        var file_content = fs.readFileSync(filepaths[i]);
        var file_content_array = String(file_content).split("\n");
        if(file_content_array[file_content_array.length-1]==""){
            file_content_array.pop();
        }
        var array_length = file_content_array.length;
        var existing_tweet_array_length = tweets.length;
        var file_tweets = new Array(array_length);
        var new_indices = new Array(array_length)
        for(var j=0;j<file_tweets.length;j++){
            file_tweets[j] = JSON.parse(file_content_array[j]);
            new_indices[j] = existing_tweet_array_length + j;
        }
        tweets = tweets.concat(file_tweets);
        index_array = index_array.concat(new_indices);
    }
    return index_array;
}

function saveRawTweets(index_array){
    // get filepaths from dialog
    var filepath = dialog.showSaveDialog({
        filters: [{name: 'JSON lines file', extensions: ['jsonl']}]
        });
    for(var i=0;i<index_array.length;i++){
        fs.appendFile(filepath,JSON.stringify(tweets[index_array[i]].raw)+"\n");
    }
    
}

function saveFullTweets(index_array){
    // get filepaths from dialog
    var filepath = dialog.showSaveDialog({
        filters: [{name: 'TAD tweets file', extensions: ['TADt']}]
        });
    for(var i=0;i<index_array.length;i++){
        fs.appendFile(filepath,JSON.stringify(tweets[index_array[i]])+"\n");
    }
    
}

function updateTableRaw(tweets_list,table_id,count_id){
    var table = document.getElementById(table_id);
    table.innerHTML = "";
    // get first 1000 to speed up:
    var table_list = tweets_list.slice(0,1000);
	for (var i = 0; i < table_list.length; i++){
        var tweet = tweets[table_list[i]];
		var row = table.insertRow(i);
		var cell1 = row.insertCell(0);
		var cell2 = row.insertCell(1);
		var cell3 = row.insertCell(2);
		cell1.innerHTML = tweet.raw.user.screen_name;
		cell2.innerHTML = tweet.raw.text.substring(0,70);
		cell3.innerHTML = tweet.raw.created_at;
    }
    document.getElementById(count_id).innerHTML = "    " + String(tweets_list.length);
}

function updateTableCleaned(tweets_list,table_id,count_id){
    var table = document.getElementById(table_id);
    table.innerHTML = "";
    // get first 1000 to speed up:
    var table_list = tweets_list.slice(0,1000);
	for (var i = 0; i < table_list.length; i++){
        var tweet = tweets[table_list[i]];
		var row = table.insertRow(i);
		var cell1 = row.insertCell(0);
		var cell2 = row.insertCell(1);
		var cell3 = row.insertCell(2);
        cell1.innerHTML = tweet.raw.user.screen_name;
		cell2.innerHTML = stringifyTweet(tweet).substring(0,70);
		cell3.innerHTML = tweet.raw.created_at;
    }
    document.getElementById(count_id).innerHTML = "    " + String(tweets_list.length);
}
