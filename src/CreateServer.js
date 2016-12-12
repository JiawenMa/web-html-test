var http = require('http');
var PORT = 8000;

var fs = require('fs');
var path = require("path");
//var event = require("events");

var url = require('url');
var mime = require("./mime").types;
var config =require("./config");

const querystring = require('querystring');
var sessionData = {};

http.createServer( function (request, response) {  
//	console.log(request.url.indexOf('/'));
   	if (request.url.indexOf('/asset/') == 0) {
   		//静态文件请求
// 		console.log(request.url.indexOf('/'));
   		var pathname = url.parse(request.url).pathname;
   		var realPath = '.' + pathname;
//	   	var realPath = path.join("./asset",pathname);
		fs.exists(realPath, function (exists) {
			//如果文件目录不存在
			console.log("Request for " + realPath + " received.");	
	        if (!exists) {	
	            response.writeHead(404, "Not Found", {'Content-Type': 'text/plain'});
	            response.write("This request URL " + pathname + " was not found on this server.");
	            response.end();
	        } else {			
				//判断文件类型
	            var ext = path.extname(realPath);
	            ext = ext ? ext.slice(1) : 'unknown';
	            var contentType = mime[ext] || "text/plain";
	            response.setHeader("Content-Type", contentType);
	           	
	            fs.stat(realPath, function (err, stat) {
					//读取文件最后修改时间，判断文件是否过期
	            	var lastModified = stat.mtime.toUTCString();
	                var ifModifiedSince = "If-Modified-Since".toLowerCase();
	                response.setHeader("Last-Modified", lastModified);
	
	                if (ext.match(config.Expires.fileMatch)) {
	                	//判断后缀名是否符合要添加过期时间头的条件
	                    var expires = new Date();
	                    expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);
	                    response.setHeader("Expires", expires.toUTCString());
	                    response.setHeader("Cache-Control", "max-age=" + config.Expires.maxAge);
	                }
	                
	                if (request.headers[ifModifiedSince] && lastModified == request.headers[ifModifiedSince]) {
	                	//检测浏览器是否发送了If-Modified-Since请求头
	                    response.writeHead(304, "Not Modified");
	                    response.end();
	                } else {
	//              	console.log( "If-Modified-Since check");
	//              	console.log( realPath + " reading1");
	                    fs.readFile(realPath, "binary", function(err, file) {
	//                  	console.log( realPath + " reading2");	
	                        if (err) {
	                            response.writeHead(500, "Internal Server Error", {'Content-Type': 'text/plain'});
	                            response.end(err);
	                        } else {
	                            response.writeHead(200, "Ok");
	                            response.write(file, "binary");
	                            response.end();
	                        }
	                    });
	                    
	                }
	            });
	        }
	    });
    }else{
   	
	   	//动态文件请求
	    var cookies = querystring.parse(request.headers['cookie']);
		var skey = cookies['skey'];
		if(!skey){
			
			skey = 's-' + new Date().getTime() + '-' + Math.random();
			response.setHeader('Set-Cookie', 'skey=' + skey);
		}
	
		// 没有对应的session的新建一个
		if(!sessionData[skey]){
			sessionData[skey] = {};
		}
	
		// 获取当前请求对应的session
		request.session = sessionData[skey];
	
		// 路由转发
		// 登录
		if (request.url == '/login') {
			console.log("route login" );
			require('./route/login').route(request, response);
			return;
		}
		// 首页
		if (request.url == '/index'||request.url == '/') {
			require('./route/index').route(request, response);
			return;
		}
	}

	
}).listen(8000);

console.log('Server running at http://127.0.0.1:8000 Please open the 127.0.0.1:8000/asset/header.html');