import { ExpiryCountdownPipe } from './expiry-countdown.pipe';

describe('ExpiryCountdownPipe', () => {
  it('create an instance', () => {
    const pipe = new ExpiryCountdownPipe();
    expect(pipe).toBeTruthy();
  });
});
