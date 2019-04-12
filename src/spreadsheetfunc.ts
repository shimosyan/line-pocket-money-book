import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import { Define } from './define';
import { LinePMBookData, LinePMBook } from './linepmbook';

declare let Moment: any;

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
  public getAggregatePrice = (LineData: LinePMBookData, month: number = 0): number => {
    let date = Moment.moment();
    date.add(month * -1, 'months');

    let data: Object[][] = this.sheet.getDataRange().getValues();
    let score: number = 0;

    data.forEach(line => {
      console.log(line);
      let data_date = Moment.moment(line[0]);
      if (line[1] == LineData.uid && date.format('YYYY-MM') == data_date.format('YYYY-MM')) {
        score += Number(line[3]);
      }
    });

    return score;
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
      if (!LineData.price && line.match(/^\\?\d+(円|ドル)?$/)) {
        // ドルが指定されていた場合は為替レートを取得する
        if (line.match(/^\\?\d+ドル?$/)) {
          let rate = LinePMBook.getUSDRate();
          if (rate === 0) {
            return (LineData.error = '為替レートの取得に失敗しました。');
          }
          // ドルを日本円に直したものを返す
          return (LineData.price = Math.round(Number(line.replace(/\D/g, '')) * rate));
        }

        return (LineData.price = Number(line.replace(/\D/g, '')));
      }
      if (!LineData.shop && !line.match(/^\\?\d+(円|ドル)?$/)) {
        return (LineData.shop = line);
      }
    });

    if (LineData.error) {
      return LineData;
    }

    let row: number = this.sheet.getLastRow() + 1;
    let data: Object[][] = [
      [Moment.moment().format(), LineData.uid, LineData.shop, LineData.price]
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
    let data: Object[][] = this.sheet
      .getDataRange()
      .getValues()
      .reverse();
    let row: number = data.length;

    let break_flg: boolean = false;

    data.forEach(line => {
      if (break_flg) {
        return;
      }
      console.log(line);
      if (line[1] == LineData.uid) {
        break_flg = true;
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
