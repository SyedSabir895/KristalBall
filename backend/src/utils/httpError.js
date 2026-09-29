// Error with an HTTP status code. Throw it anywhere; errorHandler sends it to the client.
// e.g. throw new HttpError(400, 'Insufficient stock')
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = HttpError;
