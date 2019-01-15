import ContentService = GoogleAppsScript.Content.TextOutput;
import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions; //UrlFetchApp.fetchでオプションを指定するときに必要
import { Define } from './define';
import { LinePMBookData, LinePMBook } from './linepmbook';
import { SpreadsheetFunc } from './spreadsheetfunc';

declare let global: any;
declare let process: any;

// プロジェクト同梱の.env.sampleを.envにコピーして、そこにLINEの情報を入れてビルドしてね
const LINE_TOKEN: string = process.env.LINE_TOKEN;

global.doPost = (e: any): ContentService => {
  console.log(JSON.parse(e.postData.contents));
  let LineObj = new LinePMBookData(JSON.parse(e.postData.contents));
  if (typeof LineObj.reply_token === 'undefined') {
    return LinePMBook.responseData();
  }

  if (LineObj.type != 'message') {
    return LinePMBook.responseData();
  }

  if (!LineObj.filterMessage()) {
    return LinePMBook.responseData();
  }

  let SheetObj = new SpreadsheetFunc();

  let response: string = '';

  if (LineObj.message.match(/^(いくら|幾ら|イクラ|ikura)/i)) {
    response =
      'あなたは今月' +
      LinePMBook.formatMoney(SheetObj.getAggregatePrice(LineObj)) +
      '円使いました。';
  } else if (LineObj.message.match(/^(先月|せんげつ|sengetsu)/i)) {
    response =
      'あなたは先月' +
      LinePMBook.formatMoney(SheetObj.getAggregatePrice(LineObj), 1) +
      '円使いました。';
  } else if (LineObj.message.match(/^(取り消し|とりけし|取消|torikesi|torikeshi)/i)) {
    LineObj = SheetObj.deleteLastData(LineObj);

    response =
      LineObj.shop + ': ' + LinePMBook.formatMoney(LineObj.price, 0) + '円の記録を削除しました。';
  } else {
    LineObj = SheetObj.addData(LineObj);
    response =
      LineObj.shop + ': ' + LinePMBook.formatMoney(LineObj.price, 0) + '円で登録しました。';
  }

  // メッセージを返信
  let option: URLFetchRequestOptions = {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: 'Bearer ' + LINE_TOKEN
    },
    method: 'post',
    payload: JSON.stringify({
      replyToken: LineObj.reply_token,
      messages: [
        {
          type: 'text',
          text: response
        }
      ]
    })
  };
  UrlFetchApp.fetch(Define.line_endpoint, option);

  return LinePMBook.responseData();
};
