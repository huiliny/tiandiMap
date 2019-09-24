/*! layer demo */
;!function(){
	var gather = {
	  htdy: $('html, body')
	};
	
	//全局配置
	layer.config({
	  extend: [
		'extend/layer.ext.js' 
		,'skin/moon/style.css'
	  ]
	  //,skin: 'layer-blue'
	});
}();