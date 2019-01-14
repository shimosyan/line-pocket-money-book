import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import { Define } from './define';
import { LinePMBookData } from './linepmbook';

declare let Moment: any;

export class SpreadsheetFunc {
  ss: Spreadsheet;
  sheet: Sheet;

  constructor() {
    this.ss = SpreadsheetApp.getActiveSpreadsheet();
    this.sheet = this.ss.getSheetByName(Define.spreadsheet_name);
  }

  public getAggregatePrice = (LineData: LinePMBookData, month: number = 0): number => {
    let date = Moment.moment();
    date.add(month, 'months');

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

  public addData = (LineData: LinePMBookData): LinePMBookData => {
    LineData.message.split(/\r?\n/).forEach(line => {
      if (!LineData.price && line.match(/^\\?([\d,]+)/)) {
        return (LineData.price = line.replace(/\D/g, ''));
      }
      if (!LineData.shop && line.match(/^[^\d]/)) {
        return (LineData.shop = line);
      }
    });

    let row: number = this.sheet.getLastRow() + 1;
    let data: Object[][] = [
      [Moment.moment().format(), LineData.uid, LineData.shop, LineData.price]
    ];

    this.sheet.getRange(row, 1, 1, 4).setValues(data);

    return LineData;
  };

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
