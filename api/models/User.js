/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  autosubscribe: ['destroy', 'update'],

  attributes: {
    email: {
      type: 'email',
      unique: true,
      required: true
    },
    password: {
      type: 'string',
      required: true,
      minLength: 6
    },
    status: {
      type: 'string',
      defaultsTo: 'offline',
      required: false
    }
  },

  signup: function (inputs, cb) {
    var hasher = require("password-hash");

    // Create a user
    User.create({
      email: inputs.email,
      password: hasher.generate(inputs.password)
    })
      .exec(cb);
  },

  /**
   * Check validness of a login using the provided inputs.
   * But encrypt the password first.
   *
   * @param  {Object}   inputs
   *                     • email    {String}
   *                     • password {String}
   * @param  {Function} cb
   */

  attemptLogin: function (inputs, cb) {
    // Create a user
    User.findOne({
      email: inputs.email,
    })
      .exec(cb);
  }
};

