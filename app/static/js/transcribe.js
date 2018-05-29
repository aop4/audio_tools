/*
To give credit where it may be due, the basic idea for this interface was
derived from here: https://www.google.com/intl/en/chrome/demos/speech.html
However, none of the code is copied verbatim, and various bugs from that demo
are fixed here. Unlike the demo, this version will work properly
on an Android device, allow the user to capture audio for pretty much 
unlimited amounts of time (i.e., stop when they want to instead of at arbitrary
times), not stall when an interim speech recognition result can't be finalized,
and indicate where a new utterance occurred with linebreaks, among other
improvements.
Thanks to the folks who made the Web Speech API, which makes it possible to
offer this service for free.
*/


var SPEECH_API_LANGUAGES = {
	'Afrikaans':                'af-ZA',
	'አማርኛ':                    'am-ET',
	'Azərbaycanca':             'az-AZ',
	'বাংলা (বাংলাদেশ)':     'bn-BD',
	'বাংলা (ভারত)':           'bn-IN',
	'Bahasa Indonesia':'id-ID',
	'Bahasa Melayu':   'ms-MY',
	'Català':          'ca-ES',
	'Čeština':         'cs-CZ',
	'Dansk':           'da-DK',
	'Deutsch':         'de-DE',
	'English (Australia)':'en-AU',
	'English (Canada)':'en-CA',
	'English (India)':'en-IN',
	'English (Kenya)' : 'en-KE',
	'English (Tanzania)' : 'en-TZ',
	'English (Ghana)' : 'en-GH',
	'English (New Zealand)' : 'en-NZ',
	'English (Nigeria)' : 'en-NG',
	'English (South Africa)' : 'en-ZA',
	'English (Philippines)' : 'en-PH',
	'English (United Kingdom)' : 'en-GB',
	'English (United States)' : 'en-US',
	'Español (Argentina)': 'es-AR',
	'Español (Bolivia)' : 'es-BO',
	'Español (Chile)' : 'es-CL',
	'Español (Colombia)' : 'es-CO',
	'Español (Costa Rica)' : 'es-CR',
	'Español (Ecuador)' : 'es-EC',
	'Español (El Salvador)' : 'es-SV',
	'Español (España)' : 'es-ES',
	'Español (Estados Unidos)' : 'es-US',
	'Español (Guatemala)' : 'es-GT',
	'Español (Honduras)' : 'es-HN',
	'Español (México)' : 'es-MX',
	'Español (Nicaragua)' : 'es-NI',
	'Español (Panamá)' : 'es-PA',
	'Español (Paraguay)' : 'es-PY',
	'Español (Perú)' : 'es-PE',
	'Español (Puerto Rico)' : 'es-PR',
	'Español (República Dominicana)' : 'es-DO',
	'Español (Uruguay)' : 'es-UY',
	'Español (Venezuela)' : 'es-VE',
	'Euskara':         'eu-ES',
	'Filipino':        'fil-PH',
	'Français':        'fr-FR',
	'Basa Jawa':       'jv-ID',
	'Galego':          'gl-ES',
	'ગુજરાતી':           'gu-IN',
	'Hrvatski':        'hr-HR',
	'IsiZulu':         'zu-ZA',
	'Íslenska':        'is-IS',
	'Italiano (Italia)':'it-IT',
	'Italiano (Svizzera)':'it-CH',
	'ភាសាខ្មែរ':          'km-KH',
	'Latviešu':        'lv-LV',
	'Lietuvių':        'lt-LT',
	'മലയാളം':          'ml-IN',
	'मराठी':             'mr-IN',
	'Magyar':          'hu-HU',
	'ລາວ':              'lo-LA',
	'Nederlands':      'nl-NL',
	'नेपाली भाषा':        'ne-NP',
	'Norsk bokmål':    'nb-NO',
	'Polski':          'pl-PL',
	'Português (Brasil)':       'pt-BR',
	'Português (Portugal)':              'pt-PT',
	'Română':          'ro-RO',
	'සිංහල':          'si-LK',
	'Slovenščina':     'sl-SI',
	'Basa Sunda':      'su-ID',
	'Slovenčina':      'sk-SK',
	'Suomi':           'fi-FI',
	'Svenska':         'sv-SE',
	'Kiswahili (Tanzania)':       'sw-TZ',
	'Kiswahili (Kenya)':              'sw-KE',
	'ქართული':       'ka-GE',
	'Հայերեն':          'hy-AM',
	'தமிழ் (இந்தியா)' : 'ta-IN',
	'தமிழ் (சிங்கப்பூர்)' : 'ta-SG',
	'தமிழ் (இலங்கை)' : 'ta-LK',
	'தமிழ் (மலேசியா)' : 'ta-MY',
	'Tiếng Việt':      'vi-VN',
	'Türkçe':          'tr-TR',
	'اُردُو (پاکستان)': 'ur-PK',
	'اُردُو (بھارت)': 'ur-IN',
	'Ελληνικά':         'el-GR',
	'български':         'bg-BG',
	'Pусский':          'ru-RU',
	'Српски':           'sr-RS',
	'Українська':        'uk-UA',
	'한국어':            'ko-KR',
	'中文 (普通话 (中国大陆))' : 'cmn-Hans-CN',
	'中文 (普通话 (香港))' : 'cmn-Hans-HK',
	'中文 (中文 (台灣))' : 'cmn-Hant-TW',
	'中文 (粵語 (香港))' : 'yue-Hant-HK',
	'日本語':           'ja-JP',
	'हिन्दी':             'hi-IN',
	'ภาษาไทย':         'th-TH'
};

