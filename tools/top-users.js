const {ipcRenderer} = require('electron');

var tu_number = document.getElementById('tu-number');
var analysis_input = {};

function countUsers(){
    var users = {};
    for(var i=0;i<analysis_input.length;i++){
        var user = analysis_input[i].original.user.screen_name;
        if(user in users){
            users[user] += 1;
        }else{
            users[user] = 1;
        }
    }
    return users;
}

function findTopUsers(number){
    var top_users = new Array;
    var counts = countUsers();
    var users = Object.keys(counts);
    for(var i=0; i<number; i++){
        var max_number = 0;
        var max_user = "";
        for(var j=0;j<users.length;j++){
            if(counts[users[j]] > max_number){
                max_number = counts[users[j]];
                max_user = users[j];
            }
        }
        top_users.push({max_user,max_number});
        counts[max_user] = 0;
    }
    console.log(top_users);
    return top_users;
}

function updateResultsTable(users){
    var table = document.getElementById('tu-results-table');
    table.innerHTML = "";
    for(var i=0;i<users.length;i++){
        var row = table.insertRow(i);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = users[i].max_user;
        cell2.innerHTML = users[i].max_number;
    }
}

ipcRenderer.send('send-me-data');
ipcRenderer.on('data', (event, data) => {
    analysis_input = data;
})

tu_number.onkeypress = function(event){
    if(event.keyCode===13){
        var number = tu_number.value;
        var top_users = findTopUsers(number);
        updateResultsTable(top_users);
    }
}
