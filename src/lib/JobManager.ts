import { Line } from './Line';
import { Sheet } from './Sheet';
import { AggregateJob } from './job/AggregateJob';
import { InsertJob } from './job/InsertJob';
import { DeleteJob } from './job/DeleteJob';

export type MessageParam = {
  message: string;
  userId: string;
  replyToken: string;
};

export interface JobFunction {
  (): void;
}

export class JobManager {
  public jobRun: JobFunction = (): void => {
    return;
  };

  public isExistJob = (messageElement: MessageParam): boolean => {
    const line = new Line();
    const sheet = new Sheet();

    const aggregateJob = new AggregateJob(line, sheet);
    if (aggregateJob.check(messageElement)) {
      this.jobRun = aggregateJob.run;
      return true;
    }

    const insertJob = new InsertJob(line, sheet);
    if (insertJob.check(messageElement)) {
      this.jobRun = insertJob.run;
      return true;
    }

    const deleteJob = new DeleteJob(line, sheet);
    if (deleteJob.check(messageElement)) {
      this.jobRun = deleteJob.run;
      return true;
    }
    return false;
  };
}