var VOICE_COMMANDS = {
	'clear the screen':clearScreen,
	'zoom in':increaseFontSize,
	'zoom out':decreaseFontSize,
	'drop the mic':turnOffMic,
	'random background color':randomBackgroundColor,
	'what is the meaning of life':meaningOfLife,
};

var FONT_SIZE_CHANGE = 4; //the value (in px) by which user can increment/decrement font size

var MICROPHONE_MAX_SESSION_LENGTH = 1800000; //30 minutes in msec. Represents
	//the maximum amount of time a session will continue w/o user intervention
var listeningForSpeech = true;

$(document).on('ready', function() {
	//populate the languages dropdown
	var dropdown = $('#dialect-chooser');
	setUpLangDropdown(dropdown);
	//check if the browser is compatible, and alert user if it isn't
	checkBrowser();
	var ear = new webkitSpeechRecognition();
	setupEar(ear);
	dropdown.on('change', function() {
		updateDialect(ear);
	});
	var continuityTimeout; //restarts the speech recognition tool periodically,
	//making longer vocalizations be transcribed more fully
	var pauseTimeout; //after the user pauses for a couple seconds and no final results are found,
		//prevents the API from stalling by making the last result appear to be final
	var micTimeout = setMicTimeout(); //shuts off the mic after a long time (~30 min)
	var prevResult = ''; //the text of the previous speech transcript
	var prevResultTimestamp;

	ear.onresult = function(e) {
		clearTimeout(continuityTimeout);
		clearTimeout(pauseTimeout);
		//I'm not entirely sure why this helps, but it seems to make the API
		//transcribe long, uninterrupted speech more reliably
		continuityTimeout = setTimeout(restart, 10000, ear, false);
		var transcript = '';
		var interimTranscript = '';
		var index = -1;
		for (index = e.resultIndex; index < e.results.length; index++) {
			var result = e.results[index];
			var text = result[0].transcript;
			//If this is the first item in the result set, capitalize it
			if (index == e.resultIndex) {
				text = capFirstLetter(text);
			}
			//on Android mobile, interim results are marked as final.
			//It's a bug in the API. But their confidence value is 0,
			//so we can catch final results, whose confidence value > 0
			if (result.isFinal && result[0].confidence > 0) {
				var date = new Date();
				var currTimestamp = date.getTime();
				//handle other bug on Android phones where the same transcript
				//can be returned multiple times
				if (text !== prevResult || (currTimestamp - prevResultTimestamp) >= 500) {
			        if (! processVoiceCommand(text, ear)) {
			        	transcript += text;
			        }
			        prevResult = text;
			        prevResultTimestamp = currTimestamp;
				}
			}
			//if the result is not marked as final or has a 0 confidence
			//value (i.e., is an interim result on Android devices)
			else {
				interimTranscript += text;
			}
		}
		if (interimTranscript) {
			//sometimes interim transcripts get "stuck" in an
			//interim state indefinitely. The below causes them to
			//be preserved as final after a couple seconds of silence.
			//Keep in mind restart() is not called until *after*
			//those 2 seconds of silence, so first the below code is
			//executed. The boolean parameter causes the next final result
			//to be ignored, because it's derived from this vocalization.
			pauseTimeout = setTimeout(restart, 2000, ear, true);
		}
		updateTranscripts(interimTranscript, transcript, ear, true);
		ear.ignoreNextFinalResult = false;
	};

	ear.onerror = function(e) {

	};

	/*don't allow premature halting of the API; make it keep going
	unless the user has hit the off button or MICROPHONE_MAX_SESSION_LENGTH
	milliseconds have passed.*/
	ear.onend = function(e) {
		ear.stop(); //if stop() isn't called, start() throws an error
		if (listeningForSpeech) {
			ear.start(); //if start() isn't called, the API will stop running
						 //really quickly. Yes, it's a hack :)
		}
	};
	
	$('#off-button').on('click', function() {
		listeningForSpeech = false;
		ear.stop();
		$(this).hide();
		$('#on-button-parent').show();
		$('#mic-status').text('Mic off');
	});
	$('#on-button').on('click', function() {
		//extend audio input time limit after the on button is clicked
		micTimeout = setMicTimeout();
		listeningForSpeech = true;
		ear.start();
		$('#on-button-parent').hide();
		$('#off-button').show();
		$('#mic-status').text('Mic on');
	});
});

