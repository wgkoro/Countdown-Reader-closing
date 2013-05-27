/*
* Count down the days to Google Reader closing.
* http://goodbyereader.wingall.com/
* 
* Copyright (c) 2013, @wg_koro (http://zafiel.wingall.com/)
* 
* Licensed under the MIT.
**/
(function(){
	var time;
	var elem_cache = {};
	var config = {};
	config.time_limit	= '2013/7/1 00:00:01';
	config.over_px		= 5;
	config.twitter_logo	= '/static/img/twitter.png';
	config.delay		= 10000;
	config.color_interval	= 60000;
	config.color	= [
		'#E54B4B',
		'#A2C5BF',
		'#167C80',
		'#0082C8',
		'#72616E',
		'#E8846B',
		'#16528E',
		'#A2C5BF'
	];
	config.color_len = config.color.length;

	var ajax = {
		start	: false,
		page		: 1,
		token		: null,
		json_data	: [],
		language	: function(){
			var lang	= null;
			try{
				lang	= (navigator.browserLanguage || navigator.language || navigator.userLanguage).substr(0,2);
			}
			catch(e){}

			if(lang != 'ja') return 'en';

			return 'ja';
		},
		getData	: function(){
			var options = {
				type	: 'POST',
				url		: './data',
				dataType: 'json',
				data	: {
					_token	: dom.getToken(),
					q		: ajax.page,
					lang	: ajax.language()
				},
				success	: function(js_obj){
					ajax.start	= false;
					if(js_obj.error > 0) return;

					ajax.page++;
					ajax.token	= js_obj.token;
					ajax.json_data = ajax.json_data.concat(js_obj.data);

					if(ajax.page == 2) start();
				},
				error	: function(req, text, errorThrown){
					ajax.start	= false;
				}
			};
			ajax.start	= true;
			$.ajax(options);
		}
	};

	var dom = {
		main_box	: null,
		getToken	: function(){
			if(ajax.token){
				return ajax.token;
			}

			return document.getElementById('_token').value;
		},

		setClass	: function(elem, class_name){
			if(window.ActiveXObject){
				elem.className = class_name;
				return;
			}

			elem.setAttribute('class', class_name);
		},

		createImage	: function(src){
			var img		= document.createElement('img');
			img.width	= 40;
			img.src		= src;
			dom.setClass(img, 'image');

			return img;
		},

		createDivAndLink	: function(class_name, link, str){
			var a	= document.createElement('a');
			a.href	= link;
			a.appendChild(document.createTextNode(str));
			a.setAttribute('target', '_blank');

			var div	= document.createElement('div');
			div.appendChild(a);
			dom.setClass(div, class_name);

			return div;
		},

		createTweet		: function(text, urls){
			var unesc_str	= text.replace('&lt;', '<').replace('&gt;', '>');
			var div	= document.createElement('div');
			div.appendChild(document.createTextNode(unesc_str));
			dom.setClass(div, 'text');

			var tweet	= div.innerHTML;
			for(tco in urls){
				var expand_url	= urls[tco];
				if(expand_url.length > 15){
					expand_url = expand_url.substring(0, 20) +'...';
				}

				var a_tag	= '<a href="' +urls[tco] +'" target="_blank" title="' +urls[tco] +'">' +expand_url +'</a>';
				tweet	= tweet.replace(tco, a_tag);
				tweet	= tweet.replace('&amp;', '&');
			}
			div.innerHTML	= tweet;

			return div;
		},

		createTwitterLogo	: function(){
			var img	= document.createElement('img');
			img.src	= config.twitter_logo;
			img.width	= 30;
			dom.setClass(img, 'twitter-logo');

			return img;
		},

		makeBlankElem	: function(elem){
			while(elem.childNodes.length >= 1){
				elem.removeChild(elem.firstChild);
			}
		}
	};

	var selectBackColor = function(){
		var index = parseInt(Math.random() * config.color_len);
		return config.color[index];
	};

	var changeAllColors	= function(){
		dom.main_box.style.backgroundColor = selectBackColor();

		var interval	= 100;
		var len	= Cell.list.length;
		for(var i=0;i<len;i++){
			var n		= i + 1;
			changeEachColor(Cell.list[i], interval*n);
		}
	};

	var changeEachColor	= function(box_inst, interval){
		setTimeout(function(){
			box_inst.changeColor();
		}, interval);
	};

	var FaceBox		= function(td_elem, color){
		var div = document.createElement('div');
		div.setAttribute('class', 'face');
		div.style.backgroundColor = color;
		td_elem.appendChild(div);
		
		this.elem = div;
	};

	var HiddenBox = function(td_elem, color){
		var div		= document.createElement('div');
		div.setAttribute('class', 'move');
		div.style.backgroundColor = color;
		td_elem.appendChild(div);
		
		this.elem	= div;
	};

	var displayTime = function(){
		var digit = function(num){
			num += '';
			if(num.length === 1) num = '0' +num;

			return num;
		};

		var date = new Date();
		var html = date.getFullYear() +'/';
		html += (date.getMonth()+1) +'/';
		html += date.getDate() +' ';
		html += digit(date.getHours()) +':';
		html += digit(date.getMinutes()) +':';
		html += digit(date.getSeconds());

		displayTime.elem.innerHTML = html;
		setTimeout(displayTime, 1000);
	}

	var Time = function(){
		this.elem		= {};
		this.current	= parseInt((+new Date())/1000);
		this.passed	= false;
		this.limit	= Date.parse(config.time_limit);
		this.getDiff();
	};

	Time.prototype.setCache = function(){
		this.elem.day	= document.getElementById('day');
		this.elem.hour	= document.getElementById('hour');
		this.elem.minute	= document.getElementById('minute');
		this.elem.second	= document.getElementById('second');
	};

	Time.prototype.setDiffElem = function(){
		if(this.diff){
			this.elem.day.innerHTML = this.diff.d;
			this.elem.hour.innerHTML = this.diff.h;
			this.elem.minute.innerHTML = this.diff.m;
			this.elem.second.innerHTML = this.diff.s;
		}

		var self	= this;
		setTimeout(function(){
			self.getDiff();
			self.setDiffElem();
		}, 1000);
	};

	Time.prototype.getDiff = function(){
		var time;
		var current = (+new Date());
		if(current >= this.limit){
			this.passed	= true;
			this.calc(current, this.limit);
			return;
		}

		this.calc(this.limit, current);
	};

	Time.prototype.calc = function(from, to){
		var time = {
			d	: 0,
			h	: 0,
			m	: 0,
			s	: 0
		};

		var diff	= parseInt(from) - parseInt(to);
		diff		= parseInt(diff*0.001);

		var date	= parseInt(diff/86400);

		var left	= diff - 86400*date;
		var hour	= parseInt(left/3600);
		
		left		= left - hour*3600;
		var minute	= parseInt(left/60);

		var second	= left - 60*minute;

		time.d		= this.fillZero(date);
		time.h		= this.fillZero(hour);
		time.m		= this.fillZero(minute);
		time.s		= this.fillZero(second);

		this.diff = time;
	};

	Time.prototype.fillZero = function(num){
		if(num < 10) return '0' + num.toString();

		return num;
	};

	Time.prototype.getPostedTime = function(posted_time){
		var posted		= parseInt(posted_time);
		var diff_sec	= this.current - posted;
		var time		= 0;

		if(diff_sec >= 31536000){
			var year	= parseInt(diff_sec/31536000);
			return this.getTimeString(year, 'year');
		}

		if(diff_sec >= 2678400){
			time = parseInt(diff_sec/2678400);
			return this.getTimeString(time, 'month');
		}

		if(diff_sec >= 86400){
			time = parseInt(diff_sec/86400);
			return this.getTimeString(time, 'day');
		}

		if(diff_sec >= 3600){
			time = parseInt(diff_sec/3600);
			return this.getTimeString(time, 'hour');
		}

		if(diff_sec >= 60){
			time = parseInt(diff_sec/60);
			return this.getTimeString(time, 'minute');
		}

		return this.getTimeString(diff_sec, 'second');
	};

	Time.prototype.getTimeString = function(num, unit){
		var str = num + unit;
		if(num > 1) str += 's';

		return str;
	};

	var Cell = function(td_elem, width, height){
		if(typeof width == 'undefined') width = 310;
		if(typeof height == 'undefined') height = 170;

		var color		= selectBackColor();
		this.face		= new FaceBox(td_elem, color);
		this.hidden		= new HiddenBox(td_elem, color);
		this.css		= [0, 0];	// CSS Value [top, left]
		this.css_move	= this.setCssMoveValue(width, height);
		this.setHBoxCss();

		dom.token		= document.getElementById('_token').value;
	};

	Cell.list	= [];
	Cell.color	= {};

	Cell.prototype.changeColor	= function(){
		var color = selectBackColor();
		this.face.elem.style.backgroundColor = color;
		this.hidden.elem.style.backgroundColor = color;
	};

	Cell.prototype.setCssMoveValue = function(width, height){
		w = width + 5;
		h = height + 5;
		return [h, h*-1, w, w*-1];
	};

	Cell.prototype.setHBoxCss = function(){
		var rand = parseInt(Math.random() * 4);
		var css_top		= 0;
		if(rand < 2){
			css_top		= this.css_move[rand];
			this.css[0] = css_top;
			this.css[1] = 0;
		}
		else{
			css_top		= 1;
			this.css[0] = 0;
			this.css[1] = this.css_move[rand];
		}

		this.hidden.elem.style.top		= css_top +'px';
		this.hidden.elem.style.left		= this.css[1] +'px';
	};

	Cell.prototype.addContents = function(obj){
		if(typeof obj == 'undefined') return;

		dom.makeBlankElem(this.hidden.elem);
		this.hidden.elem.appendChild(dom.createImage(obj.image));
		this.hidden.elem.appendChild(dom.createDivAndLink('name', obj.user_url, obj.screen_name));
		this.hidden.elem.appendChild(dom.createTweet(obj.text, obj.urls));
		this.hidden.elem.appendChild(dom.createDivAndLink('time', obj.tweet_url, time.getPostedTime(obj.created_at)));
		this.hidden.elem.appendChild(dom.createTwitterLogo());
	};

	Cell.prototype.startMoveEvent = function(no_delay){
		this.hidden.elem.style.display = 'block';

		var css_val		= 0;
		var css_prop	= 'top';

		if(this.css[0] != 0){
			css_val		= this.css[0];
		}
		else{
			css_prop	= 'left';
			css_val		= this.css[1];
		}

		var delay	= parseInt(Math.random() * 11);
		var self	= this;
		setTimeout(function(){
			self.move(css_prop, css_val);
		}, delay*1000);
	};

	Cell.prototype.move = function(prop, val){
		if(val == 0){
			this.reset();
			return;
		}

		var rate		= 5;
		if(val > 0){
			val = val - rate;
		}
		else{
			val = val + rate;
		}

		var self = this;
		this.hidden.elem.style[prop] = val +'px';
		setTimeout(function(){
			self.move(prop, val);
		}, 10);
	};

	Cell.prototype.copyToFace = function(){
		this.face.elem.innerHTML		= this.hidden.elem.innerHTML;
		this.hidden.elem.style.display	= 'none';
	}

	Cell.prototype.reset = function(){
		var self = this;
		this.copyToFace();

		setTimeout(function(){
			if(ajax.json_data.length < 9 && !ajax.start){
				ajax.getData();
			}

			if(ajax.json_data.length < 1) return;

			self.setHBoxCss();
			self.addContents(ajax.json_data.shift());
			self.startMoveEvent();
		}, config.delay);
	};

	var start = function(){
		var len	= Cell.list.length;
		if(len < 1) return;

		for(var i=0;i<len;i++){
			if(ajax.json_data.length < 1) break;

			var obj = ajax.json_data.shift();
			Cell.list[i].addContents(obj);
			Cell.list[i].startMoveEvent();
		}
	};

	var init = function(){
		ajax.getData();
		time	= new Time();
		time.setCache();
		time.setDiffElem();
		dom.main_box	= document.getElementById('watch');

		dom.main_box.style.backgroundColor = selectBackColor();
		displayTime.elem = document.getElementById('left');
		displayTime();

		var td_list	= document.getElementsByTagName('td');
		var len		= td_list.length;
		for(var i=0;i<len;i++){
			var td = td_list[i];
			if(td.id) continue;

			Cell.list.push(new Cell(td));
		}

		setInterval(changeAllColors, config.color_interval);
	};

	init();
})();
