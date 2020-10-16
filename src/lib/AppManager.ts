//cSpell:ignore camelcase, USDJPY, unfollow
import ContentService = GoogleAppsScript.Content.TextOutput;
import Event = GoogleAppsScript.Events.DoPost;
import { JobManager, MessageParam } from './JobManager';
import { LineSendedData } from '../@types/Line';

export class AppManager {
  private event: LineSendedData;
  constructor(json: Event) {
    this.event = JSON.parse(json.postData.contents) as LineSendedData;
  }

  public isCorrect = (jobManager: JobManager): boolean => {
    if (this.event.events.length !== 1) return false;

    if (this.event.events[0].type !== 'message') return false;
    if (this.event.events[0].mode !== 'active') return false;
    if (this.event.events[0].message.type !== 'text') return false;

    const messageParam: MessageParam = {
      message: this.event.events[0].message.text,
      userId: this.event.events[0].source.userId || '',
      replyToken: this.event.events[0].replyToken,
    };

    return jobManager.isExistJob(messageParam);
  };

  public getResponseData = (): ContentService => {
    return ContentService.createTextOutput(JSON.stringify({ content: 'post ok' })).setMimeType(
      ContentService.MimeType.JSON
    );
  };
}
