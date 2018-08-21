var files = new Array;

function tweetIsRetweet(tweet){
	if(tweet.raw.hasOwnProperty('retweeted_status')){
		return true;
	}else{
		return false;
	}
};

function tweetIsReply(tweet){
	if(tweet.raw.in_reply_to_status_id != null){
		return true;
	}else{
		return false;
	}
};

function tweetMatchesRegex(tweet,regex){
	return RegExp(regex).test(tweet.raw.text);
};

function isInList(obj,list){
	for(var i=0; i<list.length; i++){
		if(lodash.isEqual(obj,list[i])){
			return true;
		};
	};
	return false;
};

function passes(tweet){
	if(checkbox_retweets.checked==false){
		if(tweetIsRetweet(tweet)){
			return false;
		}
	};
	if(checkbox_replies.checked==false){
		if(tweetIsReply(tweet)){
			return false;
		}
	};
	if(checkbox_duplicates.checked==true){
		if(isInList(tweet,filter_output)){
			return false;
		}
	};
	if(regex.value != ""){
		if(!tweetMatchesRegex(tweet,regex.value)){
			return false;
		}
	}
	return true;
}

// options:
var checkbox_retweets = document.getElementById("include-retweets");
var checkbox_replies = document.getElementById("include-replies");
var checkbox_duplicates = document.getElementById("remove-duplicates");
var regex = document.getElementById("regex-filter");

// load files
var open_button = document.getElementById("open-refine-tweets");
open_button.onclick = function(){
	filter_input_indices = loadRawTweets(filter_input_indices);
	updateTableRaw(filter_input_indices,"filter-input","filter-input-count");
};

// clear input
var  btn_refine_clear_input = document.getElementById("clear-refine-tweets");
btn_refine_clear_input.onclick = function(){
	filter_input_indices = [];
	updateTableRaw(filter_input_indices,"filter-input","filter-input-count");
};

// save filters
var btn_save_filters = document.getElementById("save-filter-parameters");
btn_save_filters.onclick = function(){
	var filter_parameters = {include_retweets: checkbox_retweets.checked, include_replies: checkbox_replies.checked,remove_duplicates: checkbox_duplicates.checked, regex: regex.value};
	save_path = dialog.showSaveDialog({
		filters: [{
		  name: 'JSON file',
		  extensions: ['json']
		}]
		});
		fs.writeFileSync(save_path,JSON.stringify(filter_parameters));
};

// load filters
var btn_load_filters = document.getElementById("load-filter-parameters");
btn_load_filters.onclick = function(){
	var filepath = String(dialog.showOpenDialog('openfile'));
	var filter_parameters = JSON.parse(fs.readFileSync(filepath));
	checkbox_retweets.checked = filter_parameters.include_retweets;
	checkbox_replies.checked = filter_parameters.include_replies;
	checkbox_duplicates.checked = filter_parameters.remove_duplicates;
	regex.value = filter_parameters.regex;
};

// clear filters
var btn_clear_filters = document.getElementById("clear-filter-parameters");
btn_clear_filters.onclick = function(){
	checkbox_retweets.checked = false;
	checkbox_replies.checked = false;
	checkbox_duplicates.checked = true;
	regex.value = "";
};

// Apply filters and update table
var btn_apply_filters = document.getElementById("filter");
btn_apply_filters.onclick = function(){
	filter_output_indices = new Array;
	for(var i=0; i<filter_input_indices.length;i++){
		var tweet = tweets[filter_input_indices[i]];
		if(passes(tweet)){
			filter_output_indices.push(filter_input_indices[i]);
		}
	};
	updateTableRaw(filter_output_indices,"filter-results-table","filter-output-count");
};

// Results saving:
var save_refine_results_button = document.getElementById('save-filter-results');
save_refine_results_button.onclick = function(){
	saveRawTweets(filter_output_indices);
}

// Clear Results:
var btn_clear_refine_results = document.getElementById('clear-filter-results');
btn_clear_refine_results.onclick = function(){
	filter_output_indices = new Array;
	updateTableRaw(filter_output_indices,"filter-results-table","filter-output-count");
};

// To clean (NEXT):
var btn_to_clean = document.getElementById("to-clean");
btn_to_clean.onclick = function(){
	showPanel(2);
	clean_input_indices = filter_output_indices;
	updateTableRaw(clean_input_indices,"clean-input","clean-input-count");
};