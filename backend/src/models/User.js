import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto'; // Import the crypto module

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // New fields for password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

// Middleware to hash the password before saving a new user
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords (needed for the login logic)
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate and hash a password reset token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate a raw, unhashed token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash the token and set it to the resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiration time to 15 minutes
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', UserSchema);

export default User;
