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

  const JobTeste = new CronJob(
    '0 25 12 * * *',
    async () => {
      await orderFunction();
    },
    null,
    true,
    'America/Sao_Paulo',
  );

  Job6.start();
  Job12.start();
  JobTeste.start();
};

export default auth;
