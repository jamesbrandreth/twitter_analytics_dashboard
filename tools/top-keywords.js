const {ipcRenderer} = require('electron');

var tk_number = document.getElementById('tk-number');
var analysis_input = {};

function countWords(){
    var vocabulary = {};
    for(var i=0;i<analysis_input.length;i++){
        var tweet = analysis_input[i].cleaned;
        for(var j=0;j<tweet.length;j++){
            var token = tweet[j];
            if(token in vocabulary){
                vocabulary[token] += 1;
            }else{
                vocabulary[token] = 1;
            }
        }
    }
    return vocabulary;
}

function findTopTokens(number){
    var top_tokens = new Array;
    var counts = countWords();
    var vocab = Object.keys(counts);
    for(var i=0; i<number; i++){
        var max_number = 0;
        var max_token = "";
        for(var j=0;j<vocab.length;j++){
            if(counts[vocab[j]] > max_number){
                max_number = counts[vocab[j]];
                max_token = vocab[j];
            }
        }
        top_tokens.push({max_token,max_number});
        counts[max_token] = 0;
    }
    return top_tokens;
}

function updateResultsTable(tokens){
    var table = document.getElementById('tk-results-table');
    table.innerHTML = "";
    var string = "";
    for(var i=0;i<tokens.length;i++){
        var row = table.insertRow(i);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = tokens[i].max_token;
        cell2.innerHTML = tokens[i].max_number;
    }
}

ipcRenderer.send('send-me-data');
ipcRenderer.on('data', (event, data) => {
    analysis_input = data;
})

tk_number.onkeypress = function(event){
    if(event.keyCode===13){
        var number = tk_number.value;
        var top_tokens = findTopTokens(number);
        updateResultsTable(top_tokens);
    }
}
