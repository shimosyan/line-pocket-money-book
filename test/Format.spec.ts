import * as Format from '../src/lib/Format';

describe('formatMoney', () => {
  it('success', () => {
    expect(Format.formatMoney(1000)).toEqual('1,000');
  });
});
