exports.notFound = (req, res) => res.status(404).json({ message: 'Route not found.' });

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong.';

  if (err.code === 'ER_DUP_ENTRY') { status = 409; message = 'That value already exists.'; }
  else if (err.code === 'ER_NO_REFERENCED_ROW_2') { status = 400; message = 'Selected category does not exist.'; }
  else if (err.code === 'ER_ROW_IS_REFERENCED_2') { status = 409; message = 'This record is in use and cannot be deleted.'; }
  else if (err.name === 'MulterError') { status = 400; message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 3 MB or smaller.' : err.message; }
  else if (status === 500) { console.error(err); message = 'Something went wrong.'; }

  res.status(status).json({ message });
};
