'use strict';

/**
 * This validator is responsible for
 * validating and tacking JWT usage
 *
 * @return {Object} validator functions
 */
module.exports = function(){
  var waterlock = this;

  return {

    /**
     * Validates a token
     *
     * @param  {String}   token the token to be validated
     * @param  {Function} cb    called when error has occured or token is validated
     */
    validateToken: function(token, cb){
      try{
        // decode the token
        var _token = waterlock.jwt.decode(token, waterlock.config.deviceJsonWebTokens.secret);

        // set the time of the request
        var _reqTime = Date.now();

        // If token is expired
        if(_token.exp <= _reqTime){
          waterlock.logger.debug('access token rejected, reason: EXPIRED');
          return cb('Your token is expired.');
        }

        // If token is early
        if(_reqTime <= _token.nbf){
          waterlock.logger.debug('access token rejected, reason: TOKEN EARLY');
          return cb('This token is early.');
        }

        // If audience doesn't match
        if(waterlock.config.deviceJsonWebTokens.audience !== _token.aud){
          waterlock.logger.debug('access token rejected, reason: AUDIENCE');
          return cb('This token cannot be accepted for this domain.');
        }

        this.findDeviceFromToken(_token, cb);

      } catch(err){
        cb(err);
      }
    },

    /**
     * Find the device the give token is issued to
     *
     * @param  {Object}   token The parsed token
     * @param  {Function} cb    Callback to be called when a device is
     *                          found or an error has occured
     */
    findDeviceFromToken: function(token, cb){
      // deserialize the token iss
      var _iss = token.iss.split('|');

      waterlock.Device.findOne(_iss[0]).exec(function(err, device){
        if(err){
          waterlock.logger.debug(err);
        }

        cb(err, device);
      });
    },

    /**
     * Validates a token from an Express request object
     *
     * @param  {Express request}   req the Express request object
     * @param  {Function} cb  Callback when to be called when token
     *                        has been validated or an error has occured
     */
    validateTokenRequest: function(req, cb){
      var self = this;
      var token = waterlock._utils.allParams(req).access_token;

      if(token){

        // validate the token
        this.validateToken(token, function(err, device){
          if(err){
            waterlock.logger.debug(err);
            return cb(err);
          }

          // check if we're running in stateless
          if(!waterlock.config.deviceJsonWebTokens.stateless){
            self.bindToSession(req, device);
          }

          // check if we're tracking usage
          if(waterlock.config.deviceJsonWebTokens.trackUsage){
            var address = waterlock.cycle._addressFromRequest(req);
            return self.trackTokenUsage(address, token, device, cb);
          }

          waterlock.logger.debug('access token accepted');
          cb(null, device);
        });
      }else{
        waterlock.logger.debug('no access token present');
        cb('Access token not present.');
      }
    },

    /**
     * Attaches a device object to the Express req session
     *
     * @param  {Express request} req  the Express request object
     * @param  {Waterline DAO} device the waterline device object
     */
    bindToSession: function(req, device){
      req.session.authenticated = true;
      req.session.device = device;
    },

    /**
     * Finds the DAO instance of the give token and tracks the usage
     *
     * @param  {String}   token   the raw token
     * @param  {Object}   address the transport address
     * @param  {Function} cb      Callback to be invoked when an error has
     *                            occured or the token was tracked successfully
     */
    findAndTrackJWT: function(token, address, cb){
      waterlock.DeviceJwt.findOne({token: token}, function(err, j){
        if(err){
          return cb(err);
        }

        if(!j){
          waterlock.logger.debug('access token not found');
          return cb('Token not found');
        }

        if(j.revoked){
          waterlock.logger.debug('access token rejected, reason: REVOKED');
          return cb('This token has been revoked');
        }

        var use = {jsonWebToken: j.id, remoteAddress: address.ip};
        waterlock.DeviceUse.create(use).exec(function(){});

        cb(null);
      });
    },

    /**
     * Tracks the tokens usage and invokes the device defined callback
     *
     * @param  {Object}   address the transport address
     * @param  {String}   token   the raw token
     * @param  {Waterline DAO}   device    the waterline device object
     * @param  {Function} cb      Callback to be invoked when an error has occured
     *                            or the token has been tracked successfully
     */
    trackTokenUsage: function(address, token, device, cb){
      this.findAndTrackJWT(token, address, function(err){
        if(err){
          waterlock.logger.debug(err);
          return cb(err);
        }
        cb(null, device);
      });
    }
  };
};
