const AppError = require('../utilis/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 404);
};

const handleDuplicatedFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicated field value ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please login again!', 401);

const handleJWTExpireError = () =>
  new AppError('Your token has expired! Please log in again', 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // RENDER WEBSITE
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      // Programming or other unknow error: don't leak error to details
    }
    // log err
    console.error('ERROR 💣💣💣', err);
    // send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  // Render website
  if (err.isOperational) {
    console.log(err.message);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
    // Programming or other unknow error: don't leak error to details
  }
  // log err
  console.error('ERROR 💣💣💣', err);
  // send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);
    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (err.code === 11000) {
      error = handleDuplicatedFieldsDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpireError();
    }
    sendErrorProd(error, req, res);
  }
};
