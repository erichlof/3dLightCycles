var VirtualJoystick = function(opts) {
	opts = opts || {};
	this._container = opts.container || document.body;
	this._strokeStyle = opts.strokeStyle || 'cyan';
	this._stickEl = opts.stickElement || this._buildJoystickStick();
	this._baseEl = opts.baseElement || this._buildJoystickBase();
	this._hideJoystick = opts.hideJoystick || false;
	this._hideButtons = opts.hideButtons || true;
	if('createTouch' in document) this._hideButtons = false;
	this._stationaryBase = opts.stationaryBase || false;
	this._add1Button = opts.add1Button || false;
	this._add2Buttons = opts.add2Buttons || false;
	if (this._add2Buttons) this._add1Button = false;
	this._baseX = this._stickX = opts.baseX || 200;
	this._baseY = this._stickY = opts.baseY || 300;
	
	
	if (this._add1Button) {
		this._strokeStyleButton1 = opts.strokeStyleButton1 || 'orange';
		this._button1El = opts.button1Element || this._buildButton1();
		this._button1PercentLeft = opts.button1PercentLeft || 40;
		this._button1PercentBottom = opts.button1PercentBottom || 1;
			
		if (!this._hideButtons) {
			this._container.appendChild(this._button1El);	
		}
		this._button1El.style.position = "absolute";
		this._button1El.style.display = "none";
		this.button1Pressed = false;
		
	}
	if (this._add2Buttons) {
		this._strokeStyleButton1 = opts.strokeStyleButton1 || 'orange';
		this._button1El = opts.button1Element || this._buildButton1();
		this._button1PercentLeft = opts.button1PercentLeft || 40;
		this._button1PercentBottom = opts.button1PercentBottom || 1;

		if (!this._hideButtons) {
			this._container.appendChild(this._button1El);	
		}
		this._button1El.style.position = "absolute";
		this._button1El.style.display = "none";
		this.button1Pressed = false;
		
		this._strokeStyleButton2 = opts.strokeStyleButton2 || 'magenta';
		this._button2El = opts.button2Element || this._buildButton2();
		this._button2PercentLeft = opts.button2PercentLeft || 50;
		this._button2PercentBottom = opts.button2PercentBottom || 1;
		
		if (!this._hideButtons) {
			this._container.appendChild(this._button2El);
		}
		this._button2El.style.position = "absolute";
		this._button2El.style.display = "none";
		this.button2Pressed = false;
		
	}
	
	if(this._hideJoystick)
		this._stationaryBase = false;

	this._limitStickTravel = opts.limitStickTravel || false;
	if (this._stationaryBase) this._limitStickTravel = true;
	this._stickRadius = opts.stickRadius || 100;
	if (this._stickRadius > 120) this._stickRadius = 120;

	this._container.style.position = "relative";

	this._container.appendChild(this._baseEl);
	this._baseEl.style.position = "absolute";
	this._baseEl.style.display = "none";

	this._container.appendChild(this._stickEl);
	this._stickEl.style.position = "absolute";
	this._stickEl.style.display = "none";

	this._pressed = false;
	this._touchIdx = null;
	var touch = null;
	var x = 0;
	var y = 0;
	var deltaX = 0;
	var deltaY = 0;
	var stickDistance = 0;
	var stickNormalizedX = 0;
	var stickNormalizedY = 0;
	
	//added for THREEx.FirstPersonControls use
	this.previousRotationX = 0;
	this.previousRotationY = 0;

	if (this._stationaryBase) {
		this._baseEl.style.display = "";
		this._baseEl.style.left = (this._baseX - this._baseEl.width / 2) + "px";
		this._baseEl.style.top = (this._baseY - this._baseEl.height / 2) + "px";
	}

	if (this._add1Button) {
		this._button1El.style.display = "";
		this._button1El.style.left = this._button1PercentLeft + "%";
		this._button1El.style.bottom = this._button1PercentBottom + "%";
		this._button1El.style.zIndex = "10";
	}
	if (this._add2Buttons) {
		this._button1El.style.display = "";
		this._button1El.style.left = this._button1PercentLeft + "%";
		this._button1El.style.bottom = this._button1PercentBottom + "%";
		this._button1El.style.zIndex = "10";
		
		this._button2El.style.display = "";
		this._button2El.style.left = this._button2PercentLeft + "%";
		this._button2El.style.bottom = this._button2PercentBottom + "%";
		this._button2El.style.zIndex = "10";
	}
	this._transform = (opts.useCssTransform !== undefined ? opts.useCssTransform : true) ? this._getTransformProperty() : false; 
	this._has3d = this._check3D();

	var __bind = function(fn, me) {
		return function() {
			return fn.apply(me, arguments);
		};
	};
	this._$onTouchStart = __bind(this._onTouchStart, this);
	this._$onTouchEnd = __bind(this._onTouchEnd, this);
	this._$onTouchMove = __bind(this._onTouchMove, this);
	
	this._container.addEventListener('touchstart', this._$onTouchStart, false);
	this._container.addEventListener('touchend', this._$onTouchEnd, false);
	this._container.addEventListener('touchmove', this._$onTouchMove, false);	

};

