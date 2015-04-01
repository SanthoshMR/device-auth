/**
 * DeviceJwt
 *
 * @module      :: Model
 * @description :: Holds all distributed json web tokens
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = {

  attributes: require('waterlock').models.devicejwt.attributes({

    /* e.g.
    nickname: 'string'
    */

  })
};
