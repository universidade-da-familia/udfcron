import { CronJob } from 'cron';

import orderFunction from '../functions/orders';

const auth = (): void => {
  const Job6 = new CronJob(
    '0 0 6 * * *',
    async () => {
      await orderFunction();
    },
    null,
    true,
    'America/Sao_Paulo',
  );

  const Job12 = new CronJob(
    '0 0 12 * * *',
    async () => {
      await orderFunction();
    },
    null,
    true,
    'America/Sao_Paulo',
  );

  const JobNow = new CronJob(
    '0 18 12 * * *',
    async () => {
      await orderFunction();
    },
    null,
    true,
    'America/Sao_Paulo',
  );

  Job6.start();
  Job12.start();
  JobNow.start();
};

export default auth;
