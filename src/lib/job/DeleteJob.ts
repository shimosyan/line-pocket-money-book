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

// cSpell:ignore : torikesi, torikeshi

type ShopData = {
  shop: string;
  price: number;
};

export class DeleteJob implements JobInterface {
  private userId = '';
  private replyToken = '';

  constructor(private line: Line, private sheet: Sheet) {}

  public check = (messageParam: MessageParam): boolean => {
    // 「取り消し」
    if (messageParam.message.match(/^(取り消し|とりけし|取消|torikesi|torikeshi)/i)) {
      this.userId = messageParam.userId;
      this.replyToken = messageParam.replyToken;
      return true;
    }

    return false;
  };

  public run = (): void => {
    let shopData: ShopData;

    try {
      shopData = this.sheet.deleteLastData(this.userId) as ShopData;
    } catch (error) {
      this.line.sendMessage('削除に失敗しました', this.replyToken);
      return;
    }
    const message = `${shopData.shop}: ${Format.formatMoney(
      shopData.price,
      0
    )}円の記録を削除しました。`;

    this.line.sendMessage(message, this.replyToken);
  };
}
