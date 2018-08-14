const {ipcRenderer} = require('electron')

showChildWindow = function(filename){
    console.log(filename);
    ipcRenderer.send('show_child',filename, analysis_input);
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
var btn_kt = document.getElementById('keyword-timeseries');
btn_kt.onclick = function(){
    showChildWindow('./tools/keyword-timeseries.html');
};
var btn_ut = document.getElementById('user-timeseries');
btn_ut.onclick = function(){
    showChildWindow('./tools/user-timeseries.html');
};
var btn_st = document.getElementById('sentiment-timeseries');
btn_st.onclick = function(){
    showChildWindow('./tools/sentiment-timeseries.html');
};

//INPUT

function stringifyTweet(tweet){
    var str_tweet = '';
    var tweet = tweet['cleaned'];
    for(var i=0;i<tweet.length;i++){
        str_tweet += ' ' + tweet[i];
    };
    return str_tweet;
};

function updateAnalyseInputTable(){
    var table = document.getElementById('analyse-input');
    table.innerHTML = "";
    for (var i = 0; i < analysis_input.length; i++){
        var row = table.insertRow(i);
        row.innerHTML =  stringifyTweet(analysis_input[i]).substring(0,50);
    };
    document.getElementById("analyse-input-count").innerHTML = "    " + String(analysis_input.length);
};

function loadFiles_analysis(files){
    for(var i=0; i<files.length;i++){
        var file_content = fs.readFileSync(files[i]);
        var tweets = String(file_content).trim().split("\n");
        for(var j=0; j<tweets.length; j ++){
            analysis_input.push(JSON.parse(tweets[j]));
        }
    };
    updateAnalyseInputTable();
};

// load files
var analysis_open_button = document.getElementById("open-analyse-tweets");
analysis_open_button.onclick = function(){
    var files = dialog.showOpenDialog();
    loadFiles_analysis(files);
};

// clear input
var  btn_analysis_clear_input = document.getElementById("clear-analyse-tweets");
btn_analysis_clear_input.onclick = function(){
	analysis_input = [];
	updateAnalyseInputTable();
};

