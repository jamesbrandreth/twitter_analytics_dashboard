const {app, BrowserWindow, Menu, dialog, ipcMain} = require("electron");

//main process
const path = require('path');
const url = require('url');

let win

function createWindow(){
    win = new BrowserWindow({width: 1600, height: 900, resizable: false, titleBarStyle: 'hiddenInset'});
    win.loadFile("index.html");
    // win.webContents.openDevTools();
    var template = [{
        label: "Application",
        submenu: [
            { label: "About TAD", selector: "orderFrontStandardAboutPanel:" },
            { type: "separator" },
            { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
        ]}, {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]}
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));

    ipcMain.on('show_child', (event, file, data, topics) => {
        var child_window = new BrowserWindow({width: 1300, height: 700, show: false, titleBarStyle: 'hiddenInset'});
        child_window.loadFile(file);
        child_window.show();
        // child_window.webContents.openDevTools();

        // Send variables to child window
        ipcMain.on('send-me-data', (event) => {
            event.sender.send('data', data, topics);
        })

        ipcMain.on('topic-data-a', (event,data,topics) => {
            win.webContents.send('topic-data-b',data,topics);
        })

        child_window.on('close', function(){
            child_window.hide();
            event.preventDefault();
        })
    });


    win.on('closed', () =>{
        win = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', ()=> {
    if(process.platform !== 'darwin'){
        app.quit()
    }
})

app.on('activate', () => {
    if(win == null){
        createWindow()
    }
})
