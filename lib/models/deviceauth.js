'use strict';

/**
 * Attempts describes an device's login, if it was successful, what ip it came from etc.
 * @param  {object} attributes any attributes to append to the attempt model
 * @return {object} the template merged with the device defined attributes
 */
exports.attributes = function(attributes){
	var _ = require('lodash');
	var methods = waterlock.methods;

	for(var key in methods){
		var method = methods[key];
		if(method.hasOwnProperty('model')){
			// call the decorator of each auth method
			method.model.deviceauth.attributes(attributes);
		}
	}

	var template = {
		device:{
			model: 'device'
		}
	};

	return _.merge(template, attributes);
};

/**
 * used to hash the password
 * @param  {object}   values
 * @param  {Function} cb
 */
exports.beforeCreate = function(values, cb){
	var methods = waterlock.methods;
	for(var key in methods){
		var model = methods[key].model.deviceauth;
		if(model.hasOwnProperty('beforeCreate')){
			model.beforeCreate(values);
		}
	}

	cb();
};

/**
 * used to update the password hash if device is trying to update password
 * @param  {object}   values
 * @param  {Function} cb
 */
exports.beforeUpdate = function(values, cb){
	var methods = waterlock.methods;
	for(var key in methods){
		var model = methods[key].model.deviceauth;
		if(model.hasOwnProperty('beforeUpdate')){
			model.beforeUpdate(values);
		}
	}

	cb();
};