/*Configure the speech recognition object.*/
function setupEar(ear) {
	//listen continuously (not just for brief commands)
	ear.continuous = true;
	//get non-finalized (intermediate) results
	ear.interimResults = true;
	ear.maxAlternatives = 1;
	ear.ignoreNextFinalResult = false; //I'm adding this property
	//set initial language for interpretation
	ear.lang = 'en-US';
	//begin recognizing audio
	ear.start();
}

/* Only Chrome fully supports the Web Speech API. Alert the user if their
browser is not equipped with the right tool. This API doesn't seem to work 
on Firefox (at least on Ubuntu), even with a SpeechRecognition object as 
opposed to a webkitSpeechRecognition object, so Firefox will not be sufficient either.
*/
function checkBrowser() {
	if (! window.webkitSpeechRecognition) {
		//eliminate any visual feedback that the mic is on
		$('#on-button-parent').show();
		$('#off-button').hide();
		$('#mic-status').text("Couldn't connect");
		alert("Please use an updated version of Google Chrome or Chromium. The version for iPhones/iPads"+
			" unfortunately doesn't have the needed software installed.");
		throw new Error('Browser is incompatible with Web Speech API. You must use Chrome/Chromium.');
	}
}

/*Return a version of s with the first letter capitalized, handling
the only possible edge case here, where s starts with a space.*/
function capFirstLetter(s) {
	if (!s) {
		return s;
	}
	var start = 0;
	if (s.charAt(0) == ' ') {
		start = 1;
	}
	return s.charAt(start).toUpperCase() + s.slice(start + 1);
}

/*Scroll a div all the way down. obj is a DOM element.*/
function scrollDownIfNeeded(obj) {
	obj.scrollTop = obj.scrollHeight;
}

/* Restarts the speech recognition tool, which then picks up where it
left off. There are various bugs and time limits in the API, making this 
necessary sometimes. The interim transcript is stored and displayed as a
final transcript to maintain continuity in what the user is seeing. */
function restart(ear, ignoreNextFinalResult) {
	console.log(ignoreNextFinalResult);
	//store the interim transcript as a final transcript (i.e., freeze it) if it exists
	updateTranscripts('', $('#interim-transcript').text(), ear, true);
	//if the API is stalled on an interim result, the next final result
	//will just be that interim result
	ear.ignoreNextFinalResult = ignoreNextFinalResult;
	ear.stop(); //triggers ear.onend, so ear.start() is implicitly called
}

