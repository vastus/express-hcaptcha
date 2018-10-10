const hcaptcha = require('hcaptcha');

// validate takes an hCaptcha secret and returns
// an express middleware function
const validate = (secret) => (req, res, next) => {
  // get token from the body
  // requires the body parser JSON middleware
  // on the app that uses this middleware
  const token = req.body && req.body.token;

  // call next with an error if no token present
  if (!token) {
    const err = new Error('bad request - no token provided in body');
    err.status = 400;
    return next(err);
  }

  // verify the hcaptcha and continue on success
  // call next with an error if verification errors or fails
  hcaptcha.verify(secret, token)
    .then((data) => {
      console.log('data', data);
      req.hcaptcha = data;
      if (data.success) {
        return next();
      }
      const err = new Error(`bad request - ${data['error-codes']}`);
      err.status = 400;
      return next(err);
    })
    .catch(next);
};

module.exports.middleware = {
  validate,
};
