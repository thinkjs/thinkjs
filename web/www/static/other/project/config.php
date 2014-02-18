<?php
return array (
	'TPL_ENGINE' => 'smarty',  //模版引擎，支持smarty和php，小写
	'TPL_LEFT_DELIMITER' => '{=',  //模版左界符
	'TPL_RIGHT_DELIMITER' => '=}',  //模版右界符
	'TPL_SUFFIX' => 'html',  //模板文件后缀名
	'TPL_PATH' => 'tpl/',  //模板目录
	'STATIC_PATH' => 'resource/',  //静态资源的目录
	'FILE_ENCODING' => 'utf-8',  //项目编码
	'MOD_DIRS_CHECK' => true,  //目录结构检测
	'MOD_FILE_CHECK' => true,  //文件命名和位置检测
	'MOD_HTML_REGULAR_CHECK' => true,  //HTML规范检测
	'MOD_CSS_REGULAR_CHECK' => true,  //CSS规范检测
	'MOD_CSS_SPRITES' => false,  //是否进行css sprites
	'MOD_CSS_AUTOCOMPLETE' => false,  //css样式自动补全
	'MOD_JS_COMBINE' => true,  //JS文件是否启用合并
	'MOD_CSS_COMBINE' => true,  //CSS文件是否启用合并
	'MOD_HTML_COMPRESS' => true,  //HTML文件是否启用压缩
	'MOD_JS_COMPRESS' => true,  //JS文件是否启用压缩
	'MOD_CSS_COMPRESS' => true,  //CSS文件是否启用压缩
	'MOD_OPTI_IMG' => false,  //是否优化图片
	'MOD_XSS_AUTO_FIXED' => true,  //是否进行XSS自动修复
	'MOD_IMG_DATAURI' => true,  //将CSS中的图片地址转换为dataURI
	'MOD_STATIC_TO_CDN' => true,  //是否将静态资源上线到CDN
	'MOD_JS_TPL_REPLACE' => false,  //是否进行前端模版替换
	'MOD_STRING_REPLACE' => false,  //是否进行代码替换功能
	'MOD_STATIC_VERSION' => 1  //静态文件版本号，1或者true为query,2为新文件模式
);


