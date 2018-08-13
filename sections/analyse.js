const {ipcRenderer} = require('electron')

showChildWindow = function(filename){
    console.log(filename);
    ipcRenderer.send('show_child',filename);
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
