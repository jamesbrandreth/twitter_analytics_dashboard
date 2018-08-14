const {app} = require('electron').remote;
const {dialog} = require('electron').remote;
const {shell} = require('electron').remote;
const Twit = require('twit');
const fs = require('fs');
const path = require('path');
const natural = require('natural');
var lodash = require('lodash');


// Getting the Path
const path_app_data = app.getPath('userData');

// Remembering user settings:
var default_results_save_location
var default_language

// Initialising Results Arrays:
var harvest_output = new Array;

var filter_input = new Array;
var filter_output = new Array;

var clean_input = new Array;
var clean_output = new Array;

var analysis_input = new Array;
