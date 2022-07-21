const ClientError = require('../ClienttError');

describe('ClientError', () => {
  it('should throw error when directly use it', () => {
    expect(() => new ClientError('')).toThrowError('cannot instance abstract class');
  });
});
