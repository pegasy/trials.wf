$(function(){
	$.ctrl('B', function(){
		$('#table tr.failed').toggleClass('animate-flicker');
	});
	$.ctrl('E',function(){
		$('#table tr[data-players*="Eureka.seveN"],[data-host="Eureka.seveN"]').addClass('failed');
	});
});

$.ctrl = function(key, callback, args) {
    var isCtrl = false;
    $(document).keydown(function(e) {
        if(!args) args=[]; // IE barks when args is null
		
        if(e.keyCode == key.charCodeAt(0) && e.ctrlKey) {
            callback.apply(this, args);
            return false;
        }
    });        
};