
const nlp = require('wink-nlp-utils');
// const bm25 = require('wink-bm25-text-search');
// const posTagger = require( 'wink-pos-tagger' );


// Read Parameters from screen
function readParameters(){
    var parameters = {};
    parameters.rm_urls = document.getElementById('remove-urls').checked;
    parameters.lowercase = document.getElementById('lowercase').checked;
    parameters.alphanumerics = document.getElementById('remove-non-alphanumerics').checked;
    parameters.stopwords = document.getElementById('remove-stopwords').checked;
    parameters.lemmatize = document.getElementById('lemmatize').checked;
    parameters.stem = document.getElementById('stem').checked;
    return parameters;
};

function cleanTweet(tweet, parameters){
    var text = tweet.raw.text;
    // remove urls
    if(parameters.rm_urls==true){
        text = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
    }
    // lowercase
    if(parameters.lowercase==true){
        text = nlp.string.lowerCase(text);
    }
    // remove retweet markers (NB is a property of the object, so info not lost)
    text = text.replace(/^rt /g ,'');
    text = text.replace(/[']/g,'');
    // limit to letters and numbers
    if(parameters.alphanumerics==true){
        text = nlp.string.retainAlphaNums(text);
    }
    // remove small words
    //XXXXXXXXXXXXXXXXXXXX
    // remove stop words
    var tokens = nlp.string.tokenize(text);
    if(parameters.stopwords==true){
        tokens = nlp.tokens.removeWords(tokens);
    }
    return tokens;
};

function processTweets(tweet_indices,parameters){
    for(var i=0;i<tweet_indices.length;i++){
        tweets[tweet_indices[i]].cleaned = cleanTweet(tweets[tweet_indices[i]],parameters);
    }
}

// GO!
var btn_clean = document.getElementById('clean');
btn_clean.onclick = function(){
    clean_output_indices = clean_input_indices;
    processTweets(clean_input_indices,readParameters());
	updateTableCleaned(clean_output_indices,"clean-results-table","clean-output-count");
}

// load files
var clean_open_button = document.getElementById("open-clean-tweets");
clean_open_button.onclick = function(){
	clean_input_indices = loadRawTweets(clean_input_indices);
	updateTableRaw(clean_input_indices,"clean-input","clean-input-count");
};

// clear input
var  btn_clean_clear_input = document.getElementById("clear-clean-tweets");
btn_clean_clear_input.onclick = function(){
	clean_input_indices = [];
	updateTableRaw(clean_input_indices,"clean-input","clean-input-count");
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
};

// clear parameters
function clearCleanParameters(){
    document.getElementById('remove-urls').checked = true;
    document.getElementById('lowercase').checked = true;
    document.getElementById('remove-non-alphanumerics').checked = true;
    document.getElementById('remove-stopwords').checked = true;
    document.getElementById('lemmatize').checked = false;
    document.getElementById('stem').checked = false;
};
var clear_clean_parameters = document.getElementById('clear-clean-parameters');
clear_clean_parameters.onclick = clearCleanParameters;

// initisalise default parameters:
clearCleanParameters();
// make lemmtise and stem mutually exlusive
var checkbox_lemma = document.getElementById('lemmatize');
var checkbox_stem = document.getElementById('stem');
checkbox_lemma.onchange = function(){
    if(checkbox_lemma.checked==true){
        checkbox_stem.checked = false;
    }
};
checkbox_stem.onchange = function(){
    if(checkbox_stem.checked==true){
        checkbox_lemma.checked = false;
    }
};

// discard results:
var btn_clear_clean_results = document.getElementById('clear-clean-results');
btn_clear_clean_results.onclick = function(){
    clean_output_indices = [];
    updateTableCleaned(clean_output_indices,"clean-results-table","clean-output-count");
}

// save results:
var btn_save_clean_results = document.getElementById('save-clean-results');
btn_save_clean_results.onclick = function(){
	saveFullTweets(clean_output_indices);
}

// next button:
var btn_to_analyse = document.getElementById('to-analyse');
btn_to_analyse.onclick = function(){
    showPanel(3);
    analysis_input_indices = clean_output_indices;
    updateTableCleaned(analysis_input_indices,"analyse-input-table","analyse-input-count");
};
