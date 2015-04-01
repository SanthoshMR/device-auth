'use strict';

/**
 * Models
 *
 * @return {object} all models
 */
module.exports = function(){

  var _  = require('lodash');

  var template = {
    /**
     * device model
     */
    device: require('./device'),

    /**
     * json web token model
     */
    devicejwt: require('./devicejwt'),

    /**
     * use model
     */
    deviceuse: require('./deviceuse'),

    /**
     * attempt model
     */
    deviceattempt: require('./deviceattempt'),

    /**
     * auth model
     */
    deviceauth: require('./deviceauth')
  };

  /**
   * loop through methods object and bind any extra models
   * they may have defined
   */
  for(var key in this.methods){
    if(this.methods.hasOwnProperty(key)){
      var extras; //this.methods[key].model.extras;
      if(extras){
        _.merge(template, extras);
      }
    }
  }

  return template;
};