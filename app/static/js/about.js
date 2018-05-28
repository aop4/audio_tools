$(document).ready(function() {
	$('.q-bkgrd').on('click', function(e) {
		var container = $(this).closest('.question-container');
		var answer = container.find('.answer');
		changeArrowDirection(container);
		if (answer.css('display') === 'none') {
			answer.slideDown(function() {
				// slideDown callback
				$('html,body').animate({
			   		scrollTop: container.offset().top
				});
			});
		}
		else {
			answer.slideUp();
		}
	});
});

function changeArrowDirection(container) {
	var downArrow = container.find('.down-arrow');
	var upArrow = container.find('.up-arrow');
	if (downArrow.css('display') === 'none') {
		upArrow.hide();
		downArrow.show();
	}
	else {
		upArrow.show();
		downArrow.hide();
	}
}