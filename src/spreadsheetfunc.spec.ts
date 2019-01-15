import { SpreadsheetFunc } from './spreadsheetfunc';
import { LinePMBookData } from './linepmbook';
import { SpreadSheet } from './spreadsheet.mock';

jest.unmock('./spreadsheetfunc');
SpreadsheetApp['getActiveSpreadsheet'] = jest.fn(() => new SpreadSheet());
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
        text: '',
        type: 'text'
      },
      timestamp: 154700000000
    }
  ]
};

describe('SpreadsheetFunc', () => {
  describe('getAggregatePrice()', () => {
    it('Success - this month', () => {
      contents.events[0].message.text = 'いくら';
      let LineObj = new LinePMBookData(contents);
      let SheetObj = new SpreadsheetFunc();
      const result = 630;
      expect(SheetObj.getAggregatePrice(LineObj)).toBe(result);
    });

    it('Success - last month', () => {
      contents.events[0].message.text = '先月';
      let LineObj = new LinePMBookData(contents);
      let SheetObj = new SpreadsheetFunc();
      const result = 7800;
      expect(SheetObj.getAggregatePrice(LineObj, 1)).toBe(result);
    });
  });

  describe('deleteLastData()', () => {
    it('Success', () => {
      contents.events[0].message.text = '取り消し';
      let LineObj = new LinePMBookData(contents);
      let SheetObj = new SpreadsheetFunc();
      SheetObj.deleteLastData(LineObj);

      var date = new Date();
      date.setMonth(date.getMonth() - 1);
      let result = [[Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', '服代', '7800']];

      date = new Date();
      date.setDate(10);
      result.push([Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', 'お茶', '150']);

      expect(SheetObj.sheet.getDataRange().getValues()).toEqual(result);
      expect(LineObj.price).toBe(480);
      expect(LineObj.shop).toBe('昼食代');
    });
  });

  describe('addData()', () => {
    it('Success', () => {
      contents.events[0].message.text = '800\nスタバ';
      let LineObj = new LinePMBookData(contents);
      let SheetObj = new SpreadsheetFunc();
      SheetObj.addData(LineObj);

      var date = new Date();
      date.setMonth(date.getMonth() - 1);
      let result = [[Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', '服代', '7800']];

      date = new Date();
      date.setDate(10);
      result.push([Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', 'お茶', '150']);

      date = new Date();
      date.setDate(12);
      result.push([Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', '昼食代', '480']);

      result.push([Moment.moment().format(), 'u123456789', 'スタバ', '800']);

      expect(SheetObj.sheet.getDataRange().getValues()).toEqual(result);
    });
  });
});

class Func {
  static dateFormat = (date: Date): string => {
    return (
      date.getFullYear() +
      '-' +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + date.getDate()).slice(-2)
    );
  };
}
