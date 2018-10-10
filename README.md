# express-hcaptcha

Validate your hCaptcha token using a middleware.

## Usage

```
npm install --save express-hcaptcha
```

```js
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const hcaptcha = require('express-hcaptcha');

// your hcaptcha secret key
const SECRET = process.env.HCAPTCHA_SECRET_KEY;
const PORT = process.env.PORT || 8080;

const app = express();

// middleware
app.use(cors());
app.use(bodyParser.json()); // required by express-hcaptcha

// validate the token and proceed to the route when token is valid
// the middleware also sets the req.hcaptcha to what ever the verify call returns
app.post('/verify', hcaptcha.middleware.validate(SECRET), (req, res) => {
  res.json({message: 'verified!', hcaptcha: req.hcaptcha});
});

app.listen(PORT, () => {
  console.log(`listening on http://0.0.0.0:${PORT}`);
});
```

## Todo

- [x] tests
- [ ] setup CI
