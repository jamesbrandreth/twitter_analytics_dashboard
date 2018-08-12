var files = new Array;

function updateRefineInputTable(){
	var table = document.getElementById('filter-input');
	table.innerHTML = "";
	for (var i = 0; i < filter_input.length; i++){
		var row = table.insertRow(i);
		row.innerHTML = filter_input[i].text.substring(0,50);
	};
	document.getElementById("filter-input-count").innerHTML = "    " + String(filter_input.length);
};

function loadFiles_filter(files){
	for(var i=0; i<files.length;i++){
		var file_content = fs.readFileSync(files[i]);
		var tweets = String(file_content).trim().split("\n");
		for(var j=0; j<tweets.length; j ++){
			filter_input.push(JSON.parse(tweets[j]));
		}
	};
	updateRefineInputTable();
};

function tweetIsRetweet(tweet){
	if(tweet.hasOwnProperty('retweeted_status')){
		return true;
	}else{
		return false;
	}
};

function tweetIsReply(tweet){
	if(tweet.in_reply_to_status_id != null){
		return true;
	}else{
		return false;
	}
};

function tweetMatchesRegex(tweet,regex){
	return RegExp(regex).test(tweet.text);
};

function isInList(obj,list){
	for(var i=0; i<list.length; i++){
		if(lodash.isEqual(obj,list[i])){
			return true;
		};
	};
	return false;
};

function updateRefineResultsTable(){
	var table = document.getElementById('refine-results-table');
	table.innerHTML = "";
	for (var i = 0; i < filter_output.length; i++){
		var row = table.insertRow(i);
		var cell1 = row.insertCell(0);
		var cell2 = row.insertCell(1);
		var cell3 = row.insertCell(2);
		cell1.innerHTML = filter_output[i].user.screen_name;
		cell2.innerHTML = filter_output[i].text.substring(0,65);
		cell3.innerHTML = filter_output[i].created_at;
	}
	document.getElementById("refine-count").innerHTML = "    " + String(filter_output.length);
};

// options:
var checkbox_retweets = document.getElementById("include-retweets");
var checkbox_replies = document.getElementById("include-replies");
var checkbox_duplicates = document.getElementById("remove-duplicates");
var regex = document.getElementById("regex-filter");

// load files
var open_button = document.getElementById("open-refine-tweets");
open_button.onclick = function(){
	files = dialog.showOpenDialog();
	loadFiles_filter(files);
};

// clear input
var  btn_refine_clear_input = document.getElementById("clear-refine-tweets");
btn_refine_clear_input.onclick = function(){
	filter_input = [];
	updateRefineInputTable();
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
	filter_output = new Array;
	for(var i=0; i<filter_input.length;i++){
		var pass = true;
		tweet = filter_input[i];
		// console.log(tweet.text);
		if(checkbox_retweets.checked==false){
			if(tweetIsRetweet(tweet)){
				pass = false;
			}
		};
		if(checkbox_replies.checked==false){
			if(tweetIsReply(tweet)){
				pass = false;
			}
		};
		if(checkbox_duplicates.checked==true){
			if(isInList(tweet,filter_output)){
				pass = false;
			}
		};
		if(regex.value != ""){
			if(!tweetMatchesRegex(tweet,regex.value)){
				pass = false;
			}
		}
		// console.log(String(pass));
		if(pass){
			filter_output.push(tweet);
		}
	};
	updateRefineResultsTable();
};

// Results saving:
var save_refine_results_button = document.getElementById('save-filter-results');
save_refine_results_button.onclick = function(){
	var save_path = dialog.showSaveDialog({
		filters: [{
		  name: 'JSON lines file',
		  extensions: ['jsonl']
		}]
		});
	for(i=0;i<filter_output.length;i++){
		fs.appendFile(save_path,JSON.stringify(filter_output[i])+"\n");
	}
}

// Clear Results:
var btn_clear_refine_results = document.getElementById('clear-filter-results');
btn_clear_refine_results.onclick = function(){
	filter_output = new Array;
	updateRefineResultsTable();
};

// To clean:
var btn_to_clean = document.getElementById("to-clean");
btn_to_clean.onclick = function(){
	showPanel(2);
	clean_input = filter_output;
	updateCleanInputTable();
};