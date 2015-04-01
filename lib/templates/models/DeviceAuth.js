/**
 * Auth
 *
 * @module      :: Model
 * @description :: Holds all authentication methods for a Device
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = {

  attributes: require('waterlock').models.deviceauth.attributes({

    /* e.g.
    nickname: 'string'
    */

  }),

  beforeCreate: require('waterlock').models.deviceauth.beforeCreate,
  beforeUpdate: require('waterlock').models.deviceauth.beforeUpdate
};
