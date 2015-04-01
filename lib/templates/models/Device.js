/**
 * Device
 *
 * @module      :: Model
 * @description :: This is the base device model
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = {

  attributes: require('waterlock').models.device.attributes({

    /* e.g.
    nickname: 'string'
    */

  }),

  beforeCreate: require('waterlock').models.device.beforeCreate,
  beforeUpdate: require('waterlock').models.device.beforeUpdate
};
