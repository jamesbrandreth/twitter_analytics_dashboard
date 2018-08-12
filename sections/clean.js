
const nlp = require('wink-nlp-utils');
// const bm25 = require('wink-bm25-text-search');
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
        tweets_set.push({'original': tweets[i], 'cleaned': cleanTweet(tweets[i])});
    }
    return tweets_set;
}

function stringifyTweet(tweet){
    var str_tweet = '';
    var tweet = tweet['cleaned'];
    for(var i=0;i<tweet.length;i++){
        str_tweet += ' ' + tweet[i];
    };
    return str_tweet;
};

function updateCleanResultsTable(){
    var table = document.getElementById('clean-results-table');
    table.innerHTML = "";
    for (var i = 0; i < clean_output.length; i++){
        var row = table.insertRow(i);
        console.log(clean_output[i]['cleaned'])
        row.innerHTML = stringifyTweet(clean_output[i]).substring(0,70);
    }
    document.getElementById("clean-count").innerHTML = "    " + String(clean_output.length);
};

// GO!
var btn_clean = document.getElementById('clean');
btn_clean.onclick = function(){
    console.log('click');
    clean_output = processTweets(clean_input);
    updateCleanResultsTable();
}

// load files
var clean_open_button = document.getElementById("open-clean-tweets");
clean_open_button.onclick = function(){
    var files = dialog.showOpenDialog();
    loadFiles_clean();
};

// Read Parameters from screen
function readParameters(){
    var parameters = {};
    parameters.rm_urls = document.getElementById('remove-urls').checked;
    parameters.lowercase = document.getElementById('lowercase').checked;
    parameters.alphanumerics = document.getElementById('remove-non-alphanumerics').checked;
    parameters.stopwords = document.getElementById('remove-stopwords').checked;
    parameters.lemmatize = document.getElementById('lemmatize').checked;
    parameters.stem = document.getElementById('stem').checked;
    parameters.tokenise = document.getElementById('tokenise').checked;
    console.log(parameters);
    return parameters;
};

// Save Parameters
var save_clean_parameters = document.getElementById('save-clean-parameters');
save_clean_parameters.onclick = function(){
    var filepath = dialog.showSaveDialog({
		filters: [{
		  name: 'TAD process parameters',
		  extensions: ['TADp']
		}]
    });
    fs.writeFile(filepath,JSON.stringify(readParameters()));
};

// Load parameters
var load_clean_parameters = document.getElementById('load-clean-parameters');
load_clean_parameters.onclick = function(){
    var filepath = String(dialog.showOpenDialog());
    var parameters = JSON.parse(fs.readFileSync(filepath));
    document.getElementById('remove-urls').checked = parameters.rm_urls;
    document.getElementById('lowercase').checked = parameters.lowercase;
    document.getElementById('remove-non-alphanumerics').checked = parameters.alphanumerics;
    document.getElementById('remove-stopwords').checked =  parameters.stopwords;
    document.getElementById('lemmatize').checked = parameters.lemmatize;
    document.getElementById('stem').checked = parameters.stem;
    document.getElementById('tokenise').checked = parameters.tokenise;
};

// clear parameters
function clearCleanParameters(){
    document.getElementById('remove-urls').checked = true;
    document.getElementById('lowercase').checked = true;
    document.getElementById('remove-non-alphanumerics').checked = true;
    document.getElementById('remove-stopwords').checked = true;
    document.getElementById('lemmatize').checked = false;
    document.getElementById('stem').checked = false;
    document.getElementById('tokenise').checked = true;
}
var clear_clean_parameters = document.getElementById('clear-clean-parameters');
clear_clean_parameters.onclick = clearCleanParameters;

// initisalise default parameters:
clearCleanParameters();

// next button:
var btn_to_analyse = document.getElementById('to-analyse');
btn_to_analyse.onclick = function(){
    showPanel(3);
    analysis_input = clean_output;
    // updateAnalyseInputTable();
};
