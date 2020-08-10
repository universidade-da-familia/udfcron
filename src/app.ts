import 'dotenv/config';

import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import bodyParser from 'body-parser';

import routes from './routes';
// import authJob from './jobs/auth';
import ordersJob from './jobs/orders';

ordersJob();
// authJob();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(routes);

export default app;
