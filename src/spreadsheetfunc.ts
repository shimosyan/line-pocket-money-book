//cSpell:ignore linepmbook
import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import { Define } from './define';
import { LinePMBookData, LinePMBook } from './linepmbook';

import * as moment from 'moment';
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Moment {
  function moment(
    inp?: moment.MomentInput,
    format?: moment.MomentFormatSpecification,
    strict?: boolean
  ): moment.Moment;
  function moment(
    inp?: moment.MomentInput,
    format?: moment.MomentFormatSpecification,
    language?: string,
    strict?: boolean
  ): moment.Moment;
}

type SheetValue = string | number | boolean | Date;

export class SpreadsheetFunc {
  ss: Spreadsheet;
  sheet: Sheet;

  constructor() {
    this.ss = SpreadsheetApp.getActiveSpreadsheet();
    this.sheet = this.ss.getSheetByName(Define.spreadsheet_name);
  }

  /**
   * スプレッドシートから金額を集計する
   * @param {LinePMBookData} LineData Lineから入力されたメッセージデータ
   * @param {number} month            現在から数えて何ヶ月前で金額を集計するか指定する(デフォルトは0 = 現在)
   * @return {number}                 金額
   */
  public getAggregatePrice = (LineData: LinePMBookData, month = 0): number => {
    const date = Moment.moment();
    date.add(month * -1, 'months');

    const data: SheetValue[][] = this.sheet.getDataRange().getValues();
    return Number(
      data
        .filter(
          line =>
            line[1] == LineData.uid &&
            date.format('YYYY-MM') == Moment.moment(String(line[0])).format('YYYY-MM')
        )
        .map(line => line[3])
        .reduce((total, line) => Number(total) + Number(line))
    );
  };

  /**
   * スプレッドシートにデータを追加する
   * @param {LinePMBookData} LineData Lineから入力されたメッセージデータ
   * @return {LinePMBookData}
   */
  public addData = (LineData: LinePMBookData): LinePMBookData => {
    LineData.message.split(/\r?\n/).forEach(line => {
      if (line === '') {
        return;
      }
      if (!LineData.price && line.match(/^\\?[\d,\.]+(円|ドル)?$/)) {
        // ドルが指定されていた場合は為替レートを取得する
        if (line.match(/^\\?[\d,\.]+ドル?$/)) {
          const rate = LinePMBook.getUSDRate();
          if (rate === 0) {
            return (LineData.error = '為替レートの取得に失敗しました。');
          }
          // ドルを日本円に直したものを返す
          return (LineData.price = Math.round(Number(line.replace(/[^\.\d]/g, '')) * rate));
        }

        return (LineData.price = Number(line.replace(/[^\.\d]/g, '')));
      }
      if (!LineData.shop && !line.match(/^\\?[\d,\.]+(円|ドル)?$/)) {
        return (LineData.shop = line);
      }
    });

    if (LineData.error) {
      return LineData;
    }

    const row: number = this.sheet.getLastRow() + 1;
    const data: SheetValue[][] = [
      [Moment.moment().format(), LineData.uid, LineData.shop, String(LineData.price)]
    ];

    try {
      this.sheet.getRange(row, 1, 1, 4).setValues(data);
    } catch (e) {
      LineData.error = '記録に失敗しました。';
    }

    return LineData;
  };

  /**
   * スプレッドシートから入力されたユーザーの直近のデータを削除する。
   * @param {LinePMBookData} LineData Lineから入力されたメッセージデータ
   * @return {LinePMBookData}
   */
  public deleteLastData = (LineData: LinePMBookData): LinePMBookData => {
    const data: SheetValue[][] = this.sheet
      .getDataRange()
      .getValues()
      .reverse();
    let row: number = data.length;

    let breakFlg = false;

    data.forEach(line => {
      if (breakFlg) {
        return;
      }
      console.log(line);
      if (line[1] == LineData.uid) {
        breakFlg = true;
      }

      row--;
    });
    console.log(row);

    data.reverse();
    LineData.shop = String(data[row][2]);
    LineData.price = Number(data[row][3]);

    this.sheet.deleteRow(row + 1);

    return LineData;
  };
}
