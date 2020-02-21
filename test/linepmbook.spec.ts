//cSpell:ignore linepmbook
import { LinePMBookData, LinePMBook } from '../src/linepmbook';

Logger['log'] = jest.fn().mockImplementation(object => console.log(object));
declare let Moment;
// eslint-disable-next-line @typescript-eslint/no-var-requires
Moment['moment'] = jest.fn(args => require('moment')(args));

const contents = {
  destination: 'a12345678b123456789',
  events: [
    {
      replyToken: 'a12b23c45',
      source: {
        groupId: 'hoge',
        type: 'group',
        userId: 'u123456789'
      },
      type: 'message',
      message: {
        id: 123456789,
        text: '昼食代\n1000',
        type: 'text'
      },
      timestamp: 154700000000
    }
  ]
};

describe('LinePMBookData', () => {
  describe('constructor()', () => {
    it('Success', () => {
      const LineObj = new LinePMBookData(contents);
      expect(LineObj.message).toBe('昼食代\n1000');
      expect(LineObj.type).toBe('message');
      expect(LineObj.replyToken).not.toBeUndefined();
    });
  });

  describe('filterMessage()', () => {
    it('Success - case1', () => {
      const LineObj = new LinePMBookData(contents);
      expect(LineObj.filterMessage()).toBe(true);
    });

    it('Success - case2', () => {
      contents.events[0].message.text = '800\nスタバ';
      const LineObj = new LinePMBookData(contents);
      expect(LineObj.filterMessage()).toBe(true);
    });

    it('Success - case3', () => {
      contents.events[0].message.text = 'いくら';
      const LineObj = new LinePMBookData(contents);
      expect(LineObj.filterMessage()).toBe(true);
    });

    it('Success - case4', () => {
      contents.events[0].message.text = '取り消し';
      const LineObj = new LinePMBookData(contents);
      expect(LineObj.filterMessage()).toBe(true);
    });

    it('Success - case5', () => {
      contents.events[0].message.text = '先月';
      const LineObj = new LinePMBookData(contents);
      expect(LineObj.filterMessage()).toBe(true);
    });

    it('Success - case6', () => {
      contents.events[0].message.text = '800';
      const LineObj = new LinePMBookData(contents);
      expect(LineObj.filterMessage()).toBe(false);
    });

    it('Success - case7', () => {
      contents.events[0].message.text = 'メッセージ';
      const LineObj = new LinePMBookData(contents);
      expect(LineObj.filterMessage()).toBe(false);
    });

    it('Success - case9', () => {
      contents.events[0].message.text = '8000\n12/25プレゼント';
      const LineObj = new LinePMBookData(contents);
      expect(LineObj.filterMessage()).toBe(true);
    });

    it('Success - case10', () => {
      contents.events[0].message.text = '12/25プレゼント\n8000';
      const LineObj = new LinePMBookData(contents);
      expect(LineObj.filterMessage()).toBe(true);
    });

    it('Success - case11', () => {
      contents.events[0].message.text = '水\n3ドル';
      const LineObj = new LinePMBookData(contents);
      expect(LineObj.filterMessage()).toBe(true);
    });

    it('Success - case12', () => {
      contents.events[0].message.text = '2.5ドル\n31アイス';
      const LineObj = new LinePMBookData(contents);
      expect(LineObj.filterMessage()).toBe(true);
    });
  });
});

describe('LinePMBook', () => {
  describe('formatMoney()', () => {
    it('Success', () => {
      const price = 1000;
      const result = '1,000';
      expect(LinePMBook.formatMoney(price)).toBe(result);
    });
  });
});