VirtualJoystick.prototype.destroy = function() {

	this._container.removeChild(this._baseEl);
	this._container.removeChild(this._stickEl);
	
	this._container.removeEventListener('touchstart', this._$onTouchStart, false);
	this._container.removeEventListener('touchend', this._$onTouchEnd, false);
	this._container.removeEventListener('touchmove', this._$onTouchMove, false);
		
};

/**
 * @returns {Boolean} true if touchscreen is currently available, false otherwise
 */
VirtualJoystick.touchScreenAvailable = function() {
	return 'createTouch' in document ? true : false;
};

//////////////////////////////////////////////////////////////////////////////////
//                                                                                //
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype.deltaX = function() {
	return this._stickX - this._baseX;
};
VirtualJoystick.prototype.deltaY = function() {
	return this._stickY - this._baseY;
};

VirtualJoystick.prototype.up = function() {
	if (!this._pressed) return false;
	deltaX = this.deltaX();
	deltaY = this.deltaY();
	if (deltaY >= 0) return false;
	if (Math.abs(deltaX) > 2 * Math.abs(deltaY)) return false;
	return true;
};
VirtualJoystick.prototype.down = function() {
	if (!this._pressed) return false;
	deltaX = this.deltaX();
	deltaY = this.deltaY();
	if (deltaY <= 0) return false;
	if (Math.abs(deltaX) > 2 * Math.abs(deltaY)) return false;
	return true;
};
VirtualJoystick.prototype.right = function() {
	if (!this._pressed) return false;
	deltaX = this.deltaX();
	deltaY = this.deltaY();
	if (deltaX <= 0) return false;
	if (Math.abs(deltaY) > 2 * Math.abs(deltaX)) return false;
	return true;
};
VirtualJoystick.prototype.left = function() {
	if (!this._pressed) return false;
	deltaX = this.deltaX();
	deltaY = this.deltaY();
	if (deltaX >= 0) return false;
	if (Math.abs(deltaY) > 2 * Math.abs(deltaX)) return false;
	return true;
};

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._onUp = function() {
	this._pressed = false;
	this._stickEl.style.display = "none";

	if (!this._stationaryBase) {
		this._baseEl.style.display = "none";

		this._baseX = this._baseY = 0;
		this._stickX = this._stickY = 0;
	}
};

VirtualJoystick.prototype._onDown = function(x, y) {
	
	this._pressed = true;
	if (!this._stationaryBase) {
		this._baseX = x;
		this._baseY = y;
		if(!this._hideJoystick){
			this._baseEl.style.display = "";
			this._move(this._baseEl.style, (this._baseX - this._baseEl.width / 2), (this._baseY - this._baseEl.height / 2));
		}
	}
	
	this._stickX = x;
	this._stickY = y;

	if (this._limitStickTravel) {
		deltaX = this.deltaX();
		deltaY = this.deltaY();
		stickDistance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
		if (stickDistance > this._stickRadius) {
			stickNormalizedX = deltaX / stickDistance;
			stickNormalizedY = deltaY / stickDistance;
			this._stickX = stickNormalizedX * this._stickRadius + this._baseX;
			this._stickY = stickNormalizedY * this._stickRadius + this._baseY;
		}
	}
	if(!this._hideJoystick){
		this._stickEl.style.display = "";
		this._move(this._stickEl.style, (this._stickX - this._stickEl.width / 2), (this._stickY - this._stickEl.height / 2));
	}
};

