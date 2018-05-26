$(document).ready(function() {
	$('.q-bkgrd').on('click', function(e) {
		var container = $(this).closest('.question-container');
		var answer = $(this).closest('.question-container').find('.answer');
		if (answer.css('display') === 'none') {
			answer.slideDown(function() {
				//slideDown callback
				var nextQ = container.next('.question-container');
				if (nextQ.length) {
					//scroll down to show answer
					$('html,body').animate({
				   		scrollTop: nextQ.offset().top
					});
				}
				else {
					window.scrollTo(0, document.body.scrollHeight);
				}
			});
		}
		else {
			answer.slideUp();
		}
	});
});