'use strict';
var bcrypt = require('bcrypt');

/**
 * login action
 *
 * tries to find if we have an auth method to handle this type of login
 * request.
 *
 * GET /auth/login
 */

function generateScope(scopeKey, engine) {
	return {
		type: scopeKey,
		engine: engine,
		getDeviceAuthObject: function(attributes, req, cb){
			var attr = {password: attributes.password};
			attr[scopeKey] = attributes[scopeKey];

			var criteria = {};
			criteria[scopeKey] = attr[scopeKey];

			this.engine.findAuth(criteria, cb);
		}
	};
}

module.exports = function(req, res){
	var scope = generateScope(devicewaterlock.DeviceAuth, devicewaterlock.engine);
	var params = req.params.all();

	if(typeof params.password === 'undefined') {
		devicewaterlock.cycle.loginFailure(req, res, null, {error: 'Invalid password'});
	} else {
		var pass = params.password;
		devicewaterlock.engine.findAuth({deviceid: params.deviceid}, function(err, device){
			if (err) {
				res.serverError(err);
			}
			if (device) {
				if(bcrypt.compareSync(pass, device.deviceauth.password)){
					devicewaterlock.cycle.loginSuccess(req, res, device);
				}else{
					devicewaterlock.cycle.loginFailure(req, res, device, {error: 'Invalid password'});
				}
			} else {
				//TODO redirect to register
				devicewaterlock.cycle.loginFailure(req, res, null, {error: 'device not found'});
			}
		});
	}
};