VirtualJoystick.prototype._onMove = function(x, y) {
	this._stickX = x;
	this._stickY = y;

	if (this._limitStickTravel) {
		deltaX = this.deltaX();
		deltaY = this.deltaY();
		stickDistance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
		if (stickDistance > this._stickRadius) {
			stickNormalizedX = deltaX / stickDistance;
			stickNormalizedY = deltaY / stickDistance;

			this._stickX = stickNormalizedX * this._stickRadius + this._baseX;
			this._stickY = stickNormalizedY * this._stickRadius + this._baseY;
		}
	}
	if(!this._hideJoystick){
		this._move(this._stickEl.style, (this._stickX - this._stickEl.width / 2), (this._stickY - this._stickEl.height / 2));
	}
};

VirtualJoystick.prototype._onButton1Up = function() {
	this.button1Pressed = false;
	var ctx = this._button1El.getContext('2d');
	ctx.beginPath();
	ctx.strokeStyle = 'orange';
	ctx.lineWidth = 6;
	ctx.arc(53, 53, 35, 0, Math.PI * 2, true);
	ctx.stroke();
};

VirtualJoystick.prototype._onButton1Down = function() {
	this.button1Pressed = true;
	var ctx = this._button1El.getContext('2d');
	ctx.beginPath();
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 6;
	ctx.arc(53, 53, 35, 0, Math.PI * 2, true);
	ctx.stroke();
};

VirtualJoystick.prototype._onButton2Up = function() {
	this.button2Pressed = false;
	var ctx = this._button2El.getContext('2d');
	ctx.beginPath();
	ctx.strokeStyle = 'magenta';
	ctx.lineWidth = 6;
	ctx.arc(53, 53, 35, 0, Math.PI * 2, true);
	ctx.stroke();
};

VirtualJoystick.prototype._onButton2Down = function() {
	this.button2Pressed = true;
	var ctx = this._button2El.getContext('2d');
	ctx.beginPath();
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 6;
	ctx.arc(53, 53, 35, 0, Math.PI * 2, true);
	ctx.stroke();
};


VirtualJoystick.prototype._onTouchStart = function(event) {

	event.preventDefault();
	var testTouch = event.changedTouches[0];
	if (testTouch.target == this._button1El) {
		return this._onButton1Down();
	}
	else if (testTouch.target == this._button2El) {
		return this._onButton2Down();
	}

	var touches = event.touches;
	if (touches.length == 2) {
		if (touches[0].target != this._button1El && touches[0].target != this._button2El) {
			x = touches[0].pageX;
			y = touches[0].pageY;
			return this._onDown(x, y);
		} 
		else {
			x = touches[1].pageX;
			y = touches[1].pageY;
			return this._onDown(x, y);
		}
	}
	else if (touches.length >= 3) {
		x = touches[2].pageX;
		y = touches[2].pageY;
		return this._onDown(x, y);
	}
	else {
		x = touches[0].pageX;
		y = touches[0].pageY;
		return this._onDown(x, y);
	}
};

VirtualJoystick.prototype._onTouchEnd = function(event) {
  
	touch = event.changedTouches[0];
	if (touch.target == this._button1El) 
		return this._onButton1Up();
	if (touch.target == this._button2El) 
		return this._onButton2Up();
	
	this.previousRotationY = cameraControlsYawObject.rotation.y;
	this.previousRotationX = cameraControlsPitchObject.rotation.x;

	return this._onUp();
};

VirtualJoystick.prototype._onTouchMove = function(event) {

	touch = event.targetTouches[0];
	if (touch.target == this._button1El) return;
	if (touch.target == this._button2El) return;
	x = touch.pageX;
	y = touch.pageY;
	return this._onMove(x, y);
};

//////////////////////////////////////////////////////////////////////////////////
//		build default stickEl and baseEl				//
//////////////////////////////////////////////////////////////////////////////////

/**
 * build the canvas for joystick base
 */
VirtualJoystick.prototype._buildJoystickBase = function() {
	var canvas = document.createElement('canvas');
	canvas.width = 126;
	canvas.height = 126;
	
	var ctx = canvas.getContext('2d');
	ctx.beginPath();
	ctx.strokeStyle = this._strokeStyle;
	ctx.lineWidth = 6;
	ctx.arc(canvas.width / 2, canvas.width / 2, 40, 0, Math.PI * 2, true);
	ctx.stroke();

	ctx.beginPath();
	ctx.strokeStyle = this._strokeStyle;
	ctx.lineWidth = 2;
	ctx.arc(canvas.width / 2, canvas.width / 2, 60, 0, Math.PI * 2, true);
	ctx.stroke();

	return canvas;
};

