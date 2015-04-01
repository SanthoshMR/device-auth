'use strict';

/**
 * Attempts describes an device's login, if it was successful, what ip it came from etc.
 * @param  {object} attributes any attributes to append to the attempt model
 * @return {object} the template merged with the device defined attributes
 */

var bcrypt = require('bcrypt');
var _ = require('lodash');

exports.attributes = function(attributes){

	var template = {
		device: {
			model: 'Device'
		},
		serial: {
			type: 'string',
			unique: true
		},
		password: {
			type: 'string',
			minLength: 8
		}
	}

	return _.merge(template, attributes);
};

/**
 * used to hash the password
 * @param  {object}   values
 * @param  {Function} cb
 */
exports.beforeCreate = function(values, cb){
	if(typeof values.password !== 'undefined'){
		var bcrypt = require('bcrypt');
		var salt = bcrypt.genSaltSync(10);
		var hash = bcrypt.hashSync(values.password, salt);
		values.password = hash;
	}

	cb();
};

/**
 * used to update the password hash if device is trying to update password
 * @param  {object}   values
 * @param  {Function} cb
 */
exports.beforeUpdate = function(values, cb){
	if(typeof values.password !== 'undefined'){
		var bcrypt = require('bcrypt');
		var salt = bcrypt.genSaltSync(10);
		var hash = bcrypt.hashSync(values.password, salt);
		values.password = hash;
	}

	cb();
};