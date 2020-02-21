//cSpell:ignore camelcase, USDJPY
import ContentService = GoogleAppsScript.Content.TextOutput;
// eslint-disable-next-line @typescript-eslint/camelcase
import URLFetchResponse = GoogleAppsScript.URL_Fetch.HTTPResponse;
import { Define } from './define';

export type LineSendData = {
  destination: string;
  events: LineSendDataElement[];
};

type LineSendDataElement = {
  message: {
    id: number;
    text: string;
    type: string;
  };
  replyToken: string;
  source: {
    groupId: string;
    type: string;
    userId: string;
  };
  type: string;
  timestamp: number;
};

type RateObj = {
  quotes: RateObjElement[];
};

type RateObjElement = {
  high: string;
  open: string;
  bid: string;
  currencyPairCode: string;
  ask: string;
  low: string;
};

export class LinePMBookData {
  private json: LineSendData;
  public message: string;
  public uid: string;
  public replyToken: string;
  public type: string;

  public shop: string;
  public price: number;

  public error: string;

  constructor(event: LineSendData) {
    this.json = event;

    this.replyToken = this.json.events[0].replyToken;
    this.type = this.json.events[0].type;

    this.message = this.json.events[0].message.text;
    this.uid = this.json.events[0].source.userId;
  }

  /**
   * messageを正規表現で検査して既定の文字列であればtrueを返す
   * @return {boolean} 正規表現に当てはまればtrue
   */
  public filterMessage = (): boolean => {
    // 1行目、2行目がともに数字の場合はfalse
    if (this.message.match(/^[\d,\.]+\r?\n\\?[\d,]+[\r\n]*$/)) {
      return false;
    }
    // 一行目が金額で始まっている
    if (this.message.match(/^\\?[\d,\.]+(円|ドル)?\s/)) {
      return true;
    }
    // 全体が2行で2行目が金額
    if (this.message.match(/^[^\r\n]+\r?\n\\?[\d,\.]+(円|ドル)?[\r\n]*$/)) {
      return true;
    }
    // 「いくら」
    if (this.message.match(/^(いくら|幾ら|イクラ|ikura)/i)) {
      return true;
    }
    // 「先月」
    if (this.message.match(/^(先月|せんげつ|sengetsu)/i)) {
      return true;
    }
    // 「取り消し」
    if (this.message.match(/^(取り消し|とりけし|取消|torikesi|torikeshi)/i)) {
      return true;
    }
    return false;
  };
}

export class LinePMBook {
  /**
   * GoogleAppScriptのWebアプリケーション用の出力を生成する
   * @return {ContentService}
   */
  static responseData = (): ContentService => {
    return ContentService.createTextOutput(JSON.stringify({ content: 'post ok' })).setMimeType(
      ContentService.MimeType.JSON
    );
  };

  /**
   * 数値を3桁のカンマ区切りに整形する。
   * @param {number | string} n 整形対象の数値
   * @param {number} c          小数桁の指定(デフォルト0 = 小数点以下を出力しない)
   * @param {string} d          小数点の文字を指定(デフォルト.)
   * @param {string} t          桁区切りの文字を指定(デフォルト,)
   * @return {string}           整形された文字列
   */
  static formatMoney = (n: number | string, c = 0, d = '.', t = ','): string => {
    const s = n < 0 ? '-' : '',
      i = String(parseInt((n = Math.abs(Number(n) || 0).toFixed(c))));
    let j;
    j = (j = i.length) > 3 ? j % 3 : 0;

    return (
      s +
      (j ? i.substr(0, j) + t : '') +
      i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) +
      (c
        ? d +
          Math.abs(Number(n) - Number(i))
            .toFixed(c)
            .slice(2)
        : '')
    );
  };

  /**
   * 現在のドルの円相場を取得する
   * @return {number} 1ドルあたりの円
   */
  static getUSDRate = (): number => {
    const response: URLFetchResponse = UrlFetchApp.fetch(Define.USD_rate_api);
    const data: RateObj = JSON.parse(response.getContentText());
    const usdjpy = data.quotes.filter(line => {
      return line.currencyPairCode === 'USDJPY';
    });

    if (usdjpy === []) {
      return 0;
    }

    return Number(usdjpy[0].bid);
  };
}
