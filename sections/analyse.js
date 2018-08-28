const {ipcRenderer} = require('electron')

// recvieving tagged tweets back
ipcRenderer.on('topic-data-b', (event, data,topic_list) => {
    topics = topic_list;
    for(var i=0; i<analysis_input_indices.length; i++){
        tweets[analysis_input_indices[i]].features = data[i];
    }
    console.log(tweets);
})

showChildWindow = function(filename){
    console.log(filename);
    var analysis_input = new Array(analysis_input_indices.length);
    for(var i=0;i<analysis_input_indices.length;i++){
        analysis_input[i] = tweets[analysis_input_indices[i]];
    }
    ipcRenderer.send('show_child',filename, analysis_input, topics);
};

var btn_tk = document.getElementById('top-keywords');
btn_tk.onclick = function(){
    showChildWindow('./tools/top-keywords.html');
};
var btn_tu = document.getElementById('top-users');
btn_tu.onclick = function(){
    showChildWindow('./tools/top-users.html');
};
var btn_os = document.getElementById('overall-sentiment');
btn_os.onclick = function(){
    showChildWindow('./tools/overall-sentiment.html');
};
var btn_ts = document.getElementById('timeseries');
btn_ts.onclick = function(){
    showChildWindow('./tools/timeseries.html')
}
var btn_td = document.getElementById('topic');
btn_td.onclick = function(){
    showChildWindow('./tools/topic.html')
}

// load files
var analysis_open_button = document.getElementById("open-analyse-tweets");
analysis_open_button.onclick = function(){
	analysis_input_indices = loadCleanedTweets(analysis_input_indices);
	updateTableCleaned(analysis_input_indices,"analyse-input-table","analyse-input-count");
};

// clear input
var  btn_analysis_clear_input = document.getElementById("clear-analyse-tweets");
btn_analysis_clear_input.onclick = function(){
	analysis_input_indices = [];
	updateTableCleaned(analysis_input_indices,"analyse-input-table","analyse-input-count");
};
