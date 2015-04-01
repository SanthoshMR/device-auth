'use strict';

/**
 * Attempts describes an device's login, if it was successful, what ip it came from etc.
 * @param  {object} attributes any attributes to append to the attempt model
 * @return {object} the template merged with the device defined attributes
 */
exports.attributes = function(attributes){
  var _ = require('lodash');

  var template = {
    device:{
      model: 'device'
    },
    successful:{
      type: 'boolean',
      defaultsTo: false
    },
    ip:{
      type: 'string'
    },
    port:{
      type: 'string'
    }
  };

  return _.merge(template, attributes);
};