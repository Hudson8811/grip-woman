$(document).ready(function () {
	window.auth = function (data) {
		$.ajax({
			type: "POST",
			url: "/authorize/",
			data: data,
			success: function(data) {
				if (data.length > 0) {
					checkAuth();
				}
			},
			error: function () {
				alert('Ошибка авторизации для продолжения');
			}
		});
	};

	function checkAuth() {
		$.ajax({
			type: "POST",
			url: "/get_hashcode/",
			success: function(data) {
				if (JSON.parse(data).hashcode != '' && JSON.parse(data).hashcode != undefined) {
					hash = JSON.parse(data).hashcode;

					$('.social').each(function () {
						var url = $(this).data('url');
						url += '&u='+encodeURIComponent(hash);
						$(this).attr('data-url', url);
					});
				}
			}
		});
	}
	//checkAuth();

	var socialTypes =  {
		"fb": "http://www.facebook.com/share.php?u=",
		"vk": "http://vkontakte.ru/share.php?url=",
		"tw": "https://twitter.com/intent/tweet?url=",
		"ok": "http://connect.ok.ru/dk?st.cmd=WidgetSharePreview&service=odnoklassniki&st.shareUrl=",
	};

	function getMeta(name) {
		var meta = $('meta[property="og:'+name+'"]');
		return meta.length ? meta.attr('content') : '';
	}

	$('.social__link').click(function() {
		/*var no_sharing = $(this).closest('.social').attr('data-nosharing');
		if (no_sharing) return;*/

		var socialType;
		for (var name in socialTypes)
			if ($(this).hasClass(name)) { socialType = name; break; }
		if (socialType == undefined) return;

		var url = getMeta('url');
		var title = getMeta('title');
		var description = getMeta('description');
		var image = getMeta('image');

		var parent = $(this).closest('.social');
		var new_url = parent.attr('data-url');
		if (new_url) {
			url = new_url;
			image = '';
		}
		if (url == '') url = window.location.toString();

		var p_desc = parent.attr('data-description');
		if (p_desc) description = p_desc;
		var p_title = parent.attr('data-title');
		if (p_title) title = p_title;
		var p_image = parent.attr('data-image');
		if (p_image) image = p_image;

		console.log(123);

		var $slink = encodeURIComponent(url);
		switch (socialType) {
			case 'tw':
				$slink += '&text='+encodeURIComponent(title); break;
			case 'vk':
				if (image != '') $slink += '&image='+encodeURIComponent(image);
				if (title != '') $slink += '&title='+encodeURIComponent(title);
				if (description != '') $slink += '&description='+encodeURIComponent(description); break;
			case 'ok':
				if (image != '') $slink += '&st.imageUrl='+encodeURIComponent(image);
				if (description != '') $slink += '&st.comments='+encodeURIComponent(description); break;
			case 'fb':
				if (image != '') $slink += '&p[images][0]='+encodeURIComponent(image);
				if (title != '') $slink += '&p[title]='+encodeURIComponent(title);
				if (description != '') $slink += '&p[summary]='+encodeURIComponent(description); break;
		}

		console.log($(this).data('mode'));
		if ($(this).data('mode') == 'nohash'){
			window.open(socialTypes[socialType]+$slink,socialType,'width=500,height=500,resizable=yes,scrollbars=yes,status=yes');
		} else {
			if (hash === '') checkAuth();
			window.open(socialTypes[socialType]+$slink,socialType,'width=500,height=500,resizable=yes,scrollbars=yes,status=yes');
			afterShare(socialType);
		}

	}
	);

	function afterShare(social) {
		$.ajax({
			type: "POST",
			url: "/new_share/",
			data: { social_share : social },
			success: function(data) {
				console.log('share ok');
			}
		});
	}

	//////////////////

	$.getJSON('phrases.json', function (data) {
		phrases = data;

		index = -1;
		setInterval(function () {
			++index;

			if(index >= phrases.phrases.length) {
				index = 0;
				mixArray(phrases.phrases);
			}

			$('.screen__woman-speech span').slideUp();
			setTimeout(function () {
				$('.screen__woman-speech span').html(phrases.phrases[index].you);
			}, 300);
			$('.screen__woman-speech span').slideDown();
			$('.screen__gripp-speech span').slideUp();
			setTimeout(function () {
				$('.screen__gripp-speech span').html(phrases.phrases[index].enemy);
			}, 300);
			$('.screen__gripp-speech span').slideDown();
		}, 6000);
	});

	$('.screen__start').click(function () {
		$('.screen--main').hide();
		$('.screen--step').show();
	});

	$('.result__btn').click(function () {
		$('.screen--result').hide();
		$('.screen--step').show();
		curQuestion = 0;
		countQuestion = 1;
		yourPoints = 0;
		enemyPoints = 0;
		$('.your-points').html(yourPoints);
		$('.enemy-points').html(enemyPoints);
		mixArray(allQuestions.test);
		countQuestion = allQuestions.test.length;
		curQuestion++;
		setQuestion(curQuestion, allQuestions);
	});

	////////////////

	curQuestion = 0;
	countQuestion = 1;
	yourPoints = 0;
	enemyPoints = 0;

	$.getJSON('quiz.json', function (data) {
		allQuestions = data;
		mixArray(allQuestions.test);
		countQuestion = allQuestions.test.length;
		curQuestion++;
		setQuestion(curQuestion, allQuestions);
	});

	$('.question__btn').click(function () {
		var choise = $(this).attr('data-correct');

		if (allQuestions.test[curQuestion-1].correct === choise) {
			yourPoints++;
			$('.your-points').html(yourPoints);
		} else {
			enemyPoints++;
			$('.enemy-points').html(enemyPoints);
		}

		$('.question').hide();
		$('.doctor').show();
	});

	$('.doctor__btn').click(function () {
		if (curQuestion < countQuestion) {
			curQuestion++;
			setQuestion(curQuestion, allQuestions);
		} else {
			showResults(yourPoints);
		}
	});
});

function mixArray(arr) {
	var curIndex = arr.length, temp, randIndex;

	while (0 !== curIndex) {
		randIndex = Math.floor(Math.random() * curIndex);
		curIndex -= 1;
		temp = arr[curIndex];
		arr[curIndex] = arr[randIndex];
		arr[randIndex] = temp;
	}

	return arr;
}

function setQuestion(curQuestion, allQuestions) {
	//$('.popup-share__card:visible').hide().siblings().eq(Math.floor(Math.random() * 9)).show();

	var quest = allQuestions.test[curQuestion - 1],
		title = quest.question,
		answer = quest.answer,
		titleAns = answer.title,
		quote = answer.quote,
		author = answer.author;

	$('.question__text').html(title);
	$('.doctor__title').html(titleAns);
	$('.doctor__content p').html(quote);
	$('.doctor__author-name').html(author);

	$('.question').show();
	$('.doctor').hide();
}

function showResults(result1) {
	$.getJSON('result.json', function (data) {
		var result = data;
		var win = 1;

		if (result1 > 4) {
			win = 1;
		} else {
			win = 0;
		}

		$('.question').show();
		$('.doctor').hide();

		$('.screen--step').hide();
		win === 1 ? $('.screen--win').show() : $('.screen--lose').show();

		$('.quiz__result-title').html(result.result[win].title);
		$('.quiz__result-text').html(result.result[win].text);
	})
}
