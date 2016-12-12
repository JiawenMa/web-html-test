exports.route = function(req,res){
	res.statusCode = 200;
	res.setHeader('content-Type','text/plain;charset=utf-8');
	
	if (req.session.username){
		res.end('欢迎，'+req.session.username);
	}
	else{
		res.end('未登录');
	}
	
	
	
	
}
