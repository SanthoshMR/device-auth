'use strict';

/**
 * This engine is responsible for
 * finding, creating and updating deviceauth objects
 *
 * @return {Object} engine functions
 */
module.exports = function(){
	var waterlock = this;

	return {

    /**
     * Simple wrapper for Auth find/populate method
     *
     * @param  {Object}   criteria should be id to find the deviceauth by
     * @param  {Function} cb         function to be called when the deviceauth has been
     *                               found or an error has occurred
     * @api public
     */
    findAuth: function(criteria, cb){
      var self = this;
      waterlock.DeviceAuth.findOne(criteria).populate('device')
      .exec(function(err, deviceauth){
        cb(err, self._invertAuth(deviceauth));
      });
    },

    /**
     * This will create a device and deviceauth object if one is not found
     *
     * @param  {Object}   criteria   should be id to find the deviceauth by
     * @param  {Object}   attributes deviceauth attributes
     * @param  {Function} cb         function to be called when the deviceauth has been
     *                               found or an error has occurred
     * @api private
     */
    _attachAuthToDevice: function(deviceauth, cb){
      var self = this;

      // create the device
      if(!deviceauth.device){
        waterlock.Device.create({deviceauth:deviceauth.id}).exec(function(err, device){
          if(err){
            waterlock.logger.debug(err);
            return cb(err);
          }

          // update the deviceauth object
          waterlock.DeviceAuth.update(deviceauth.id, {device:device.id}).exec(function(err, deviceauth){
            if(err){
              waterlock.logger.debug(err);
              return cb(err);
            }

            device.deviceauth = deviceauth.shift();
            cb(err, device);
          });
        });
      }else{
        // just fire off update to device object so we can get the
        // backwards association going.
        if(!deviceauth.device.deviceauth){
          waterlock.Device.update(deviceauth.device.id, {deviceauth:deviceauth.id}).exec(function(){});
        }

        cb(null, self._invertAuth(deviceauth));
      }
    },

    /**
     * Find or create the deviceauth then pass the results to _attachAuthToDevice
     *
     * @param  {Object}   criteria   should be id to find the deviceauth by
     * @param  {Object}   attributes deviceauth attributes
     * @param  {Function} cb         function to be called when the deviceauth has been
     *                               found or an error has occurred
     *
     * @api public
     */
    findOrCreateAuth: function(criteria, attributes, cb){
      var self = this;
      waterlock.DeviceAuth.findOrCreate(criteria, attributes)
      .exec(function(err, newAuth){
        if(err){
          waterlock.logger.debug(err);
          return cb(err);
        }

        waterlock.DeviceAuth.findOne(newAuth.id).populate('device')
        .exec(function(err, deviceauth){
          if(err){
            waterlock.logger.debug(err);
            return cb(err);
          }

          self._attachAuthToDevice(deviceauth, cb);
        });
      });
    },

    /**
     * Attach given deviceauth attributes to device
     *
     * @param  {Object}   attributes deviceauth attributes
     * @param  {Object}   device       device instance
     * @param  {Function} cb         function to be called when the deviceauth has been
     *                               attached or an error has occurred
     * @api public
     */
    attachAuthToDevice: function(attributes, device, cb){
      var self = this;
      attributes.device = device.id;

      waterlock.Device.findOne(device.id).exec(function(err, device){
        if(err){
          waterlock.logger.debug(err);
          return cb(err);
        }

        if(device.deviceauth){
          delete(attributes.deviceauth);
          //update existing deviceauth
          waterlock.DeviceAuth.findOne(device.deviceauth).exec(function(err, deviceauth){
            if(err){
              waterlock.logger.debug(err);
              return cb(err);
            }

            // Check if any attribtues have changed if so update them
            if(self._updateAuth(deviceauth, attributes)){
               deviceauth.save(function(err){
                if(err){
                  waterlock.logger.debug(err);
                  return cb(err);
                }
                device.deviceauth = deviceauth;
                cb(err, device);
              });
            }else{
              device.deviceauth = deviceauth;
              cb(err, device);
            }

          });
        }else{
          // force create by pass of device id
          self.findOrCreateAuth(device.id, attributes, cb);
        }
      });
    },

    /**
     * Inverts the deviceauth object so we don't need to run another query
     *
     * @param  {Object} deviceauth Auth object
     * @return {Object}      Device object
     * @api private
     */
    _invertAuth: function(deviceauth){
      // nothing to invert
      if(!deviceauth || !deviceauth.device){
        return deviceauth;
      }

      var u = deviceauth.device;
      delete(deviceauth.device);
      u.deviceauth = deviceauth;
      return u;
    },

    /**
     * Decorates the deviceauth object with values of the attributes object
     * where the attributes differ from the deviceauth
     *
     * @param  {Object} deviceauth       waterline Auth instance
     * @param  {Object} attributes used to update deviceauth with
     * @return {Boolean}           true if any values were updated
     */
    _updateAuth: function(deviceauth, attributes){
      var changed = false;
      for(var key in attributes){
        if(attributes.hasOwnProperty(key)){
          if(deviceauth[key] !== attributes[key]){
            deviceauth[key] = attributes[key];
            changed = true;
          }
        }
      }
      return changed;
    }
	};
};
