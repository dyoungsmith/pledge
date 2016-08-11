'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:

function $Promise() {
	this._state = 'pending';
	this._handlerGroups = [];
	this._value = null;
}

$Promise.prototype.then = function(success, err) {
	var handlers = {successCb: null, errorCb: null};
	handlers.downstream = defer();
	if(typeof success === 'function') handlers.successCb = success;
	if(typeof err === 'function') handlers.errorCb = err;
	this._handlerGroups.push(handlers);
	if (this._state === 'resolved' && success) {
		success(this._value);
	}
	if (this._state === 'rejected' && err) {
		err(this._value);
	}
	return handlers.downstream.$promise;
}

$Promise.prototype.catch = function(func) {
	return this.then(null, func)
}


$Promise.prototype.callHandlers = function(handlerType) {
	if (this._handlerGroups.length) {
		for (var i = 0; i < this._handlerGroups.length; i++) {
			if (this._handlerGroups[i][handlerType]) {
				try {
					var result = this._handlerGroups[i][handlerType](this._value);
					this._handlerGroups[i].downstream.resolve(result)
				}
				catch(err) {
					this._handlerGroups[i].downstream.reject(err)
				}
			}
			else { 
				if (handlerType === 'successCb') {
					this._handlerGroups[i].downstream.resolve(this._value)
				}
				else if (handlerType === 'errorCb') {
					this._handlerGroups[i].downstream.reject(this._value)
				}
			}
		}
		this._handlerGroups = [];
	}
}

function Deferral() {
	this.$promise = new $Promise();
}

Deferral.prototype.resolve = function(data) {
	if (this.$promise._state === 'pending') {
		this.$promise._state = 'resolved';
		this.$promise._value = data;
	}
	this.$promise.callHandlers('successCb');
}

Deferral.prototype.reject = function(err) {
	if (this.$promise._state === 'pending') {
		this.$promise._state = 'rejected';
		this.$promise._value = err;
	}
	this.$promise.callHandlers('errorCb');
}

function defer() {
	return new Deferral();
}



/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/
