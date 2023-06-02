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
  passwordUpdatedAt: { type: Date },
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
  // 1) Update the field that can be updated
  const keysYouCanUpdate = ['name', 'photo', 'password', 'passwordConfirm'];
  Object.keys(requestBody).forEach((key) => {
    if (keysYouCanUpdate.includes(key)) {
      const newValue = requestBody[key];
      if (newValue) {
        this[key] = newValue; // update the field with the new value
        if (key === 'password') {
          this.passwordUpdatedAt = new Date();
        }
      }
    }
  });

  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
