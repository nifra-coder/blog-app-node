const { createHmac, randomBytes } = require('crypto'); // Removed 'node:' prefix for wider compatibility
const { Schema, model } = require('mongoose');
const { createTokenForUser } = require('../services/authentication');

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL: {
      type: String,
      default: '/images/default.png',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash the password
UserSchema.pre('save', function (next) {
  const user = this;

  // Only hash the password if it is modified or new
  if (!user.isModified('password')) return next();

  // Generate a salt
  const salt = randomBytes(16).toString('hex');
  const hashedPassword = createHmac('sha256', salt)
    .update(user.password)
    .digest('hex');

  user.salt = salt;
  user.password = hashedPassword;

  next();
});

// Static method to match password and generate a token
UserSchema.statics.matchPasswordAndGenerateToken = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error('User not found');

  const userProvidedPassword = createHmac('sha256', user.salt)
    .update(password)
    .digest('hex');

  if (user.password !== userProvidedPassword) throw new Error('Password does not match');

  const userObj = user.toObject(); // Convert Mongoose document to plain object
  delete userObj.password;  // Remove sensitive data
  delete userObj.salt;

  // Generate token for authenticated user
  const token = createTokenForUser(user);
  return token;
};

const User = model('user', UserSchema);

module.exports = User;
