/* 
 * author : fang yongbao
 * data : 2015.1.19
 * model : 移动端图片自适应滚动插件
 * info ：知识在于积累，每天一小步，成功永远属于坚持的人。
 * blog : http://www.best-html5.net
 */

/*
 *
 * @param {type} option
 * {
 *   @param mainObj: js object,//主元素（需要滚动的元素）
 *   @param leftObj: js object,//点击后向左滚动的元素
 *   @param rightObj: js object,//点击后向左滚动的元素
 *   @param width: number|| "auto",//父元素宽度,可以填auto，或具体的数值，默认auto。auto表示宽度100%,最大值为640px.
 *   @param height: number|| "auto",//元素高度,可以填auto，或具体的数值，默认auto
 *   @param controller: true || false,//是否开启锚点
 *   @param controllerObj: js object,//锚点容器
 * }
 * return obj
 *   none
 *
 *
 */
(function(window) {

	var prefix,
		eventPrefix,
		vendors = {
			Webkit: 'webkit',
			Moz: '',
			O: 'o',
			M: 'm'
		},
		testEl = document.createElement('p');


	for (var key in vendors) {
		if (testEl.style[key + 'TransitionProperty'] !== undefined) {
			prefix = '-' + key.toLowerCase() + '-'
			eventPrefix = vendors[key]
		}
	}

	function normalizeEvent(name) {
		return eventPrefix ? eventPrefix + name : name.toLowerCase()
	}

	var cssSupport = {
		cssPrefix: prefix,
		transitionEnd: normalizeEvent('TransitionEnd'),
		transform: normalizeEvent('Transform'),
		transition: normalizeEvent('Transition')

	}
	var transform = cssSupport.transform;
	var transition = cssSupport.transition;
	var transitionEnd = cssSupport.transitionEnd;
	var isMobile = (function() {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ? true : false;
	})();


	function SwiperModule(opts) {
		if (!opts.mainObj) {
			throw new Error('dom element can not be empty!');
		}

		this.mainObj = opts.mainObj;
		this.leftObj = opts.leftObj || false;
		this.rightObj = opts.rightObj || false;
		this.controllerObj = opts.controller ? opts.controllerObj : null;
		this.liObj = this.mainObj.getElementsByTagName("li");
		this.index = 1;
		this.hLength = this.liObj.length;
		this.width = opts.width || "auto";
		this.height = opts.height || "auto";
		this.autoPlay = opts.autoPlay || true;
		this.time = opts.time || 5000;
		this.mainObj.style.cursor = "hand";
		this.resizeContainer();
		this.bindDOM();

		var timer = null;

		/***
		 * 锚点
		 ****/
		this.controllerObj && this.rendController();

		/***
		 * 开启自动播放*
		 * **/
		this.autoPlay && this.autoPlayer();

		/***
		 * 监听transition结束事件，刷新锚点
		 ****/
		this.transitionEnd();
	}

	SwiperModule.prototype.rendController = function() {
		var controllerObj = this.controllerObj;
		var length = this.hLength;
		var content = "";
		for (var i = 0; i < length; i++) {
			if (i == 0) {
				var _str = "<a class=\"current\">" + (i + 1) + "</a>";
			} else {
				var _str = "<a>" + (i + 1) + "</a>";
			}
			content += _str;
		}
		controllerObj.innerHTML = content;

	};


	/***
	 * 克隆元素*
	 * **/
	SwiperModule.prototype.cloneNode = function() {
		var ulOjb = this.mainObj;
		var liObj = this.liObj;
		var fLi = this.liObj[0];
		var lLi = this.liObj[liObj.length - 1];
		var cfLi = fLi.cloneNode(true);
		var clLi = lLi.cloneNode(true);
		ulOjb.insertBefore(cfLi, null);
		ulOjb.insertBefore(clLi, liObj[0]);
		this.length = this.liObj.length;

	}

	/***
	 * 转屏是刷新元素尺寸
	 ****/
	SwiperModule.prototype.resizeContainer = function() {
		this.cloneNode();
		var width = this.width == "auto" ? (window.innerWidth || document.body.clientWidth) : this.width;
		this.swiperWidth = width > 640 ? 640 : width;
		var liOjb = this.liObj;
		var width = this.swiperWidth;
		var height = this.height == "auto" ? "auto" : (this.height + "px");
		var index = this.index;
		this.mainObj.parentNode.style.width = width + "px";

		for (var i = 0; i < this.length; i++) {

			liOjb[i].style.width = width + "px";
			liOjb[i].style.height = height;


		}

		this.mainObj.style.width = this.length * this.swiperWidth;

		var dis = -(index * width);
		eval("this.mainObj.style." + transition + " = \"none\"");
		eval("this.mainObj.style." + transform + " = \"translate(" + dis + "px,0)\"");

	};


	/***
	 * 绑定事件
	 ****/
	SwiperModule.prototype.bindDOM = function() {
		var _this = this;
		var scaleW = _this.swiperWidth;
		var mainObj = _this.mainObj;
		var isMoving = false;
		var startEvt = isMobile ? 'touchstart' : 'mousedown';
		var moveEvt = isMobile ? 'touchmove' : 'mousemove';
		var endEvt = isMobile ? 'touchend' : 'mouseup';


		var startHandler = function(evt) {
			if (!isMobile) {
				var evt = _this.eventUtil.getEvent(evt);
				_this.eventUtil.preventDefault(evt);
			}

			isMoving = true;
			_this.startX = isMobile ? evt.targetTouches[0].pageX : (evt.pageX || evt.clientX);
			_this.startY = isMobile ? evt.targetTouches[0].pageY : (evt.pageY || evt.clientY);
			_this.offsetX = 0;
			_this.offsetY = 0;
			//new Date() + 1,最快方式获得时间戳
			_this.startTime = new Date() + 1;

			_this.changeTranslate();

			/***
			 * touchstart 关闭autoplay*
			 * **/
			_this.autoPlay && _this.stopAutoPlayer();



		};
		var moveHandler = function(evt) {
			var evt = _this.eventUtil.getEvent(evt);
			_this.eventUtil.preventDefault(evt);
			if (isMoving) {

				var index = _this.index;
				var scaleW = _this.swiperWidth;
				var moveX = isMobile ? evt.targetTouches[0].pageX : (evt.pageX || evt.clientX);
				var moveY = isMobile ? evt.targetTouches[0].pageY : (evt.pageY || evt.clientY);
				_this.offsetX = moveX - _this.startX;
				_this.offsetY = moveY - _this.startY;
				var dis = -(index * scaleW) + _this.offsetX;
				eval("mainObj.style." + transition + " = \"none\"");
				eval("mainObj.style." + transform + " = \"translate(" + dis + "px,0)\"");

			}



		};
		var endHandler = function(evt) {
			isMoving = false;
			var bouceX = scaleW / 6;
			var endTime = new Date() + 1;

			//用户慢操作
			if (endTime - _this.startTime > 800) {
				if (_this.offsetX >= bouceX) {
					_this.go("-1");
				} else if (_this.offsetX < -bouceX) {
					_this.go("1");
				} else {
					_this.go("0");
				}
			} else {
				if (_this.offsetX >= 50) {
					_this.go("-1");
				} else if (_this.offsetX < -50) {
					_this.go("1");
				} else {
					_this.go("0");
				}
			}

			/***
			 * touchend 开启autoplay*
			 * **/
			_this.autoPlay && _this.autoPlayer();


		};
		var orientationchangeHandler = function() {
			setTimeout(function() {
				_this.resizeContainer();
			}, 100);

		};

		if (this.leftObj) {
			this.leftObj.onclick = function() {
				_this.swiperLeft();
			};
		}
		if (this.rightObj) {
			this.rightObj.onclick = function() {
				_this.swiperRight();
			};
		}
		this.eventUtil.addHandler(mainObj, startEvt, startHandler);
		this.eventUtil.addHandler(mainObj, moveEvt, moveHandler);
		this.eventUtil.addHandler(mainObj, endEvt, endHandler);
		this.eventUtil.addHandler(window, "orientationchange", orientationchangeHandler);

	}


	SwiperModule.prototype.changeTranslate = function() {
		var _this = this;
		if (_this.index == 0) {
			_this.index = _this.length - 2;
		} else if (_this.index == _this.length - 1) {

			_this.index = 1;
		}

		var dis = -(_this.index * _this.swiperWidth);

		eval("_this.mainObj.style." + transition + " = \"none\"");
		eval("_this.mainObj.style." + transform + " = \"translate(" + dis + "px,0)\"");
	}

	SwiperModule.prototype.go = function(n) {

		var index = this.index;
		var mainObj = this.mainObj;
		var scaleW = this.swiperWidth;
		var nIndex = index + parseInt(n);
		var length = this.length;

		if (nIndex > length - 1) {
			nIndex = length - 1;
		} else if (nIndex < 0) {
			nIndex = 0;
		}
		this.index = nIndex;
		var dis = -nIndex * scaleW;
		eval("mainObj.style." + transition + " = \"all 0.3s ease-out\"");
		eval("mainObj.style." + transform + " = \"translate(" + dis + "px,0)\"");


	}

	SwiperModule.prototype.swiperLeft = function() {
		this.go(-1);
	}
	SwiperModule.prototype.swiperRight = function() {
		this.go(1);
	}


	SwiperModule.prototype.autoPlayer = function() {
		var _this = this;
		timer = setInterval(function() {
			_this.go(1);
		}, this.time);
	}

	SwiperModule.prototype.stopAutoPlayer = function() {
		var _this = this;

		timer && clearInterval(timer);
	}

	/***
	 * transition结束后的事件
	 * **/
	SwiperModule.prototype.transitionEnd = function() {
		var _this = this;
		_this.eventUtil.addHandler(_this.mainObj, transitionEnd, function() {
			_this.changeTranslate();
			var aList = _this.controllerObj.getElementsByTagName("a");
			var index = _this.index == 0 ? _this.length - 2 : _this.index;
			index = index == _this.length - 1 ? 1 : index;
			for (i = 0; i < aList.length; i++) {
				if (i == index - 1) {
					aList[i].className = "current";
				} else {
					aList[i].className = "";
				}

			}

		});



	};

	/***
	 *兼容IE事件封装
	 ****/
	SwiperModule.prototype.eventUtil = {
		/***添加句柄***/
		addHandler: function(element, type, handler) {
			if (element.addEventListener) {
				element.addEventListener(type, handler, false);
			} else if (element.attachEvent) {
				element.attachEvent("on" + type, handler);
			} else {
				element["on" + type] = handler;
			}

		},
		getEvent: function(event) {
			return event ? event : window.event;
		},
		preventDefault: function(event) {
			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}
		}
	};



	window.SwiperModule = SwiperModule;


})(window)