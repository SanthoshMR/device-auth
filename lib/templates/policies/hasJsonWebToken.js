'use strict';
/* jshint unused:false */

/**
 * hasJsonWebToken
 *
 * @module      :: Policy
 * @description :: Assumes that your request has an jwt;
 *
 * @docs        :: http://waterlock.ninja/documentation
 */
module.exports = function(req, res, next) {
  devicewaterlock.validator.validateTokenRequest(req, function(err, device){
    if(err){
      return res.forbidden(err);
    }

    // valid request
    next();
  });
};
