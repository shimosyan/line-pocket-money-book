import { Define } from '../src/define';

export class SpreadSheet {
  public sheet1;
  constructor() {
    let date = new Date();
    date.setMonth(date.getMonth() - 1);
    let data = [[this.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', '服代', '7800']];

    date = new Date();
    date.setDate(10);
    data.push([this.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', 'お茶', '150']);

    date.setDate(12);
    data.push([this.dateFormat(date) + 'T00:00:00+09:00', 'u123456789', '昼食代', '480']);

    this.sheet1 = new Sheet(data);
  }

  public getSheetByName = (name): any => {
    switch (name) {
      case Define.spreadsheet_name:
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

class Sheet {
  public data;

  constructor(input) {
    this.data = input;
  }

  public getDataRange = (): Range => {
    return new Range(this.data);
  };

  public getRange = (
    start_row: number,
    start_col: number,
    range_row?: number,
    range_col?: number
  ): Range => {
    if (this.data.length < start_row) {
      for (let i = 0; i < start_row - this.data.length; i++) {
        this.data.push([]);
      }
    }
    return new Range(this.data, start_row, start_col, range_row, range_col);
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

class Range {
  public data;
  private start_row;
  private start_col;
  private range_row;
  private range_col;

  constructor(input: any, row?: number, col?: number, ran_row?: number, ran_col?: number) {
    this.data = input;

    if (row !== undefined) {
      this.start_row = row - 1;
    } else {
      this.start_row = 0;
    }

    if (col !== undefined) {
      this.start_col = col - 1;
    } else {
      this.start_col = 0;
    }

    if (ran_row !== undefined) {
      this.range_row = this.start_row + ran_row;
    } else {
      this.range_row = input.length;
    }

    if (ran_col !== undefined) {
      this.range_col = this.start_col + ran_col;
    } else {
      this.range_col = input[0].length;
    }
  }

  public getValue = (): any => {
    return this.data[this.start_row][this.start_col];
  };

  public getValues = (): any => {
    var response = [],
      res_col = [];
    for (var r = this.start_row; r < this.range_row; r++) {
      res_col = [];
      for (var c = this.start_col; c < this.range_col; c++) {
        res_col.push(String(this.data[r][c]));
      }
      response.push(res_col);
    }
    return response;
  };

  public setValue = (input: string | number): void => {
    for (var r = this.start_row; r < this.range_row; r++) {
      for (var c = this.start_col; c < this.range_col; c++) {
        this.data[r][c] = input;
      }
    }
  };

  public setValues = (input: [[string | number]]): void => {
    var count_r = 0,
      count_c = 0;
    for (var r = this.start_row; r < this.range_row; r++) {
      count_c = 0;
      for (var c = this.start_col; c < this.range_col; c++) {
        this.data[r][c] = input[count_r][count_c];
        count_c++;
      }

      count_r++;
    }
  };
}
