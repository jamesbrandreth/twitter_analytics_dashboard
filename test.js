const {app} = require('electron').remote;
const {dialog} = require('electron').remote;
const Twit = require('twit');
const fs = require('fs');
const path = require('path');

// Getting the Path
const path_app_data = app.getPath('userData');

