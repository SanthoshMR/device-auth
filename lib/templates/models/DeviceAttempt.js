/**
 * DeviceAttempt
 *
 * @module      :: Model
 * @description :: Tracks login attempts of devices on your app.
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = {

  attributes: require('waterlock').models.deviceattempt.attributes({

    /* e.g.
    nickname: 'string'
    */

  })
};