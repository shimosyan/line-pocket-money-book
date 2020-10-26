import URLFetchResponse = GoogleAppsScript.URL_Fetch.HTTPResponse;
import { Define } from '../define';

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

/**
 * 数値を3桁のカンマ区切りに整形する。
 * @param {number | string} n 整形対象の数値
 * @param {number} c          小数桁の指定(デフォルト0 = 小数点以下を出力しない)
 * @param {string} d          小数点の文字を指定(デフォルト.)
 * @param {string} t          桁区切りの文字を指定(デフォルト,)
 * @return {string}           整形された文字列
 */
export function formatMoney(n: number | string, c = 0, d = '.', t = ','): string {
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
}

/**
 * 現在のドルの円相場を取得する
 * @return {number} 1ドルあたりの円
 */
export function getUSDRate(): number {
  const response: URLFetchResponse = UrlFetchApp.fetch(Define.usdRateApiEndpoint);
  const data: RateObj = JSON.parse(response.getContentText());
  const usdjpy = data.quotes.filter((line) => {
    return line.currencyPairCode === 'USDJPY';
  });

  if (usdjpy === []) {
    return 0;
  }

  return Number(usdjpy[0].bid);
}
