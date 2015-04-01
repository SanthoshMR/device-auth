'use strict';

/**
 * device model attributes
 * @param  {obejct} attributes device defined attributes
 * @return {object} attributes merged with template and method model object
 */
exports.attributes = function(attributes){
  var _ = require('lodash');


  var template = {
    attempts: {
      collection: 'deviceattempt',
      via: 'device'
    },
    jsonWebTokens: {
      collection: 'devicejwt',
      via: 'owner'
    },
    deviceauth:{
      model: 'deviceauth'
    }
  };

  return _.merge(template, attributes);
};

