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

// cSpell:ignore : kensaku

type ShopData = {
  date: Date;
  shop: string;
  price: number;
};

export class SearchJob implements JobInterface {
  private userId = '';
  private replyToken = '';
  private message = '';

  constructor(private line: Line, private sheet: Sheet) {}

  public check = (messageParam: MessageParam): boolean => {
    // 1行目が「検索」で複数行ある
    if (messageParam.message.match(/^(検索|けんさく|kensaku)\r?\n?(.|\r|\n)*/)) {
      this.userId = messageParam.userId;
      this.replyToken = messageParam.replyToken;
      this.message = messageParam.message;
      return true;
    }

    return false;
  };

  public run = (): void => {
    const splitMessage = this.message.split(/\r?\n/);
    if (splitMessage.length === 1) {
      const message = `Tips: 直近3ヶ月の履歴で検索したいキーワードを2行目に入力してください。`;

      this.line.sendMessage(message, this.replyToken);
      return;
    }

    const since = Moment.moment().subtract(3, 'month');
    const shopData = this.getSearchResultShopData(since.toDate(), splitMessage[1]);

    if (shopData.length === 0) {
      const message = `${since.format('YYYY/MM/DD')} 以降の'${
        splitMessage[1]
      }'を含む検索結果はありません。`;

      this.line.sendMessage(message, this.replyToken);
      return;
    }

    const shopDataText = shopData.reverse().map((item) => {
      const date = Moment.moment(item.date).format('YYYY/MM/DD');
      return `${date} : ${item.shop} : ${Format.formatMoney(item.price, 0)}円`;
    });

    const message = `${since.format('YYYY/MM/DD')} 以降の'${
      splitMessage[1]
    }'を含む検索結果です。\n\n${shopDataText.join('\n')}`;

    this.line.sendMessage(message, this.replyToken);
  };

  private getSearchResultShopData = (since: Date, search: string): ShopData[] => {
    const date = Moment.moment(since);
    const regExp = new RegExp(search);

    const data = this.sheet.getSheetData();

    return data
      .filter((item) => {
        return (
          item[1] == this.userId &&
          Moment.moment(item[0] as Date).isAfter(date) &&
          String(item[2]).match(regExp)
        );
      })
      .map((item) => {
        return {
          date: item[0],
          shop: item[2],
          price: item[3],
        } as ShopData;
      });
  };
}
