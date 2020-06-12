const assert = require('assert');
const hcaptcha = require('hcaptcha');
const sinon = require('sinon');
const {middleware} = require('../index');

describe('hCaptcha', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('validate', function () {
    const secret = 'secret';
    const token = 'token';
    const req = {'h-captcha-response': {token}};
    const validate = middleware.validate(secret);

    it('returns a middleware function when called with a secret', function () {
      assert.deepEqual(typeof validate, 'function');
      assert.deepEqual(validate.length, 3);
    });

    it('calls next with an error when no token in h-captcha-response', function () {
      sinon.stub(hcaptcha, 'verify').resolves();
      const next = sinon.spy();
      validate({}, sinon.fake(), next)
      assert(next.calledOnce);
      const err = next.args[0][0];
      assert.equal(err.status, 400);
      assert.ok(err.message.match(/no token/i));
    });

    it('sets hcaptcha prop on req object', function (done) {
      const data = {success: true};
      sinon.stub(hcaptcha, 'verify').resolves(data);
      validate(req, sinon.fake(), sinon.fake())
        .then(() => {
          assert.deepStrictEqual(req.hcaptcha, data);
          done();
        })
        .catch(done);
    });

    describe('on success', function () {
      it('calls next with no args', function (done) {
        const data = {success: true};
        const next = sinon.spy();
        sinon.stub(hcaptcha, 'verify').resolves(data);
        validate(req, sinon.fake(), next)
          .then(() => {
            assert(next.calledOnceWithExactly());
            done();
          })
          .catch(done);
      });
    });

    describe('on failure', function () {
      it('calls next with correct error', function (done) {
        const data = {success: false, 'error-codes': ['invalid-input-response']};
        const next = sinon.spy();
        sinon.stub(hcaptcha, 'verify').resolves(data);
        validate(req, sinon.fake(), next)
          .then(() => {
            const err = next.args[0][0];
            assert(next.calledOnce);
            assert.ok(err.message.match(/invalid/i))
            assert.equal(err.status, 400);
            done();
          })
          .catch(done);
      });
    });

    describe('on rejection', function () {
      it('calls next with error', function (done) {
        const error = new Error('errah');
        const next = sinon.spy();
        sinon.stub(hcaptcha, 'verify').rejects(error);
        validate(req, sinon.fake(), next)
          .then(() => {
            const err = next.args[0][0];
            assert(next.calledOnceWith(error));
            assert.equal(err.message, error.message);
            done();
          })
          .catch(done);
      });
    });
  });
});
