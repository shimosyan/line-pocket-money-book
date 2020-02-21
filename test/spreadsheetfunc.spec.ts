//cSpell:ignore linepmbook, spreadsheetfunc
import { SpreadsheetFunc } from '../src/spreadsheetfunc';
import { LinePMBookData, LinePMBook } from '../src/linepmbook';
import { SpreadSheet } from './spreadsheet.mock';

SpreadsheetApp['getActiveSpreadsheet'] = jest.fn().mockImplementation(() => new SpreadSheet());
Logger['log'] = jest.fn().mockImplementation(object => console.log(object));
declare let Moment;
// eslint-disable-next-line @typescript-eslint/no-var-requires
Moment['moment'] = jest.fn(args => require('moment')(args));

LinePMBook['getUSDRate'] = jest.fn().mockReturnValue(111.3);

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
        text: '',
        type: 'text'
      },
      timestamp: 154700000000
    }
  ]
};

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

describe('SpreadsheetFunc', () => {
  describe('getAggregatePrice()', () => {
    it('Success - this month', () => {
      contents.events[0].message.text = 'いくら';
      const LineObj = new LinePMBookData(contents);
      const SheetObj = new SpreadsheetFunc();
      const result = 630;
      expect(SheetObj.getAggregatePrice(LineObj)).toBe(result);
    });

    it('Success - last month', () => {
      contents.events[0].message.text = '先月';
      const LineObj = new LinePMBookData(contents);
      const SheetObj = new SpreadsheetFunc();
      const result = 7800;
      expect(SheetObj.getAggregatePrice(LineObj, 1)).toBe(result);
    });
  });

  describe('deleteLastData()', () => {
    it('Success', () => {
      contents.events[0].message.text = '取り消し';
      const LineObj = new LinePMBookData(contents);
      const SheetObj = new SpreadsheetFunc();
      SheetObj.deleteLastData(LineObj);

      let date = new Date();
      date.setMonth(date.getMonth() - 1);
      const result = [[Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', '服代', '7800']];

      date = new Date();
      date.setDate(10);
      result.push([Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', 'お茶', '150']);

      expect(SheetObj.sheet.getDataRange().getValues()).toEqual(result);
      expect(LineObj.price).toBe(480);
      expect(LineObj.shop).toBe('昼食代');
    });
  });

  describe('addData()', () => {
    it('Success - 1', () => {
      contents.events[0].message.text = '800\nスタバ';
      const LineObj = new LinePMBookData(contents);
      const SheetObj = new SpreadsheetFunc();
      SheetObj.addData(LineObj);

      let date = new Date();
      date.setMonth(date.getMonth() - 1);
      const result = [[Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', '服代', '7800']];

      date = new Date();
      date.setDate(10);
      result.push([Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', 'お茶', '150']);

      date = new Date();
      date.setDate(12);
      result.push([Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', '昼食代', '480']);

      result.push([Moment.moment().format(), 'u123456789', 'スタバ', '800']);

      expect(SheetObj.sheet.getDataRange().getValues()).toEqual(result);
    });

    it('Success - 2', () => {
      contents.events[0].message.text = '8000\n12/25プレゼント';
      const LineObj = new LinePMBookData(contents);
      const SheetObj = new SpreadsheetFunc();
      SheetObj.addData(LineObj);

      let date = new Date();
      date.setMonth(date.getMonth() - 1);
      const result = [[Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', '服代', '7800']];

      date = new Date();
      date.setDate(10);
      result.push([Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', 'お茶', '150']);

      date = new Date();
      date.setDate(12);
      result.push([Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', '昼食代', '480']);

      result.push([Moment.moment().format(), 'u123456789', '12/25プレゼント', '8000']);

      expect(SheetObj.sheet.getDataRange().getValues()).toEqual(result);
    });

    it('Success - 3', () => {
      contents.events[0].message.text = '12/25プレゼント\n8000';
      const LineObj = new LinePMBookData(contents);
      const SheetObj = new SpreadsheetFunc();
      SheetObj.addData(LineObj);

      let date = new Date();
      date.setMonth(date.getMonth() - 1);
      const result = [[Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', '服代', '7800']];

      date = new Date();
      date.setDate(10);
      result.push([Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', 'お茶', '150']);

      date = new Date();
      date.setDate(12);
      result.push([Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', '昼食代', '480']);

      result.push([Moment.moment().format(), 'u123456789', '12/25プレゼント', '8000']);

      expect(SheetObj.sheet.getDataRange().getValues()).toEqual(result);
    });

    it('Success - 4', () => {
      contents.events[0].message.text = '水\n3ドル';
      const LineObj = new LinePMBookData(contents);
      const SheetObj = new SpreadsheetFunc();
      SheetObj.addData(LineObj);

      let date = new Date();
      date.setMonth(date.getMonth() - 1);
      const result = [[Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', '服代', '7800']];

      date = new Date();
      date.setDate(10);
      result.push([Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', 'お茶', '150']);

      date = new Date();
      date.setDate(12);
      result.push([Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', '昼食代', '480']);

      result.push([Moment.moment().format(), 'u123456789', '水', '334']);

      expect(SheetObj.sheet.getDataRange().getValues()).toEqual(result);
    });

    it('Success - 5', () => {
      contents.events[0].message.text = '2.5ドル\n31アイス';
      const LineObj = new LinePMBookData(contents);
      const SheetObj = new SpreadsheetFunc();
      SheetObj.addData(LineObj);

      let date = new Date();
      date.setMonth(date.getMonth() - 1);
      const result = [[Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', '服代', '7800']];

      date = new Date();
      date.setDate(10);
      result.push([Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', 'お茶', '150']);

      date = new Date();
      date.setDate(12);
      result.push([Func.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', '昼食代', '480']);

      result.push([Moment.moment().format(), 'u123456789', '31アイス', '278']);

      expect(SheetObj.sheet.getDataRange().getValues()).toEqual(result);
    });
  });
});
