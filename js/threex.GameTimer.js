/** @namespace */
var THREEx = THREEx || {};

THREEx.GameTimer = function(secondsUntilAlarm) {


	this.alarmTime = secondsUntilAlarm || 10;

	this.counter = 0;

	this.isRunning = false;

	this.alarmSounding = false;

};

THREEx.GameTimer.prototype.run = function(threejsClockDelta) {

	if (this.alarmSounding === false) {
		this.counter += threejsClockDelta;
		this.isRunning = true;
	}

	if (this.counter >= this.alarmTime) {
		this.alarmSounding = true;
		this.stop();
	}
};

THREEx.GameTimer.prototype.stop = function() {

	this.isRunning = false;
};

THREEx.GameTimer.prototype.reset = function() {

	this.counter = 0;
	this.alarmSounding = false;
};

THREEx.GameTimer.prototype.setAlarm = function(seconds) {

	this.alarmTime = seconds;
};