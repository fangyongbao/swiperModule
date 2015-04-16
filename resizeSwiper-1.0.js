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


	function SwiperModule(opts) {
		if (!opts.mainObj) {
			throw new Error('dom element can not be empty!');
		}

		this.mainObj = opts.mainObj;
		this.leftObj = opts.leftObj || false;
		this.rightObj = opts.rightObj || false;
		this.controllerObj = opts.controller ? opts.controllerObj : null;
		this.liObj = this.mainObj.getElementsByTagName("li");
		this.length = this.liObj.length;
		this.index = 0;
		this.width = opts.width || "auto";
		this.height = opts.height || "auto";
		this.autoPlay = true;
		this.mainObj.style.cursor = "hand";
		this.resizeContainer(opts);
		this.bindDOM();

		/***
		 * 锚点
		 ****/
		this.controllerObj && this.rendController();
		
		/***
		 * 自动播放
		 ****/
		//this.this.autoPlay && this.autoPlayer();


		/***
		 * 监听transition结束事件，刷新锚点
		 ****/
		this.transitionEnd();



	}

	SwiperModule.prototype.rendController = function() {
		var controllerObj = this.controllerObj;
		var length = this.length;
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
	 * 转屏是刷新元素尺寸
	 ****/
	SwiperModule.prototype.resizeContainer = function() {
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


		eval("this.mainObj.style." + this.support.transition + " = \"all 0.3s ease-out 0.3s\"");
		eval("this.mainObj.style." + this.support.transform + " = \"translate(" + dis + "px,0)\"");

	};


	/***
	 * 绑定事件
	 ****/
	SwiperModule.prototype.bindDOM = function() {
		var self = this;
		var scaleW = self.swiperWidth;
		var mainObj = self.mainObj;
		var isMoving = false;
		var isTouch = self.support.isMobile;
		var startEvt = isTouch ? 'touchstart' : 'mousedown';
		var moveEvt = isTouch ? 'touchmove' : 'mousemove';
		var endEvt = isTouch ? 'touchend' : 'mouseup';


		var startHandler = function(evt) {
			var evt = self.eventUtil.getEvent(evt);
			self.eventUtil.preventDefault(evt);
			isMoving = true;
			self.startX = isTouch ? evt.targetTouches[0].pageX : (evt.pageX || evt.clientX);
			self.startY = isTouch ? evt.targetTouches[0].pageY : (evt.pageY || evt.clientY);
			self.offsetX = 0;
			self.offsetY = 0;
			//new Date() + 1,最快方式获得时间戳
			self.startTime = new Date() + 1;
		};
		var moveHandler = function(evt) {
			var evt = self.eventUtil.getEvent(evt);
			self.eventUtil.preventDefault(evt);
			if (isMoving) {

				var index = self.index;
				var scaleW = self.swiperWidth;
				var moveX = isTouch ? evt.targetTouches[0].pageX : (evt.pageX || evt.clientX);
				var moveY = isTouch ? evt.targetTouches[0].pageY : (evt.pageY || evt.clientY);
				self.offsetX = moveX - self.startX;
				self.offsetY = moveY - self.startY;
				console.log(self.offsetY);
				var dis = -(index * scaleW) + self.offsetX;
				eval("mainObj.style." + self.support.transition + " = \"none\"");
				eval("mainObj.style." + self.support.transform + " = \"translate(" + dis + "px,0)\"");

			}



		};
		var endHandler = function(evt) {
			isMoving = false;
			var bouceX = scaleW / 6;
			var endTime = new Date() + 1;

			//用户慢操作
			if (endTime - self.startTime > 800) {
				if (self.offsetX >= bouceX) {
					self.go("-1");
				} else if (self.offsetX < -bouceX) {
					self.go("1");
				} else {
					self.go("0");
				}
			} else {
				if (self.offsetX >= 50) {
					self.go("-1");
				} else if (self.offsetX < -50) {
					self.go("1");
				} else {
					self.go("0");
				}
			}



		};
		var orientationchangeHandler = function() {
			setTimeout(function() {
				self.resizeContainer();
				self.log('Event: orientationchange');
			}, 100);

		};

		if (this.leftObj) {
			this.leftObj.onclick = function() {
				self.swiperLeft();
			};
		}
		if (this.rightObj) {
			this.rightObj.onclick = function() {
				self.swiperRight();
			};
		}
		this.eventUtil.addHandler(mainObj, startEvt, startHandler);
		this.eventUtil.addHandler(mainObj, moveEvt, moveHandler);
		this.eventUtil.addHandler(mainObj, endEvt, endHandler);
		this.eventUtil.addHandler(window, "orientationchange", orientationchangeHandler);

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
		console.log("index = " + nIndex);

		eval("mainObj.style." + this.support.transition + " = \"all 0.3s ease-out\"");
		eval("mainObj.style." + this.support.transform + " = \"translate(" + dis + "px,0)\"");


	}

	SwiperModule.prototype.swiperLeft = function() {
		this.go("-1");
	}
	SwiperModule.prototype.swiperRight = function() {
		this.go("1");
	}

	/***
	 * transition结束后的事件
	 * **/
	SwiperModule.prototype.transitionEnd = function() {
		'use strict';
		var _this = this,
			events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
			i;
		for (i = 0; i < events.length; i++) {
			_this.eventUtil.addHandler(_this.mainObj, events[i], function() {
				var index = _this.index;
				var aList = _this.controllerObj.getElementsByTagName("a");
				console.log(aList);
				for (i = 0; i < aList.length; i++) {
					if (i == index) {
						aList[i].className = "current";
					} else {
						aList[i].className = "";
					}

				}

			});
		}


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

	/***
	 *判断浏览器支持
	 ****/
	SwiperModule.prototype.support = {
		transition: (function() {
			var el = document.createElement('p'),
				transition = ["webkitTransition", "MozTransition", "OTransition", "MsTransform", "msTransition", "transition"];
			for (var i = 0; i < transition.length; i++) {
				if (transition[i] in el.style) {
					return transition[i];
				}
			}
			return transition[5];
		})(),
		transform: (function() {
			var el = document.createElement('p'),
				transform = ["webkitTransform", "MozTransform", "OTransform", "MsTransform", "msTransform", "transform"];
			for (var i = 0; i < transform.length; i++) {
				if (transform[i] in el.style) {
					return transform[i];
				}
			}
			return transform[5];
		})(),


		isMobile: (function() {
			return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ? true : false;
		})(),

		isTouch: (window.Modernizr && Modernizr.touch === true) || (function() {
			'use strict';
			return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
		})(),

		isTransform3d: (window.Modernizr && Modernizr.csstransforms3d === true) || (function() {
			'use strict';
			var div = document.createElement('div').style;
			return ('webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div);
		})(),

		isTransform: (window.Modernizr && Modernizr.csstransforms === true) || (function() {
			'use strict';
			var div = document.createElement('div').style;
			return ('transform' in div || 'WebkitTransform' in div || 'MozTransform' in div || 'msTransform' in div || 'MsTransform' in div || 'OTransform' in div);
		})(),

		isTransition: (window.Modernizr && Modernizr.csstransitions === true) || (function() {
			'use strict';
			var div = document.createElement('div').style;
			return ('transition' in div || 'WebkitTransition' in div || 'MozTransition' in div || 'msTransition' in div || 'MsTransition' in div || 'OTransition' in div);
		})(),

		isClassList: (function() {
			'use strict';
			var div = document.createElement('div');
			return 'classList' in div;
		})()

	};





	window.SwiperModule = SwiperModule;


})(window)