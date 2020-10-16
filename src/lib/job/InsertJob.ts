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

export type ShopData = {
  shop: string;
  price: number;
};

export class InsertJob implements JobInterface {
  private userId = '';
  private replyToken = '';
  private message = '';

  constructor(private line: Line, private sheet: Sheet) {}

  public check = (messageParam: MessageParam): boolean => {
    // 1行目、2行目がともに数字の場合はfalse
    if (messageParam.message.match(/^[\d,]+\r?\n\\?[\d,]+[\r\n]*$/)) {
      return false;
    }
    // 一行目が金額で始まっている
    if (messageParam.message.match(/^\\?[\d,]+(円|ドル)?\s/)) {
      this.userId = messageParam.userId;
      this.replyToken = messageParam.replyToken;
      this.message = messageParam.message;
      return true;
    }
    // 全体が2行で2行目が金額
    if (messageParam.message.match(/^[^\r\n]+\r?\n\\?[\d,]+(円|ドル)?[\r\n]*$/)) {
      this.userId = messageParam.userId;
      this.replyToken = messageParam.replyToken;
      this.message = messageParam.message;
      return true;
    }

    return false;
  };

  public run = (): void => {
    let shopData: ShopData;
    try {
      shopData = this.getShopData();
    } catch (error) {
      this.line.sendMessage(error.message, this.replyToken);
      return;
    }

    try {
      this.sheet.addShopData(Moment.moment().format(), this.userId, shopData.shop, shopData.price);
    } catch (error) {
      this.line.sendMessage('記録に失敗しました。', this.replyToken);
      return;
    }

    const message = `${shopData.shop}: ${Format.formatMoney(shopData.price, 0)}円で登録しました。`;
    this.line.sendMessage(message, this.replyToken);
  };

  private getShopData = (): ShopData => {
    let price = -1;
    let shop = '';
    let error = '';

    this.message.split(/\r?\n/).forEach((line) => {
      if (line === '') {
        return;
      }
      if (price === -1 && line.match(/^\\?[\d,]+(円|ドル)?$/)) {
        // ドルが指定されていた場合は為替レートを取得する
        if (line.match(/^\\?[\d,]+ドル?$/)) {
          const rate = Format.getUSDRate();
          if (rate === 0) {
            error = '為替レートの取得に失敗しました。';
          }
          // ドルを日本円に直したものを返す
          price = Math.round(Number(line.replace(/[^\d]/g, '')) * rate);
        }

        price = Number(line.replace(/[^\d]/g, ''));
      }
      if (shop === '' && !line.match(/^\\?[\d,]+(円|ドル)?$/)) {
        shop = line;
      }
    });

    if (error !== '') {
      throw new Error(error);
    }

    return {
      shop: shop,
      price: price,
    };
  };
}
