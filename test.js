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
var query 		= "evare video";
var happySong 	= 'https://play.riffstation.com/?v=nYh-n7EOtMA';
var sadSong 	= 'https://play.riffstation.com/?v=kCdjvTTnzDU';
var testSong 	= 'https://play.riffstation.com/';
var base_url 	= "https://www.youtube.com/results?search_query=";
var term 		= "nee jathaga video";
var myUrl 		= base_url + term;

var getCode = function(url, callback){
	request(url, options,function(err, resp, body){
		var $ = cheerio.load(body);
		var arr = $(".yt-uix-sessionlink.yt-uix-tile-link.yt-ui-ellipsis.yt-ui-ellipsis-2.spf-link").toArray();
		var str = arr[0].attribs["href"];
		var req = testSong + str.substring(6,str.length);
		console.log(req);
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
	//console.log(data);
	var max = 0;
	var maxData = 0;
	if(data == ''){
		console.log('No match found. We\' fix this soon.');
	}
	else{
		_.each(emotions, function(chord, value) {
			if(natural.JaroWinklerDistance(chord, data) > maxData) {
				maxData = natural.JaroWinklerDistance(chord, data);
				max = value;
			}
		})
		console.log(emo_name[max]);
	}
});

var http = require('http');
var fs = require('fs');
var formidable = require("formidable");
var util = require('util');

var server = http.createServer(function (req, res) {
    if (req.method.toLowerCase() == 'get') {
        displayForm(res);
    } else if (req.method.toLowerCase() == 'post') {
        processAllFieldsOfTheForm(req, res);
    }

});

function displayForm(res) {
    fs.readFile('index.html', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
                'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}

function processAllFieldsOfTheForm(req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        //Store the data from the fields in your data store.
        //The data store could be a file or database or any other store based
        //on your application.
        res.writeHead(200, {
            'content-type': 'text/plain'
        });
        res.write('received the data:\n\n');
        res.write(util.inspect({
            fields: fields,
            files: files
        }));
        console.log(fields.search);
        async.waterfall([
			function(callback) {
				getCode(base_url + fields.search + "video song", callback);
			},
			function(code, callback) {
				getHtml(code, callback);
			},
			function(htmls, callback) {
				processHtml(htmls, callback)
			}
		], function(err, data) {
			//console.log(data);
			var max = 0;
			var maxData = 0;
			if(data == ''){
				console.log('No match found. We\'ll fix this soon.');
				res.end('Something went wrong. We\'ll fix this soon');
			}
			else{
				_.each(emotions, function(chord, value) {
					if(natural.JaroWinklerDistance(chord, data) > maxData) {
						maxData = natural.JaroWinklerDistance(chord, data);
						max = value;
					}
				})
				console.log(emo_name[max]);
				res.end(emo_name[max]);
			}
		});
    });
}

server.listen(1185);
console.log("server listening on 1185");