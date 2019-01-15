import ContentService = GoogleAppsScript.Content.TextOutput;

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

export class LinePMBookData {
  private json: LineSendData;
  public message: string;
  public uid: string;
  public reply_token: string;
  public type: string;

  public shop: string;
  public price: number | string;

  constructor(event: LineSendData) {
    this.json = event;

    this.reply_token = this.json.events[0].replyToken;
    this.type = this.json.events[0].type;

    this.message = this.json.events[0].message.text;
    this.uid = this.json.events[0].source.userId;
  }

  public filterMessage = (): boolean => {
    // 一行目が金額で始まっている
    if (this.message.match(/^\\?[\d,]+円?\s/)) {
      return true;
    }
    // 全体が2行で2行目が金額
    if (this.message.match(/^[^\r\n]+\r?\n\\?[\d,]+円?[\r\n]*$/)) {
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
  static responseData = (): ContentService => {
    return ContentService.createTextOutput('ok');
  };

  static formatMoney = (
    n: number | string,
    c: number = 0,
    d: string = '.',
    t: string = ','
  ): string => {
    var s = n < 0 ? '-' : '',
      i = String(parseInt((n = Math.abs(Number(n) || 0).toFixed(c)))),
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
}
