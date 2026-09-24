import crypto from 'crypto';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import PasswordReset from '../models/PasswordReset.js';
import generateToken from '../utils/generateToken.js';
import { sendOtpEmail } from '../utils/sendEmail.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    password,
    role: 'customer',
  });

  if (user) {
    generateToken(res, user._id, user.role);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & set token cookie
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      res.status(403);
      throw new Error('Your account has been deactivated. Please contact support.');
    }

    generateToken(res, user._id, user.role);

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = asyncHandler(async (req, res) => {
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.RENDER) ||
    Boolean(process.env.RENDER_SERVICE_ID) ||
    (process.env.CLIENT_URL && process.env.CLIENT_URL.startsWith('https'));

  res.cookie('token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0),
    path: '/',
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.addresses) {
      user.addresses = req.body.addresses;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        addresses: updatedUser.addresses,
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Request password reset OTP via Brevo
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase().trim();

  // Invalidate any existing reset records for this email
  await PasswordReset.deleteMany({ email });

  const user = await User.findOne({ email });

  // Account Enumeration Prevention: Return identical response whether user exists or not
  if (!user) {
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset OTP has been sent.',
    });
  }

  // Generate cryptographically secure 6-digit OTP
  const rawOtp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');

  // OTP valid for 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Store hashed OTP in DB
  await PasswordReset.create({
    email,
    otpHash,
    expiresAt,
    attempts: 0,
  });

  // Send OTP to user email via Brevo API
  await sendOtpEmail({ toEmail: email, otp: rawOtp });

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset OTP has been sent.',
  });
});

// @desc    Verify OTP for password reset
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase().trim();
  const { otp } = req.body;

  const resetRecord = await PasswordReset.findOne({ email });

  if (!resetRecord || !resetRecord.otpHash) {
    res.status(400);
    throw new Error('Invalid or expired OTP request. Please request a new OTP.');
  }

  // Check if OTP expired
  if (resetRecord.expiresAt < new Date()) {
    await PasswordReset.deleteOne({ _id: resetRecord._id });
    res.status(400);
    throw new Error('OTP has expired. Please request a new OTP.');
  }

  // Check if max attempts reached (5 attempts limit)
  if (resetRecord.attempts >= 5) {
    await PasswordReset.deleteOne({ _id: resetRecord._id });
    res.status(400);
    throw new Error('Maximum verification attempts exceeded. Please request a new OTP.');
  }

  // Hash submitted OTP and compare
  const submittedOtpHash = crypto.createHash('sha256').update(otp).digest('hex');

  if (submittedOtpHash !== resetRecord.otpHash) {
    resetRecord.attempts += 1;
    await resetRecord.save();

    const remainingAttempts = 5 - resetRecord.attempts;
    res.status(400);
    if (remainingAttempts <= 0) {
      await PasswordReset.deleteOne({ _id: resetRecord._id });
      throw new Error('Maximum verification attempts exceeded. Please request a new OTP.');
    } else {
      throw new Error(`Invalid OTP. You have ${remainingAttempts} attempt(s) remaining.`);
    }
  }

  // OTP verified! Generate short-lived reset token (valid for 15 mins)
  const rawResetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');
  const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Invalidate plain OTP and attach reset token hash
  resetRecord.otpHash = '';
  resetRecord.resetTokenHash = resetTokenHash;
  resetRecord.resetTokenExpiresAt = resetTokenExpiresAt;
  await resetRecord.save();

  res.json({
    success: true,
    message: 'OTP verified successfully. You may now create your new password.',
    resetToken: rawResetToken,
  });
});

// @desc    Reset password using reset token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase().trim();
  const { resetToken, newPassword } = req.body;

  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  const resetRecord = await PasswordReset.findOne({
    email,
    resetTokenHash,
  });

  if (!resetRecord || !resetRecord.resetTokenExpiresAt || resetRecord.resetTokenExpiresAt < new Date()) {
    res.status(400);
    throw new Error('Invalid or expired password reset session. Please request a new OTP.');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  // Update password (pre-save hook hashes with bcrypt)
  user.password = newPassword;
  await user.save();

  // Invalidate reset record
  await PasswordReset.deleteMany({ email });

  // Invalidate any active session cookie
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.RENDER) ||
    Boolean(process.env.RENDER_SERVICE_ID) ||
    (process.env.CLIENT_URL && process.env.CLIENT_URL.startsWith('https'));

  res.cookie('token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0),
    path: '/',
  });

  res.json({
    success: true,
    message: 'Password reset successfully. Please login with your new password.',
  });
});
