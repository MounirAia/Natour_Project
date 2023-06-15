const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A name is required.'],
    trim: true,
    // validate: [
    //   {
    //     validator: validator.isAlpha,
    //     message: (params) =>
    //       `The name: ${params.value} must only contain letters.`,
    //   },
    // ],
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
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
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
  passwordUpdatedAt: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordTokenExpiration: { type: Date },
});

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    if (!this.isNew) {
      // it means you updated the password
      this.passwordUpdatedAt = new Date();
    }
  }
});

userSchema.pre(/^find/, async function () {
  this.select('-__v');
});

userSchema.methods.verifyPassword = function (params) {
  const { userPassword, givenPassword } = params;

  return bcrypt.compare(givenPassword, userPassword);
};

userSchema.methods.didPasswordChangedAfterJWTTokenWasIssued = function (
  params
) {
  let isPasswordIssuedAfterToken = false;
  if (this.passwordUpdatedAt) {
    const { tokenWasIssuedAt } = params;
    const updatedAtMS = this.passwordUpdatedAt.getTime();
    isPasswordIssuedAfterToken = tokenWasIssuedAt * 1000 - updatedAtMS < 0;
  }

  return isPasswordIssuedAfterToken;
};

userSchema.methods.updateUser = function (requestBody) {
  // Update the field that can be updated
  const keysYouCanUpdate = ['name', 'photo', 'email'];
  Object.keys(requestBody).forEach((key) => {
    if (keysYouCanUpdate.includes(key)) {
      const newValue = requestBody[key];
      if (newValue) {
        this[key] = newValue; // update the field with the new value
      }
    }
  });

  // ignore validation on password, this method is only used to update non password field
  this.$ignore('password');
  this.$ignore('passwordConfirm');

  return this.save();
};

userSchema.methods.updatePassword = function (params) {
  const { password, passwordConfirm } = params;
  this.password = password;
  this.passwordConfirm = passwordConfirm;
  this.resetPasswordToken = undefined;
  this.resetPasswordTokenExpiration = undefined;

  return this.save();
};

userSchema.methods.createResetToken = async function () {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(token, 12);

  return { token, hashedToken };
};

userSchema.methods.verifyResetToken = function (plainToken) {
  if (!this.resetPasswordTokenExpiration) return false;
  if (Date.now() > this.resetPasswordTokenExpiration.getTime()) return false;

  return bcrypt.compare(plainToken, this.resetPasswordToken);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
