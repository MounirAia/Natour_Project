const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A name is required.'],
    validate: [
      {
        validator: validator.isAlpha,
        message: (params) =>
          `The name: ${params.value} must only contain letters.`,
      },
    ],
  },
  email: {
    type: String,
    required: [true, 'An email is required.'],
    unique: true,
    validate: [
      {
        validator: validator.isEmail,
        message: (params) => `The email: ${params.value} is not a valid email.`,
      },
    ],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'A password is required.'],
    minlength: [8, 'A password should have at least 8 characters.'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A password confirmation is required.'],
    validate: [
      {
        validator: function (value) {
          return this.get('password') === value;
        },
        message:
          'The confirm password: {VALUE} should match the value of the password.',
      },
    ],
  },
});

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  }
});

userSchema.methods.verifyPassword = function (params) {
  const { userPassword, givenPassword } = params;

  return bcrypt.compare(givenPassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
