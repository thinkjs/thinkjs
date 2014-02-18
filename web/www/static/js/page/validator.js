require(["module/handlebars/1.0.0/handlebars"], function(handlebars){
	//错误模版
	var errorTpl = Handlebars.compile($('#errorTpl').html());
	//正常模版
	var resultTpl = Handlebars.compile($('#resultTpl').html());

	function checkUrl(url){
		$('#loading').show();
		var pageUrl = URL_PREFIX + "/index/valid?url="+ encodeURIComponent(url);
		$.post(pageUrl, function(data){
			$('#loading').hide();
			data = JSON.parse(data);
			if (data.errno) {
				$('#checkResult').html(errorTpl(data)).show();
				return false;
			};
			$('#checkResult').html(resultTpl(data)).show();
		})
	}
	var url = $('#urlField').val();
	if (url) {
		checkUrl(url);
	}else{
		location.href = URL_PREFIX || "/";
	}
})