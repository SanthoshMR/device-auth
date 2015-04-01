'use strict';

/**
 * logout action
 *
 * creates a new token
 *
 * GET /user/jwt
 */
module.exports = function(req, res){
	devicewaterlock.cycle.logout(req, res);
};