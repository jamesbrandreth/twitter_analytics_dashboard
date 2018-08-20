// Loading API keys from filesystem:
var API_key_location = path.join(path_app_data, 'API_keys.json');
var API_keys = {consumer_key: "", consumer_secret: "", app_only_auth: true};
console.log(API_key_location);
if(fs.existsSync(API_key_location)){
	var API_keys = JSON.parse(fs.readFileSync(API_key_location,'utf8'));
	console.log(API_keys);
	document.getElementById("consumer_key").value = API_keys.consumer_key;
	document.getElementById("consumer_secret").value = API_keys.consumer_secret;
};

// Taking api keys from form:
var form_consumer_key = document.getElementById('consumer_key');
form_consumer_key.onkeyup = function(){
	API_keys.consumer_key = form_consumer_key.value;
};
var form_consumer_secret = document.getElementById('consumer_secret');
form_consumer_secret.onkeyup = function(){
	API_keys.consumer_secret = form_consumer_secret.value;
};

// saving api keys
var btn_save_keys = document.getElementById('api_keys_save');
btn_save_keys.onclick = function(){
	if(API_keys != null){
		console.log(API_keys);
		fs.writeFileSync(API_key_location,JSON.stringify(API_keys));
	};
};

function gotData(err, data, response){
	var incoming_tweet_list = data.statuses;
	var array_length = incoming_tweet_list.length;
	var existing_tweet_array_length = tweets.length;
	var new_indices = new Array(array_length);
	var new_tweet_objects = new Array(array_length);
	for (var i = 0; i < array_length; i++){
		new_tweet_objects[i] = new Tweet(incoming_tweet_list[i],[],null);
		new_indices[i] = existing_tweet_array_length + i;
	}
	tweets = tweets.concat(new_tweet_objects);
	harvest_output_indices = harvest_output_indices.concat(new_indices);
	updateTableRaw(harvest_output_indices,"harvest-results-table","harvest-output-count");
};

function searchTwitter(query,number){
	var T = new Twit(
		API_keys
	);

	var parameters = {
		q: query,
		count: number
	};
	var i = number;
	while(i>0){
		T.get('search/tweets', parameters, gotData);
		i -= 100;
	};
};

// Preparing the search fields
var form_number = document.getElementById('number');
form_number.value = '1';

// Limiting search number
form_number.onkeyup = function(){
	if(Number(form_number.value) > 18000){
		form_number.value = '18000';
	};
};

// Saving search parameters:
btn_save_parameters = document.getElementById('save-search-parameters');
btn_save_parameters.onclick = function(){
	var save_path = dialog.showSaveDialog({
		filters: [{
			name: 'JSON file',
			extensions: ['json']
		}]
	});
	var query = document.getElementById('searchbox').value;
	var number = document.getElementById('number').value;
	var from = document.getElementById('start-date');
	var to = document.getElementById('end-date');
	var parameters = {query: query, number: number, from: from, to: to};
	fs.writeFileSync(save_path,JSON.stringify(parameters));
};

// Clearing parameters
var btn_clear_search_parameters = document.getElementById('clear-search-parameters');
btn_clear_search_parameters.onclick = function(){
	document.getElementById('searchbox').value = null;
	document.getElementById('number').value = 1;
	document.getElementById('start-date').value = null;
	document.getElementById('end-date').value = null;
}

// Loading search parameters:
var btn_load_search_parameters = document.getElementById('load-search-parameters');
btn_load_search_parameters.onclick = function(){
	var filepath = String(dialog.showOpenDialog('openfile'));
	var parameters = JSON.parse(fs.readFileSync(filepath));
	document.getElementById('searchbox').value = parameters.query;
	document.getElementById('number').value = parameters.number;
	document.getElementById('start-date').value = parameters.from;
	document.getElementById('end-date').value = parameters.to;
};

var search_button = document.getElementById('search');
search_button.onclick = function() {
	var search_term = document.getElementById('searchbox').value;
	var number = document.getElementById('number').value;
	var start_date = document.getElementById('start-date').value;
	var end_date = document.getElementById('end-date').value;
	var query = search_term;
	if(start_date != ''){
		query += " since:" + start_date;
	}
	if(end_date != ''){
		query += " until:" + end_date;
	}
	console.log(query);
	searchTwitter(query,number);
};

// Results saving:
var save_results_button = document.getElementById('save-results');
save_results_button.onclick = function(){
	saveRawTweets(harvest_output_indices);
}

// Clear Results:
var btn_clear_results = document.getElementById('clear-results');
btn_clear_results.onclick = function(){
	harvest_output_indices = [];
	updateTableRaw(harvest_output_indices,"harvest-results-table","harvest-output-count");
};

// To clean:
var btn_to_filter = document.getElementById("to-filter");
btn_to_filter.onclick = function(){
	showPanel(1);
	filter_input_indices = harvest_output_indices;
	updateTableRaw(filter_input_indices,"filter-input","filter-input-count");
};