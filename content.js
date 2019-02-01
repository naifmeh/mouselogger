"use strict";

var indexofqm=-1;
var turl="";
var urlsub="";

chrome.runtime.onMessage.addListener(msg => {
	if(msg.action=="keylog-data") {
		turl=msg.data;
		console.log(turl);
		indexofqm=turl.indexOf("?");
		urlsub=turl.substring(indexofqm+1);
		decode(urlsub); 
	}
});

function decode(encoded) {
	let obj = document.getElementById('dencoder');
	let tmp = decodeURIComponent(encoded.replace(/\+/g,  " "));
	tmp = tmp.replace(/<timestamp/g, "\r\n<timestamp");
	tmp = tmp.replace(/[0-9][0-9]:[0-9][0-9]>/g, function myFunction(x){return x.concat("\r\n");});
	tmp = tmp.replace(/>\r\n\r\n<timestamp/g,">\r\n<timestamp");
	if(tmp.indexOf("\r\n")==0) {
		tmp = tmp.substring(2);
	}
	let a=tmp.indexOf(">\r\n");
	if(a < 33) {
		tmp = tmp.substring(a+3);
	}
	obj.value= tmp;
	obj.scrollTop = obj.scrollHeight;
}
