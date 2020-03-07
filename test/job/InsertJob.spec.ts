import { SpreadSheet } from '../spreadsheet.mock';
import { InsertJob, ShopData } from '../../src/lib/job/InsertJob';
import { Line } from '../../src/lib/Line';
import { Sheet } from '../../src/lib/Sheet';

describe('InsertJob', () => {
  describe('getShopData', () => {
    it('success', () => {
      const spreadsheet = new SpreadSheet();
      const line = new Line();
      const sheet = new Sheet(spreadsheet);
      const insertJob = new InsertJob(line, sheet);

      insertJob['message'] = '昼食代\n1000';

      const result: ShopData = {
        shop: '昼食代',
        price: 1000
      };

      expect(insertJob['getShopData']()).toEqual(result);
    });
  });
});