/**
 * build the canvas for joystick stick
 */
VirtualJoystick.prototype._buildJoystickStick = function() {
	var canvas = document.createElement('canvas');
	canvas.width = 86;
	canvas.height = 86;
	var ctx = canvas.getContext('2d');
	ctx.beginPath();
	ctx.strokeStyle = this._strokeStyle;
	ctx.lineWidth = 6;
	ctx.arc(canvas.width / 2, canvas.width / 2, 40, 0, Math.PI * 2, true);
	ctx.stroke();
	return canvas;
};

/**
 * build the canvas for Button1
 */
VirtualJoystick.prototype._buildButton1 = function() {
	var canvas = document.createElement('canvas');
	canvas.width = 106;
	canvas.height = 106;

	var ctx = canvas.getContext('2d');
	ctx.beginPath();
	ctx.strokeStyle = this._strokeStyleButton1;
	ctx.lineWidth = 6;
	ctx.arc(canvas.width / 2, canvas.width / 2, 35, 0, Math.PI * 2, true);
	ctx.stroke();

	ctx.beginPath();
	ctx.strokeStyle = 'red';
	ctx.lineWidth = 2;
	ctx.arc(canvas.width / 2, canvas.width / 2, 45, 0, Math.PI * 2, true);
	ctx.stroke();

	return canvas;
};

/**
 * build the canvas for Button2
 */
VirtualJoystick.prototype._buildButton2 = function() {
	var canvas = document.createElement('canvas');
	canvas.width = 106;
	canvas.height = 106;

	var ctx = canvas.getContext('2d');
	ctx.beginPath();
	ctx.strokeStyle = this._strokeStyleButton2;
	ctx.lineWidth = 6;
	ctx.arc(canvas.width / 2, canvas.width / 2, 35, 0, Math.PI * 2, true);
	ctx.stroke();

	ctx.beginPath();
	ctx.strokeStyle = 'purple';
	ctx.lineWidth = 2;
	ctx.arc(canvas.width / 2, canvas.width / 2, 45, 0, Math.PI * 2, true);
	ctx.stroke();

	return canvas;
};

//////////////////////////////////////////////////////////////////////////////////
//		move using translate3d method with fallback to translate > 'top' and 'left'		
//      modified from https://github.com/component/translate and dependents
//////////////////////////////////////////////////////////////////////////////////

VirtualJoystick.prototype._move = function(style, x, y)
{
	if (this._transform) {
		if (this._has3d) {
			style[this._transform] = 'translate3d(' + x + 'px,' + y + 'px, 0)';
		} else {
			style[this._transform] = 'translate(' + x + 'px,' + y + 'px)';
		}
	} else {
		style.left = x + 'px';
		style.top = y + 'px';
	}
};

VirtualJoystick.prototype._getTransformProperty = function() 
{
	var styles = [
		'webkitTransform',
		'MozTransform',
		'msTransform',
		'OTransform',
		'transform'
	];

	var el = document.createElement('p');
	var style;

	for (var i = 0; i < styles.length; i++) {
		style = styles[i];
		if (null != el.style[style]) {
			return style;
		}
	}
};

VirtualJoystick.prototype._check3D = function() 
{
	var prop = this._getTransformProperty();
	// IE8<= doesn't have `getComputedStyle`
	if (!prop || !window.getComputedStyle) return module.exports = false;

	var map = {
		webkitTransform: '-webkit-transform',
		OTransform: '-o-transform',
		msTransform: '-ms-transform',
		MozTransform: '-moz-transform',
		transform: 'transform'
	};

	// from: https://gist.github.com/lorenzopolidori/3794226
	var el = document.createElement('div');
	el.style[prop] = 'translate3d(1px,1px,1px)';
	document.body.insertBefore(el, null);
	var val = getComputedStyle(el).getPropertyValue(map[prop]);
	document.body.removeChild(el);
	var exports = null != val && val.length && 'none' != val;
	return exports;
};