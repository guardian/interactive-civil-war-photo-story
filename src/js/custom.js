define([
	'beforeAfter'
], function(
	beforeAfter
) {

	var custom = {
		init: function(){
			// all any custom init functions here  
			beforeAfter.init();
		}
	};

	return custom;
});