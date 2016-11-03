var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var options = { proxy: 'http://10.3.100.207:8080' };
var _ 		= require('underscore');
var async   = require('async');
var natural = require('natural');
var classifier 	= new natural.BayesClassifier();

var emotions 	= ["CDEF#","CmDbDm#FmAbm","CmBbGAEb","GmDm#AbmAb","BGmFm","BmGCmFAmDm"];
var emo_name    = ["happy","sad/romantic","sad/romantic","disgust/anger","disgust/anger","calm"];
var riffstation = 'https://play.riffstation.com/';
var base_url 	= "https://www.youtube.com/results?search_query=";

var getCode = function(url, callback){
	request(url, options,function(err, resp, body){
		var $ = cheerio.load(body);
		var arr = $(".yt-uix-sessionlink.yt-uix-tile-link.yt-ui-ellipsis.yt-ui-ellipsis-2.spf-link").toArray();
		var str = arr[0].attribs["href"];
		var req = riffstation + str.substring(6,str.length);
		callback(err, req)
	});
}

var getHtml = function(url, callback) {
	request(url, options, function(error, response, html){
	  	callback(error, html);  
	})	
}

var processHtml = function(html, callback) {
	var $ = cheerio.load(html);
	var myStr = $('script').text();
	var myArray = myStr.split('\n');
	var result = '';
	_.each(myArray, function(line) {
		if(line.indexOf("var serialSongChords = [") >= 0) {
			var results = line.substring(line.indexOf('[')+1, line.indexOf(']')).split(',');
			_.each(results, function(chord) {
				if(chord.indexOf('intro') == -1) {
					result += chord.replace(/'/g, '').replace(/"/g, '');
				}
			})
		}
	})
	callback(null, result);
}

module.exports = function(searchParam, finalCallback) {
	var myUrl = base_url + searchParam + 'video song';
	async.waterfall([
		function(callback) {
			getCode(myUrl, callback);
		},
		function(code, callback) {
			getHtml(code, callback);
		},
		function(htmls, callback) {
			processHtml(htmls, callback)
		}
	], function(err, data) {
		var max = 0;
		var maxData = 0;
		if(data == ''){
			finalCallback(null, 'No match found');
		}
		else{
			_.each(emotions, function(chord, value) {
				if(natural.JaroWinklerDistance(chord, data) > maxData) {
					maxData = natural.JaroWinklerDistance(chord, data);
					max = value;
				}
			})
			finalCallback(null, emo_name[max]);
		}
	});
}