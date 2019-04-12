import { LinePMBookData, LinePMBook } from './linepmbook';

jest.unmock('./linepmbook');
Logger['log'] = jest.fn(object => console.log(object));
declare let Moment;
Moment['moment'] = jest.fn(args => require('moment')(args));

let contents = {
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
      let LineObj = new LinePMBookData(contents);
      expect(LineObj.message).toBe('昼食代\n1000');
      expect(LineObj.type).toBe('message');
      expect(LineObj.reply_token).not.toBeUndefined();
    });
  });

  describe('filterMessage()', () => {
    it('Success - case1', () => {
      let LineObj = new LinePMBookData(contents);
      expect(LineObj.filterMessage()).toBe(true);
    });

    it('Success - case2', () => {
      contents.events[0].message.text = '800\nスタバ';
      let LineObj = new LinePMBookData(contents);
      expect(LineObj.filterMessage()).toBe(true);
    });

    it('Success - case3', () => {
      contents.events[0].message.text = 'いくら';
      let LineObj = new LinePMBookData(contents);
      expect(LineObj.filterMessage()).toBe(true);
    });

    it('Success - case4', () => {
      contents.events[0].message.text = '取り消し';
      let LineObj = new LinePMBookData(contents);
      expect(LineObj.filterMessage()).toBe(true);
    });

    it('Success - case5', () => {
      contents.events[0].message.text = '先月';
      let LineObj = new LinePMBookData(contents);
      expect(LineObj.filterMessage()).toBe(true);
    });

    it('Success - case6', () => {
      contents.events[0].message.text = '800';
      let LineObj = new LinePMBookData(contents);
      expect(LineObj.filterMessage()).toBe(false);
    });

    it('Success - case7', () => {
      contents.events[0].message.text = 'メッセージ';
      let LineObj = new LinePMBookData(contents);
      expect(LineObj.filterMessage()).toBe(false);
    });

    it('Success - case9', () => {
      contents.events[0].message.text = '8000\n12/25プレゼント';
      let LineObj = new LinePMBookData(contents);
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
