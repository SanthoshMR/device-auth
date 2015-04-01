'use strict';

var _ = require('lodash');

/**
 * Cycle
 *
 * @return {Object} various cycle functions
 */
module.exports = function(){
  var waterlock = this;

  return {
    /**
     * handles successful logins
     *
     * @param  {Object} req  express request object
     * @param  {Object} res  expresss response object
     * @param  {Object} device the device instance
     * @api public
     */
    loginSuccess: function(req, res, device){
      waterlock.logger.debug('device login success');
      if(!device){
        waterlock.logger.debug('loginSuccess requires a valid device object');
        return res.serverError();
      }

      var address = this._addressFromRequest(req);

      var attempt = {
        device:device.id,
        successful: true
      };

      _.merge(attempt, address);

      waterlock.DeviceAttempt.create(attempt).exec(function(err){
        if(err){
          waterlock.logger.debug(err);
        }
      });

      // store device in && authenticate the session
      req.session.device = device;
      req.session.authenticated = true;

      console.log(waterlock.config.postActions.login.success);
      // now respond or redirect
      var postResponse = this._resolvePostAction(waterlock.config.postActions.login.success,
        device);

      //Returns the token immediately
      var jwtData = waterlock._utils.createJwt(req, res, device);

      DeviceJwt.create({token: jwtData.token, uses: 0, owner: device.id}).exec(function(err){
        if(err){
          return res.serverError('JSON web token could not be created');
        }

        delete req.session.device.deviceauth.password;

        Device.findOne(device.id)
          .exec(function(err, device) {
          if(err) {
            return res.serverError('Couldn\'t find roles associated with the device');
          }
          req.session.device = device;
          res.json({
            token : jwtData.token,
            expires: jwtData.expires,
            device: req.session.device
          });
        });
      });
    },

    /**
     * handles login failures
     *
     * @param  {Object} req  express request object
     * @param  {Object} res  expresss response object
     * @param  {Object} device the device instance
     * @param  {Object|String} error the error that caused the failure
     * @api public
     */
    loginFailure: function(req, res, device, error){
      waterlock.logger.debug('device login failure');

      if(device){
        var address = this._addressFromRequest(req);

        var attempt = {
          device:device.id,
          successful: false
        };

        _.merge(attempt, address);

        waterlock.DeviceAttempt.create(attempt).exec(function(err){
          if(err){
            waterlock.logger.debug(err);
          }
        });
      }

      if(req.session.authenticated){
        req.session.authenticated = false;
      }

      delete(req.session.device);

      // now respond or redirect
      var postResponse = this._resolvePostAction(waterlock.config.postActions.login.failure,
        error);

      if(typeof postResponse === 'string' && this._isURI(postResponse)){
        res.redirect(postResponse);
      }else{
        res.forbidden(postResponse);
      }
    },

    /**
     * handles logout events
     *
     * @param  {Object} req  express request object
     * @param  {Object} res  expresss response object
     * @api public
     */
    logout: function(req, res){
      waterlock.logger.debug('device logout');
      delete(req.session.device);

      if(req.session.authenticated){
        this.logoutSuccess(req, res);
      }else{
        this.logoutFailure(req, res);
      }
    },

    /**
     * the logout 'success' event
     *
     * @param  {Object} req express request object
     * @param  {Object} res express response object
     * @api public
     */
    logoutSuccess: function(req, res){

      req.session.authenticated = false;

      var defaultString = 'You have successfully logged out.';

      // now respond or redirect
      var postResponse = this._resolvePostAction(waterlock.config.postActions.logout.success,
        defaultString);

      if(typeof postResponse === 'string' && this._isURI(postResponse)){
        res.redirect(postResponse);
      }else{
        res.ok(postResponse);
      }
    },

    /**
     * the logout 'failure' event
     *
     * @param  {Object} req express request object
     * @param  {Object} res express response object
     * @api public
     */
    logoutFailure: function(req, res){
      var defaultString = 'You have successfully logged out.';

      // now respond or redirect
      var postResponse = this._resolvePostAction(waterlock.config.postActions.logout.failure,
        defaultString);

      if(typeof postResponse === 'string' && this._isURI(postResponse)){
        res.redirect(postResponse);
      }else{
        res.ok(postResponse);
      }
    },

    /**
     * Tries to check if the given string is a URI
     *
     * @param  {String}  str the string to check
     * @return {Boolean}     true if string is a URI
     * @api private
     */
    _isURI: function(str){
      if(str.indexOf('/') === 0){ /* assume relative path */
        return true;
      }else if(str.indexOf('http') >= 0){ /* assume url */
        return true;
      }

      return false;
    },

    /**
     * returns an ip address and port from the express request object, or the
     * sails.io socket which is attached to the req object.
     *
     * @param  {Object} req express request
     * @return {Object}     the transport address object
     * @api private
     */
    _addressFromRequest: function(req){
      if(req.connection && req.connection.remoteAddress){
        return {
          ip:req.connection.remoteAddress,
          port: req.connection.remotePort
        };
      }

      if(req.socket && req.socket.remoteAddress){
        return {
          ip: req.socket.remoteAddress,
          port: req.socket.remotePort
        };
      }

      return{
        ip: '0.0.0.0',
        port: 'n/a'
      };
    },

    /**
     * translates the mix postAction to a string
     *
     * @param  {String|Object} mix the postAction object|string
     * @param  {String|Object} def the default value to use if mix cannot be
     *                         translated or is 'default'
     * @return {String|Object} the translated postAction or default value
     * @api private
     */
    _resolvePostAction: function(mix, def){

      //If postAction is not defined fall back to default
      if(mix === 'default' || typeof mix === 'undefined'){
        return def;
      }

      if(typeof mix === 'object'){
        return this._relativePathFromObj(mix);
      }

      return mix;
    },

    /**
     * returns the relative path from an object, the object is
     * expected to look like the following
     *
     * example:
     * {
     *   controller: 'foo',
     *   action: 'bar'
     * }
     *
     * @param  {Object} obj the redirect object
     * @return {String}     the relative path
     * @api private
     */
    _relativePathFromObj: function(obj){
      if(typeof obj.controller === 'undefined' || typeof obj.action === 'undefined'){
        var error = new Error('You must define a controller and action to redirect to.').stack;
        throw error;
      }

      return '/' + obj.controller + '/' + obj.action;
    }
  };
};