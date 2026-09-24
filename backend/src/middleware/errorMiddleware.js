export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    err.message = 'File size exceeds the maximum limit of 5MB.';
  } else if (err.code === 'INVALID_FILE_TYPE') {
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
