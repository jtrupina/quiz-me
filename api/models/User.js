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
    name: {
      type: 'string',
      required: true,
      unique: true
    },
    password: {
      type: 'string',
      required: true,
      minLength: 6
    }
  },

  signup: function (inputs, cb) {
    var hasher = require("password-hash");

    // Create a user
    User.create({
      email: inputs.email,
      name: inputs.name,
      password: hasher.generate(inputs.password)
    })
      .exec(cb);
  },

  /**
   * Find a user by specified email
   * @param inputs
   * @param cb
   */
  attemptLogin: function (inputs, cb) {
    User.findOne({
      email: inputs.email,
    })
      .exec(cb);
  }
};

