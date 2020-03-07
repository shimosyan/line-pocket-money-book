/* eslint-disable @typescript-eslint/no-explicit-any */
import { Define } from '../src/define';
import { SheetValue } from '../src/lib/Sheet';

class Range {
  public data: any;
  private startRow: number;
  private startCol: number;
  private rangeRow: number;
  private rangeCol: number;

  constructor(input: any, row?: number, col?: number, ranRow?: number, ranCol?: number) {
    this.data = input;

    if (row !== undefined) {
      this.startRow = row - 1;
    } else {
      this.startRow = 0;
    }

    if (col !== undefined) {
      this.startCol = col - 1;
    } else {
      this.startCol = 0;
    }

    if (ranRow !== undefined) {
      this.rangeRow = this.startRow + ranRow;
    } else {
      this.rangeRow = input.length;
    }

    if (ranCol !== undefined) {
      this.rangeCol = this.startCol + ranCol;
    } else {
      this.rangeCol = input[0].length;
    }
  }

  public getValue = (): any => {
    return this.data[this.startRow][this.startCol];
  };

  public getValues = (): any => {
    const response = [];
    let resCol = [];
    for (let r = this.startRow; r < this.rangeRow; r++) {
      resCol = [];
      for (let c = this.startCol; c < this.rangeCol; c++) {
        resCol.push(String(this.data[r][c]));
      }
      response.push(resCol);
    }
    return response;
  };

  public setValue = (input: SheetValue): void => {
    for (let r = this.startRow; r < this.rangeRow; r++) {
      for (let c = this.startCol; c < this.rangeCol; c++) {
        this.data[r][c] = input;
      }
    }
  };

  public setValues = (input: SheetValue[][]): void => {
    let countR = 0,
      countC = 0;
    for (let r = this.startRow; r < this.rangeRow; r++) {
      countC = 0;
      for (let c = this.startCol; c < this.rangeCol; c++) {
        this.data[r][c] = input[countR][countC];
        countC++;
      }

      countR++;
    }
  };
}

export class Sheet {
  public data: any;

  constructor(input: any) {
    this.data = input;
  }

  public getDataRange = (): Range => {
    return new Range(this.data);
  };

  public getRange = (
    startRow: number,
    startCol: number,
    rangeRow?: number,
    rangeCol?: number
  ): Range => {
    if (this.data.length < startRow) {
      for (let i = 0; i < startRow - this.data.length; i++) {
        this.data.push([]);
      }
    }
    return new Range(this.data, startRow, startCol, rangeRow, rangeCol);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public insertRows = (row: number): void => {
    return;
  };

  public getMaxRows = (): number => {
    return 10000;
  };

  public getLastRow = (): number => {
    return this.data.length;
  };

  public getLastColumn = (): number => {
    return this.data[0].length;
  };

  public deleteRow = (row: number): void => {
    this.data.splice(row - 1, 1);
  };
}

export class SpreadSheet {
  public sheet1: Sheet;
  constructor() {
    let date = new Date();
    date.setMonth(date.getMonth() - 1);
    const data = [[this.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', '服代', '7800']];

    date = new Date();
    date.setDate(10);
    data.push([this.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', 'お茶', '150']);

    date.setDate(12);
    data.push([this.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', '昼食代', '480']);

    this.sheet1 = new Sheet(data);
  }

  public getSheetByName = (name: string): any => {
    switch (name) {
      case Define.spreadsheetName:
        return this.sheet1;
        break;
    }
  };

  private dateFormat = (date: Date): string => {
    return (
      date.getFullYear() +
      '-' +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + date.getDate()).slice(-2)
    );
  };
}
