// cSpell:ignore camelcase
// eslint-disable-next-line @typescript-eslint/camelcase
import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;
import { Define } from '../define';

export class Line {
  private endpoint = Define.lineEndpoint;
  private apiToken = Define.lineApiToken;

  public sendMessage = (message: string, replyToken?: string): void => {
    const option: URLFetchRequestOptions = {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: 'Bearer ' + this.apiToken
      },
      method: 'post',
      payload: JSON.stringify({
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: message
          }
        ]
      })
    };

    UrlFetchApp.fetch(this.endpoint, option);
  };
}
