
const nlp = require('wink-nlp-utils');
// const bm25 = require('wink-bm25-text-search');
// const lemmatize = require('wink-lemmatizer');
// const posTagger = require( 'wink-pos-tagger' );

function updateCleanInputTable(){
    var table = document.getElementById('clean-input');
    table.innerHTML = "";
    for (var i = 0; i < clean_input.length; i++){
        var row = table.insertRow(i);
        row.innerHTML = clean_input[i].text.substring(0,50);
    };
    document.getElementById("clean-input-count").innerHTML = "    " + String(clean_input.length);
};

function loadFiles_clean(files){
    for(var i=0; i<files.length;i++){
        var file_content = fs.readFileSync(files[i]);
        var tweets = String(file_content).trim().split("\n");
        for(var j=0; j<tweets.length; j ++){
            clean_input.push(JSON.parse(tweets[j]));
        }
    };
    updateCleanInputTable();
};

function cleanTweet(tweet){
    var tweet_body = tweet.text;
    var str_clean = nlp.string.lowerCase(nlp.string.retainAlphaNums(tweet_body));
    var tokens = nlp.tokens.removeWords(nlp.string.tokenize(str_clean));
    return tokens;
};

function processTweets(tweets){
    var tweets_set = new Array;
    for(var i=0;i<tweets.length;i++){
        tweets_set.push({original: tweets[i], cleaned: cleanTweet(tweets[i])});
    }
}

function stringifyTweets(tweets){
    var out_tweets = new Array;
    for(var i=0;i<tweets.length;i++){
        var str_tweet;
        var tweet = tweets[i];
        for(var j=0;j<tweet.length;j++){
            str_tweet += ' ' + tweet[i];
        }
        out_tweets.push(str_tweet);
    }
    return out_tweets;
};

function updateCleanResultsTable(){
    var table = document.getElementById('clean-results-table');
    table.innerHTML = "";
    for (var i = 0; i < clean_output.length; i++){
        var row = table.insertRow(i);
        row.innerHTML = clean_output[i].substring(0,70);
    }
    document.getElementById("clean-count").innerHTML = "    " + String(clean_output.length);
};

var btn_clean = document.getElementById('clean');
btn_clean.onclick = function(){
    console.log('click');
    clean_output = processTweets(clean_input);
    updateCleanResultsTable();
}

// load files
var open_button = document.getElementById("open-clean-tweets");
open_button.onclick = function(){
    var files = dialog.showOpenDialog();
    loadFiles_clean();
};
