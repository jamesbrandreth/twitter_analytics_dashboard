
function updateCleanInputTable(){
    var table = document.getElementById('clean-input');
    table.innerHTML = "";
    for (var i = 0; i < clean_input.length; i++){
        var row = table.insertRow(i);
        row.innerHTML = clean_input[i].text.substring(0,50);
    };
    document.getElementById("clean-input-count").innerHTML = "    " + String(clean_input.length);
};

function loadFiles_clean(){
    for(var i=0; i<files.length;i++){
        var file_content = fs.readFileSync(files[i]);
        var tweets = String(file_content).trim().split("\n");
        for(var j=0; j<tweets.length; j ++){
            clean_input.push(JSON.parse(tweets[j]));
        }
    };
    updateCleanInputTable();
};