/* Add languages to the language dropdown and set the default language. */
function setUpLangDropdown(dropdown) {
	for (var key in SPEECH_API_LANGUAGES) {
		dropdown.append($("<option />").val(SPEECH_API_LANGUAGES[key]).text(key));
	}
	//set the initial language to US English
	dropdown.val('en-US');
}
/* Set the ear's dialect to be the same as the value in the language dropdown. */
function updateDialect(ear) {
	var new_dialect = $("#dialect-chooser").val();
	ear.lang = new_dialect;
}

/*Log the results of speech recognition for the user.*/
function updateTranscripts(interimTranscript, transcript, ear, plainText) {
	//if we're ignoring the next final result and this is a final result,
	//then don't log it
	if (ear.ignoreNextFinalResult && transcript) {
		return;
	}
	var prevTranscript = $('#transcript').html();
	//set/clear the interim transcript
	$('#interim-transcript').text(interimTranscript);
	//update the final transcript if applicable
	var linebreak = transcript ? '<br>' : '';
	if (plainText) {
		transcript = capFirstLetter(transcript);
	}
	if (transcript) {
		$('#transcript').html(prevTranscript + transcript + linebreak);
	}
	scrollDownIfNeeded($('.transcript-container')[0]);
}

/* Returns a timeout that causes the page to stop taking input after
a certain amount of time with the mic on.
This is primarily for "privacy" reasons. I'm not doing anything with
the audio, but someone might accidentally leave this running and be a
little weirded out if it captured a day's worth of audio. Also, that
would be wasteful. */
function setMicTimeout() {
	return setTimeout(function() {
		if (listeningForSpeech) {
			$('#off-button').click();
		}
	}, MICROPHONE_MAX_SESSION_LENGTH);
}

/* Receives a potential voice command via the cmd string.
If the command is valid, the corresponding function is executed.
If not, nothing occurs. */
function processVoiceCommand(cmd, ear) {
	var command = cmd.toLowerCase();
	commandFunction = VOICE_COMMANDS[command];
	//if a function is defined for this command, then
	//execute it
	if (commandFunction === meaningOfLife) {
		commandFunction(ear);
	}
	else if (commandFunction) {
		commandFunction();
	}
	return commandFunction;
}

function increaseFontSize() {
	//add 4px to the font size for the transcription
	changeTranscriptFontSize(FONT_SIZE_CHANGE);
}

function decreaseFontSize() {
	//subtract 4px from the font size for the transcription
	changeTranscriptFontSize(-1 * FONT_SIZE_CHANGE);
}

/* Adds change pixels to the font size in the transcript container.
If change is negative, this causes a reduction in the font size.
If the new font size would be 0 or lower, the operation is not
allowed. */
function changeTranscriptFontSize(change) {
	var sizeString = $('.transcript-container').css('font-size');
	var size = parseInt(sizeString.slice(0, sizeString.indexOf('px')));
	var newFontSize = size + change;
	if (newFontSize > 0) {
		$('.transcript-container').css('font-size', newFontSize);
	}
}

/* Clear the text in the transcript box */
function clearScreen() {
	$('#transcript').html('');
	$('#interim-transcript').html('');
}

/* Turn off the microphone */
function turnOffMic() {
	$('#off-button').click();
}

/* Changes the background to a randomly chosen color */
function randomBackgroundColor() {
	var red = generateRandomColorVal();
	var blue = generateRandomColorVal();
	var green = generateRandomColorVal();
	var comma = ', ';
	var colorString = 'rgb('+red+comma+blue+comma+green+')';
	$('body').css('background-color', colorString);
}

/* Returns a random number in the range 0-255 */
function generateRandomColorVal() {
	return Math.floor(Math.random()*255);
}

/* Shows the user the meaning of life. */
function meaningOfLife(ear) {
	updateTranscripts('', '<i class="fas fa-spinner rotate"></i>&#32;Finding meaning', ear, false);
}
