export class Define {
  static lineEndpoint = 'https://api.line.me/v2/bot/message/reply';
  static lineApiToken = process.env.LINE_TOKEN; // プロジェクト同梱の.env.sampleを.envにコピーして、そこにLINEの情報を入れてビルドしてね
  static spreadsheetName = '管理シート';

  static usdRateApiEndpoint = 'https://www.gaitameonline.com/rateaj/getrate';
}
