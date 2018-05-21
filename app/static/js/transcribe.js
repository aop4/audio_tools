var languages = {
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

var MICROPHONE_MAX_SESSION_LENGTH = 1800000; //30 minutes in msec
var listeningForSpeech = true;

$(document).on('ready', function() {
	var dropdown = $('#dialect-chooser');
	setUpLangDropdown(dropdown);
	checkBrowser();
	var ear = new webkitSpeechRecognition();
	setupEar(ear);
	dropdown.on('change', function() {
		updateDialect(ear);
	});
	var continuityTimeout;
	var pauseTimeout;
	var micTimeout = setMicTimeout();

	ear.onresult = function(e) {
		clearTimeout(continuityTimeout);
		clearTimeout(pauseTimeout);
		continuityTimeout = setTimeout(restart, 10000, ear, false);
		var transcript = '';
		var interimTranscript = '';
		var index = -1;
		for (index = e.resultIndex; index < e.results.length; index++) {
			var result = e.results[index][0].transcript;
			//If this is the first word in the result set, capitalize it
			if (index == e.resultIndex) {
				result = capFirstLetter(result);
			}
			if (e.results[index].isFinal) {
				transcript += result;
			}
			else {
				interimTranscript += result;
			}
		}
		if (interimTranscript) {
			//sometimes interim transcripts get "stuck" in an
			//interim state indefinitely and are later erased
			//by unrelated final transcripts. The below causes them to
			//be preserved as final after a couple seconds of silence.
			//Keep in mind restart() is not called until *after*
			//those 2 seconds of silence, so first the below code is
			//executed
			pauseTimeout = setTimeout(restart, 2000, ear, true);
		}
		updateTranscripts(interimTranscript, transcript, ear);
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

function setupEar(ear) {
	//listen continuously (not just for brief commands)
	ear.continuous = true;
	//get non-finalized (intermediate) results
	ear.interimResults = true;
	ear.ignoreNextFinalResult = false; //I'm adding this property
	//set initial language for interpretation
	ear.lang = 'en-US';
	//begin recognizing audio
	ear.start();
}

function checkBrowser() {
	if (! window.webkitSpeechRecognition) {
		alert('Please use an updated version of Google Chrome or Chromium.');
		throw new Error('Browser is incompatible with Web Speech API. You must use Chrome/Chromium.');
	}
}

/*Return a version of s with the first letter capitalized, handling
the only possible edge case here, where s starts with a space.*/
function capFirstLetter(s) {
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

function restart(ear, ignoreNextFinalResult) {
	updateTranscripts('', $('#interim-transcript').text(), ear);
	ear.ignoreNextFinalResult = ignoreNextFinalResult;
	ear.stop();
}

function setUpLangDropdown(dropdown) {
	for (var key in languages) {
		dropdown.append($("<option />").val(languages[key]).text(key));
	}
	dropdown.val('en-US');
}
/*Set the ear's dialect to be the same as the value in the language dropdown.*/
function updateDialect(ear) {
	var new_dialect = $("#dialect-chooser").val();
	ear.lang = new_dialect;
}

/*Log the results of speech recognition for the user.*/
function updateTranscripts(interimTranscript, transcript, ear) {
	//if we're ignoring the next final result and this is a final result,
	//then don't log it
	if (ear.ignoreNextFinalResult && transcript) {
		return;
	}
	var prevTranscript = $('#transcript').html();
	var linebreak = transcript ? '<br>' : '';
	//set/clear the interim transcript
	$('#interim-transcript').text(interimTranscript);
	//update the final transcript if applicable
	if (transcript) {
		$('#transcript').html(prevTranscript + capFirstLetter(transcript) + linebreak);
	}
	scrollDownIfNeeded($('.transcript-container')[0]);
}

/*After a certain amount of time when the mic is on, stop taking input.
This is primarily for "privacy" reasons. I'm not doing anything with
the audio, but someone might accidentally leave this running and be a
little weirded out if it captured a day's worth of audio. Also, that
would be wasteful.*/
function setMicTimeout() {
	return setTimeout(function() {
		if (listeningForSpeech) {
			$('#off-button').click();
		}
	}, MICROPHONE_MAX_SESSION_LENGTH);
}
