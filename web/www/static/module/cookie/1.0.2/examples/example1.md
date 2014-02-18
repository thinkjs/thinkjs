# 基础操作

<style>
	#content { width:350px;height:160px;}
</style>

<div>
	<textarea id="content"></textarea>
</div>

<div>
	<input type="button" id="btnLoad" value="读取" /> &nbsp;
	<input type="button" id="btnSave" value="存储" /> &nbsp;
	<input type="button" id="btnDelete" value="删除" /> &nbsp;
	<input type="button" id="btnRefresh" value="刷新" />
</div>

<script>
    require(['{{module}}'], function(Cookie) {
    	var content = $('#content'),
    		key = '_test_';

    	$('#btnLoad').click(function() {
    		content.val(Cookie.get(key));
    	});    	

    	$('#btnSave').click(function() {
    		Cookie.set(key, content.val());
    	});    	

    	$('#btnDelete').click(function() {
    		Cookie.remove(key);
    	});

    	$('#btnRefresh').click(function() {
    		location.reload();
    	});
    });
</script>
