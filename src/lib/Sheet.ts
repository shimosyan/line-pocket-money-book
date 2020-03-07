import { Define } from '../define';
import { SpreadSheet, Sheet as MockSheet } from '../../test/spreadsheet.mock';

export type SheetValue = string | number | boolean | Date;

export class Sheet {
  private readonly sheet: GoogleAppsScript.Spreadsheet.Sheet | MockSheet;
  constructor(spreadsheet?: SpreadSheet) {
    if (spreadsheet) {
      const spreadsheet = new SpreadSheet();
      this.sheet = spreadsheet.sheet1;
    } else {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = spreadsheet.getSheetByName(Define.spreadsheetName);
      if (sheet === null) throw new Error('Sheet Not Found.');
      this.sheet = sheet;
    }
  }

  public getSheetData = (): SheetValue[][] => {
    return this.sheet.getDataRange().getValues();
  };

  public addShopData = (date: string, userId: string, shop: string, price: number): void => {
    const lastRow = this.sheet.getLastRow();
    const maxRow = this.sheet.getMaxRows();

    if (maxRow <= lastRow) {
      this.sheet.insertRows(lastRow);
    }

    const row = lastRow + 1;
    const data: SheetValue[][] = [[date, userId, shop, String(price)]];
    this.sheet.getRange(row, 1, 1, 4).setValues(data);
  };

  public deleteLastData = (userId: string): { shop: string; price: number } => {
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
      if (line[1] == userId) {
        breakFlg = true;
      }

      row--;
    });

    data.reverse();
    const shop = String(data[row][2]);
    const price = Number(data[row][3]);

    this.sheet.deleteRow(row + 1);
    console.log(`[Delete] Row: ${row + 1}`);

    return {
      shop: shop,
      price: price
    };
  };
}
