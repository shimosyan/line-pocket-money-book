import { MessageParam } from '../JobManager';
import { JobInterface } from './JobInterface';
import { Sheet } from '../Sheet';
import { Line } from '../Line';
import * as Format from '../Format';

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

// cSpell:ignore : ikura, sengetsu

export class AggregateJob implements JobInterface {
  private userId = '';
  private replyToken = '';
  private offsetMonth: {
    num: number;
    text: string;
  } = { num: 0, text: '' };

  constructor(private line: Line, private sheet: Sheet) {}

  public check = (messageParam: MessageParam): boolean => {
    // 「いくら」
    if (messageParam.message.match(/^(いくら|幾ら|イクラ|ikura)/i)) {
      this.offsetMonth = {
        num: 0,
        text: '今月'
      };
      this.userId = messageParam.userId;
      this.replyToken = messageParam.replyToken;
      return true;
    }
    // 「先月」
    if (messageParam.message.match(/^(先月|せんげつ|sengetsu)/i)) {
      this.offsetMonth = {
        num: -1,
        text: '先月'
      };
      this.userId = messageParam.userId;
      this.replyToken = messageParam.replyToken;
      return true;
    }
    return false;
  };

  public run = (): void => {
    let price;

    try {
      price = this.getAggregatePrice();
    } catch (error) {
      this.line.sendMessage('集計に失敗しました', this.replyToken);
      return;
    }

    const message = `あなたは${this.offsetMonth.text}${Format.formatMoney(price)}円使いました。`;

    this.line.sendMessage(message, this.replyToken);
  };

  private getAggregatePrice = (): number => {
    const date = Moment.moment();
    date.add(this.offsetMonth.num, 'months');

    const data = this.sheet.getSheetData();
    return Number(
      data
        .filter(
          row =>
            row[1] == this.userId &&
            date.format('YYYY-MM') == Moment.moment(String(row[0])).format('YYYY-MM')
        )
        .map(row => row[3])
        .reduce((total, row) => Number(total) + Number(row))
    );
  };
}
