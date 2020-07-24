import { CronJob } from 'cron';

import orderFunction from '../functions/orders';

const auth = (): void => {
  const Job = new CronJob(
    '0 */2 * * * *',
    async () => {
      await orderFunction();
    },
    null,
    true,
    'America/Sao_Paulo',
  );

  Job.start();
};

export default auth;
