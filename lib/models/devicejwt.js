'use strict';

/**
 * Returns an object attributes for the ApiKey model
 * @param  {Object} attributes device defined attributes for the ApiKey model
 * @return {Object} the device defined attributes combined with the template
 */
exports.attributes = function(attributes){
  var _ = require('lodash');

  var template = {
    token: {
      type: 'text',
      maxLength: 512
    },
    uses: {
      collection: 'deviceuse',
      via: 'jsonWebToken'
    },
    owner: {
      model: 'device'
    },
    revoked: {
      type: 'boolean',
      defaultsTo: false
    }
  };

  return _.merge(template, attributes);
};
