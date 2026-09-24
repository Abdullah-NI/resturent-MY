import jwt from 'jsonwebtoken';

const generateToken = (res, userId, role) => {
  const token = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'skylounge_super_secret_jwt_key_2026_safe_and_secure_9760999444',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.RENDER) ||
    Boolean(process.env.RENDER_SERVICE_ID) ||
    (process.env.CLIENT_URL && process.env.CLIENT_URL.startsWith('https'));

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  return token;
};

export default generateToken;
