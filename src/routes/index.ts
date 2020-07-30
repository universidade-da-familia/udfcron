import { Router } from 'express';

import trackingCodeRouter from './trackingcode.routes';

const routes = Router();

routes.use('/trackingcode', trackingCodeRouter);

export default routes;
