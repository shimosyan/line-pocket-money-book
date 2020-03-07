import { MessageParam } from '../JobManager';
import { JobFunction } from '../JobManager';

export interface JobInterface {
  check(messageParam: MessageParam, callback: JobFunction): boolean;
  run(): void;
}
