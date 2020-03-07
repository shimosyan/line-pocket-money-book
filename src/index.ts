import ContentService = GoogleAppsScript.Content.TextOutput;
import Event = GoogleAppsScript.Events.DoPost;
import { AppManager } from './lib/AppManager';
import { JobManager } from './lib/JobManager';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const global: any;

global.doPost = (event: Event): ContentService => {
  console.log(JSON.parse(event.postData.contents));

  const jobManager = new JobManager();
  const appManager = new AppManager(event);

  if (!appManager.isCorrect(jobManager)) {
    return appManager.getResponseData();
  }

  jobManager.jobRun();

  return appManager.getResponseData();
};
